# IssueHub - API 명세

> 문서 버전: 1.0
> 최종 수정일: 2026-03-21
> 작성자: IssueHub 개발팀
> 상태: 검토 중

---

## 1. 개요

### 1.1 기본 정보

| 항목 | 값 |
|------|-----|
| Base URL | `https://{host}/api/v1` |
| 프로토콜 | HTTPS |
| 인증 | Bearer Token (JWT) |
| Content-Type | `application/json` |
| 문자 인코딩 | UTF-8 |

### 1.2 공통 응답 포맷

모든 API는 아래 공통 응답 구조를 따른다.

**성공 응답:**

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

**에러 응답:**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ISSUE_NOT_FOUND",
    "message": "이슈를 찾을 수 없습니다.",
    "details": []
  },
  "meta": null
}
```

**단건 응답 (페이지네이션 없음):**

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": null
}
```

### 1.3 공통 에러 코드

| HTTP 상태 | 에러 코드 | 설명 |
|-----------|-----------|------|
| 400 | `INVALID_REQUEST` | 요청 파라미터 오류 |
| 401 | `UNAUTHORIZED` | 인증 실패 |
| 403 | `FORBIDDEN` | 권한 부족 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 409 | `CONFLICT` | 충돌 (동기화 버전 등) |
| 422 | `VALIDATION_ERROR` | 유효성 검사 실패 |
| 429 | `RATE_LIMIT_EXCEEDED` | 요청 빈도 초과 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

### 1.4 인증

모든 API 요청에 JWT Bearer Token이 필요하다 (웹훅 엔드포인트 제외).

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

### 1.5 페이지네이션

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | Integer | 0 | 페이지 번호 (0-based) |
| `size` | Integer | 20 | 페이지 크기 (최대 100) |
| `sort` | String | `createdAt,desc` | 정렬 기준 (필드명,방향) |

---

## 2. Issues API (이슈 관리)

### 2.1 이슈 목록 조회

이슈를 필터링, 정렬, 페이지네이션하여 조회한다.

```
GET /api/v1/issues
```

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `status` | String | N | 상태 필터 (OPEN, IN_PROGRESS, RESOLVED, CLOSED) |
| `priority` | String | N | 우선순위 필터 (CRITICAL, HIGH, MEDIUM, LOW) |
| `sourcePlatform` | String | N | 소스 플랫폼 필터 (INTERNAL, JIRA, GITHUB) |
| `assigneeId` | UUID | N | 담당자 ID |
| `teamId` | UUID | N | 팀 ID |
| `projectKey` | String | N | 프로젝트 키 |
| `label` | String | N | 라벨 필터 (다건 가능) |
| `search` | String | N | 전문 검색어 (제목, 설명) |
| `createdFrom` | ISO DateTime | N | 생성일 시작 |
| `createdTo` | ISO DateTime | N | 생성일 종료 |
| `page` | Integer | N | 페이지 번호 (기본: 0) |
| `size` | Integer | N | 페이지 크기 (기본: 20) |
| `sort` | String | N | 정렬 (기본: createdAt,desc) |

**응답 예시:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "externalId": "PROJ-123",
      "externalUrl": "https://company.atlassian.net/browse/PROJ-123",
      "sourcePlatform": "JIRA",
      "projectKey": "PROJ",
      "title": "로그인 페이지 500 에러 발생",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "issueType": "BUG",
      "assignee": {
        "id": "...",
        "displayName": "김개발",
        "avatarUrl": "..."
      },
      "team": {
        "id": "...",
        "name": "백엔드팀"
      },
      "labels": ["bug", "production"],
      "commentCount": 3,
      "syncVersion": 5,
      "dueDate": "2026-03-25T00:00:00Z",
      "createdAt": "2026-03-15T09:30:00Z",
      "updatedAt": "2026-03-20T14:22:00Z"
    }
  ],
  "error": null,
  "meta": {
    "page": 0,
    "size": 20,
    "totalElements": 142,
    "totalPages": 8
  }
}
```

**권한**: VIEWER 이상

---

### 2.2 이슈 생성

```
POST /api/v1/issues
```

**Request Body:**

```json
{
  "title": "새로운 기능 요청: 다크모드 지원",
  "description": "사용자 설정에서 다크모드를 선택할 수 있도록 해주세요.\n\n## 상세\n- 시스템 설정 연동\n- 수동 전환 토글",
  "priority": "MEDIUM",
  "issueType": "STORY",
  "assigneeId": "550e8400-e29b-41d4-a716-446655440001",
  "teamId": "550e8400-e29b-41d4-a716-446655440010",
  "labels": ["feature", "frontend"],
  "dueDate": "2026-04-15T00:00:00Z",
  "connectorId": "550e8400-e29b-41d4-a716-446655440020",
  "syncToExternal": true
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `title` | String | Y | 이슈 제목 (최대 500자) |
| `description` | String | N | 이슈 설명 (Markdown) |
| `priority` | String | N | 우선순위 (기본: MEDIUM) |
| `issueType` | String | N | 유형 (기본: TASK) |
| `assigneeId` | UUID | N | 담당자 ID |
| `teamId` | UUID | N | 팀 ID |
| `labels` | String[] | N | 라벨 배열 |
| `dueDate` | ISO DateTime | N | 마감일 |
| `connectorId` | UUID | N | 동기화할 커넥터 ID |
| `syncToExternal` | Boolean | N | 외부 플랫폼 동기화 여부 (기본: false) |

**응답**: 201 Created, 생성된 이슈 객체

**권한**: MEMBER 이상

---

### 2.3 이슈 상세 조회

```
GET /api/v1/issues/{id}
```

**Path Parameters:**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | UUID | 이슈 ID |

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "externalId": "PROJ-123",
    "externalUrl": "https://company.atlassian.net/browse/PROJ-123",
    "sourcePlatform": "JIRA",
    "projectKey": "PROJ",
    "title": "로그인 페이지 500 에러 발생",
    "description": "## 현상\n로그인 시 500 에러가 발생합니다.\n\n## 재현 절차\n1. 로그인 페이지 접속\n2. 올바른 계정 정보 입력\n3. 로그인 버튼 클릭\n4. 500 에러 발생",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "issueType": "BUG",
    "reporter": {
      "id": "...",
      "displayName": "박기획"
    },
    "assignee": {
      "id": "...",
      "displayName": "김개발"
    },
    "team": {
      "id": "...",
      "name": "백엔드팀"
    },
    "labels": ["bug", "production"],
    "metadata": {
      "jira_sprint": "Sprint 23",
      "jira_story_points": 3
    },
    "linkedIssues": [
      {
        "id": "...",
        "title": "인증 모듈 리팩토링",
        "linkType": "RELATES_TO",
        "status": "OPEN"
      }
    ],
    "syncVersion": 5,
    "syncedAt": "2026-03-20T14:22:00Z",
    "dueDate": "2026-03-25T00:00:00Z",
    "resolvedAt": null,
    "createdAt": "2026-03-15T09:30:00Z",
    "updatedAt": "2026-03-20T14:22:00Z"
  },
  "error": null,
  "meta": null
}
```

**권한**: VIEWER 이상

---

### 2.4 이슈 수정

```
PUT /api/v1/issues/{id}
```

**Request Body:**

```json
{
  "title": "로그인 페이지 500 에러 발생 (긴급)",
  "description": "...",
  "priority": "CRITICAL",
  "assigneeId": "...",
  "labels": ["bug", "production", "urgent"],
  "dueDate": "2026-03-22T00:00:00Z",
  "syncVersion": 5
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `syncVersion` | Long | Y | 낙관적 잠금용 동기화 버전 |

**응답**: 200 OK, 수정된 이슈 객체

**충돌 시**: 409 Conflict (syncVersion 불일치)

**권한**: MEMBER 이상

---

### 2.5 이슈 삭제

```
DELETE /api/v1/issues/{id}
```

논리 삭제 (Soft Delete)를 수행한다.

**응답**: 204 No Content

**권한**: MANAGER 이상

---

### 2.6 이슈 상태 변경

```
PATCH /api/v1/issues/{id}/status
```

**Request Body:**

```json
{
  "status": "RESOLVED",
  "comment": "핫픽스 배포 완료"
}
```

**응답**: 200 OK, 수정된 이슈 객체

**권한**: MEMBER 이상

---

### 2.7 이슈 담당자 배정

```
POST /api/v1/issues/{id}/assign
```

**Request Body:**

```json
{
  "assigneeId": "550e8400-e29b-41d4-a716-446655440001",
  "teamId": "550e8400-e29b-41d4-a716-446655440010"
}
```

**응답**: 200 OK

**권한**: MEMBER 이상

---

### 2.8 이슈 댓글 조회

```
GET /api/v1/issues/{id}/comments
```

**Query Parameters:** `page`, `size`

**응답 예시:**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "authorName": "김개발",
      "content": "로그 확인 결과 세션 만료 처리 로직에 NPE가 발생하고 있습니다.",
      "sourcePlatform": "JIRA",
      "createdAt": "2026-03-16T10:15:00Z"
    }
  ],
  "error": null,
  "meta": { "page": 0, "size": 20, "totalElements": 3, "totalPages": 1 }
}
```

**권한**: VIEWER 이상

---

### 2.9 이슈 댓글 추가

```
POST /api/v1/issues/{id}/comments
```

**Request Body:**

```json
{
  "content": "수정 완료, QA 확인 부탁드립니다."
}
```

**응답**: 201 Created

**권한**: MEMBER 이상

---

### 2.10 이슈 변경 이력 조회

```
GET /api/v1/issues/{id}/history
```

**응답 예시:**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "action": "STATUS_CHANGE",
      "actorName": "김개발",
      "actorType": "USER",
      "changes": {
        "fields": [
          { "field": "status", "oldValue": "OPEN", "newValue": "IN_PROGRESS" }
        ]
      },
      "createdAt": "2026-03-16T09:00:00Z"
    }
  ],
  "error": null,
  "meta": { "page": 0, "size": 20, "totalElements": 5, "totalPages": 1 }
}
```

**권한**: VIEWER 이상

---

### 2.11 이슈 수동 동기화

```
POST /api/v1/issues/{id}/sync
```

외부 플랫폼과의 수동 동기화를 트리거한다.

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "syncedAt": "2026-03-21T15:00:00Z",
    "changesSynced": 2,
    "direction": "BOTH"
  },
  "error": null,
  "meta": null
}
```

**권한**: MEMBER 이상

---

## 3. Policies API (정책 관리)

### 3.1 정책 목록 조회

```
GET /api/v1/policies
```

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `status` | String | N | 상태 필터 |
| `category` | String | N | 카테고리 필터 |
| `search` | String | N | 전문 검색어 |
| `ownerId` | UUID | N | 소유자 ID |
| `page`, `size`, `sort` | - | N | 페이지네이션 |

**응답 예시:**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "정보보안 정책 v2",
      "status": "PUBLISHED",
      "category": "SECURITY",
      "owner": { "id": "...", "displayName": "이보안" },
      "currentVersion": 2,
      "effectiveDate": "2026-01-01",
      "expiresAt": "2027-01-01T00:00:00Z",
      "acknowledgmentRate": 0.85,
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2026-01-15T09:00:00Z"
    }
  ],
  "error": null,
  "meta": { "page": 0, "size": 20, "totalElements": 15, "totalPages": 1 }
}
```

**권한**: VIEWER 이상

---

### 3.2 정책 생성

```
POST /api/v1/policies
```

**Request Body:**

```json
{
  "title": "원격 근무 정책",
  "content": "## 1. 목적\n원격 근무에 관한 가이드라인을 정합니다.\n\n## 2. 적용 범위\n...",
  "summary": "원격 근무 시 준수해야 할 규정과 절차를 정의합니다.",
  "category": "HR",
  "templateId": null,
  "effectiveDate": "2026-04-01",
  "expiresAt": "2027-04-01T00:00:00Z"
}
```

**응답**: 201 Created

**권한**: MANAGER 이상

---

### 3.3 정책 상세 조회

```
GET /api/v1/policies/{id}
```

**응답**: 정책 전체 정보 (내용 포함, 읽음 확인 통계 포함)

**권한**: VIEWER 이상

---

### 3.4 정책 수정

```
PUT /api/v1/policies/{id}
```

수정 시 자동으로 새 버전이 생성된다.

**Request Body:**

```json
{
  "title": "원격 근무 정책 (개정)",
  "content": "## 1. 목적\n...(수정된 내용)...",
  "changeSummary": "재택 근무 가능 일수 변경 (주 2일 → 주 3일)"
}
```

**응답**: 200 OK

**권한**: MANAGER 이상

---

### 3.5 정책 삭제

```
DELETE /api/v1/policies/{id}
```

**응답**: 204 No Content

**권한**: ADMIN

---

### 3.6 정책 버전 이력 조회

```
GET /api/v1/policies/{id}/versions
```

**응답 예시:**

```json
{
  "success": true,
  "data": [
    {
      "version": 2,
      "changedBy": { "id": "...", "displayName": "이보안" },
      "changeSummary": "재택 근무 가능 일수 변경",
      "createdAt": "2026-01-15T09:00:00Z"
    },
    {
      "version": 1,
      "changedBy": { "id": "...", "displayName": "이보안" },
      "changeSummary": "초기 작성",
      "createdAt": "2025-12-01T10:00:00Z"
    }
  ],
  "error": null,
  "meta": null
}
```

**권한**: VIEWER 이상

---

### 3.7 정책 상태 변경 (워크플로우)

```
PATCH /api/v1/policies/{id}/status
```

**Request Body:**

```json
{
  "status": "REVIEW",
  "reviewerId": "550e8400-e29b-41d4-a716-446655440005",
  "comment": "보안팀 검토 요청합니다."
}
```

**허용되는 상태 전이:**

| 현재 상태 | 가능한 전이 | 권한 |
|-----------|------------|------|
| DRAFT | REVIEW | MANAGER |
| REVIEW | APPROVED, REJECTED | MANAGER |
| APPROVED | PUBLISHED | MANAGER |
| REJECTED | DRAFT | MANAGER |
| PUBLISHED | ARCHIVED, EXPIRED | ADMIN |

**응답**: 200 OK

---

### 3.8 정책 컴플라이언스 현황

```
GET /api/v1/policies/{id}/compliance
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "policyId": "...",
    "policyTitle": "정보보안 정책 v2",
    "currentVersion": 2,
    "totalTargetUsers": 40,
    "acknowledgedUsers": 34,
    "acknowledgmentRate": 0.85,
    "pendingUsers": [
      { "id": "...", "displayName": "최신입", "team": "개발팀" }
    ]
  },
  "error": null,
  "meta": null
}
```

**권한**: MANAGER 이상

---

### 3.9 정책 읽음 확인

```
POST /api/v1/policies/{id}/acknowledge
```

현재 로그인한 사용자의 읽음을 기록한다.

**응답**: 200 OK

**권한**: MEMBER 이상

---

### 3.10 정책 템플릿 목록

```
GET /api/v1/policies/templates
```

**응답 예시:**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "보안 정책 템플릿",
      "category": "SECURITY",
      "description": "정보보안 관련 정책 작성을 위한 표준 템플릿"
    }
  ],
  "error": null,
  "meta": null
}
```

**권한**: MANAGER 이상

---

## 4. Automation API (자동화)

### 4.1 자동화 규칙 목록

```
GET /api/v1/automation/rules
```

**Query Parameters:** `enabled` (Boolean), `page`, `size`

**응답 예시:**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Critical 이슈 긴급 알림",
      "description": "Critical 우선순위 이슈 생성 시 Slack #incidents 채널에 알림",
      "triggerConfig": {
        "type": "ISSUE_CREATED",
        "filters": { "priority": ["CRITICAL"] }
      },
      "actionConfig": {
        "actions": [
          { "type": "SEND_NOTIFICATION", "params": { "channel": "slack", "target": "#incidents" } }
        ]
      },
      "enabled": true,
      "priority": 10,
      "executionCount": 23,
      "lastExecutedAt": "2026-03-20T16:45:00Z",
      "createdAt": "2026-02-01T10:00:00Z"
    }
  ],
  "error": null,
  "meta": { "page": 0, "size": 20, "totalElements": 8, "totalPages": 1 }
}
```

**권한**: MANAGER 이상

---

### 4.2 자동화 규칙 생성

```
POST /api/v1/automation/rules
```

**Request Body:**

```json
{
  "name": "Backend 팀 자동 배정",
  "description": "backend 라벨이 있는 이슈를 백엔드팀에 자동 배정",
  "triggerConfig": {
    "type": "ISSUE_CREATED",
    "filters": {}
  },
  "conditionConfig": {
    "all": [
      { "field": "labels", "operator": "contains", "value": "backend" }
    ]
  },
  "actionConfig": {
    "actions": [
      { "type": "ASSIGN_TEAM", "params": { "teamId": "..." } }
    ]
  },
  "priority": 5,
  "enabled": true
}
```

**응답**: 201 Created

**권한**: MANAGER 이상

---

### 4.3 자동화 규칙 수정

```
PUT /api/v1/automation/rules/{id}
```

**권한**: MANAGER 이상

---

### 4.4 자동화 규칙 삭제

```
DELETE /api/v1/automation/rules/{id}
```

**응답**: 204 No Content

**권한**: MANAGER 이상

---

### 4.5 자동화 규칙 활성/비활성 토글

```
PATCH /api/v1/automation/rules/{id}/toggle
```

**Request Body:**

```json
{
  "enabled": false
}
```

**응답**: 200 OK

**권한**: MANAGER 이상

---

### 4.6 자동화 규칙 테스트 (Dry-Run)

```
POST /api/v1/automation/rules/{id}/test
```

실제로 액션을 실행하지 않고 규칙 평가 결과만 반환한다.

**Request Body:**

```json
{
  "testIssue": {
    "title": "테스트 이슈",
    "priority": "CRITICAL",
    "labels": ["backend", "production"],
    "sourcePlatform": "JIRA"
  }
}
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "ruleId": "...",
    "ruleName": "Critical 이슈 긴급 알림",
    "triggerMatched": true,
    "conditionsMet": true,
    "actionsWouldExecute": [
      {
        "type": "SEND_NOTIFICATION",
        "target": "#incidents",
        "preview": "[CRITICAL] 테스트 이슈 - Slack #incidents 채널로 알림 발송"
      }
    ]
  },
  "error": null,
  "meta": null
}
```

**권한**: MANAGER 이상

---

### 4.7 SLA 정책 목록

```
GET /api/v1/automation/sla-policies
```

**권한**: MANAGER 이상

---

### 4.8 SLA 정책 생성

```
POST /api/v1/automation/sla-policies
```

**Request Body:**

```json
{
  "name": "Critical Bug SLA",
  "description": "Critical 버그에 대한 SLA 정책",
  "conditions": {
    "priority": ["CRITICAL"],
    "issueType": ["BUG"]
  },
  "responseTimeMinutes": 30,
  "resolutionTimeMinutes": 240,
  "escalationRules": {
    "levels": [
      { "level": 1, "thresholdPercent": 75, "notify": ["assignee"], "channel": "slack" },
      { "level": 2, "thresholdPercent": 100, "notify": ["team_lead"], "channel": "slack" },
      { "level": 3, "thresholdPercent": 150, "notify": ["manager"], "channel": ["slack", "email"] }
    ]
  },
  "businessHoursOnly": true
}
```

**응답**: 201 Created

**권한**: MANAGER 이상

---

### 4.9 SLA 대시보드

```
GET /api/v1/automation/sla-policies/dashboard
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "overall": {
      "complianceRate": 0.87,
      "totalTracked": 150,
      "withinSla": 130,
      "breached": 20
    },
    "byPolicy": [
      {
        "policyId": "...",
        "policyName": "Critical Bug SLA",
        "complianceRate": 0.92,
        "avgResponseMinutes": 22,
        "avgResolutionMinutes": 180,
        "activeBreaches": 2
      }
    ],
    "recentBreaches": [
      {
        "issueId": "...",
        "issueTitle": "결제 시스템 장애",
        "policyName": "Critical Bug SLA",
        "breachType": "RESOLUTION",
        "overageMinutes": 45,
        "breachedAt": "2026-03-20T18:00:00Z"
      }
    ]
  },
  "error": null,
  "meta": null
}
```

**권한**: MANAGER 이상

---

## 5. Connectors API (연동 커넥터)

### 5.1 커넥터 목록 조회

```
GET /api/v1/connectors
```

**응답 예시:**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "platform": "JIRA",
      "name": "Jira Cloud (Production)",
      "status": "ACTIVE",
      "lastSyncAt": "2026-03-21T14:30:00Z",
      "issueCount": 1250,
      "lastError": null,
      "createdAt": "2026-01-10T09:00:00Z"
    },
    {
      "id": "...",
      "platform": "GITHUB",
      "name": "GitHub - org/main-repo",
      "status": "ACTIVE",
      "lastSyncAt": "2026-03-21T14:28:00Z",
      "issueCount": 340,
      "lastError": null,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "error": null,
  "meta": null
}
```

**권한**: ADMIN

---

### 5.2 커넥터 생성

```
POST /api/v1/connectors
```

**Request Body:**

```json
{
  "platform": "JIRA",
  "name": "Jira Cloud (Production)",
  "baseUrl": "https://company.atlassian.net",
  "settings": {
    "projectKeys": ["PROJ", "OPS"],
    "syncComments": true,
    "syncAttachments": false
  }
}
```

**응답**: 201 Created (커넥터 ID 및 OAuth 인증 URL 반환)

**권한**: ADMIN

---

### 5.3 커넥터 수정

```
PUT /api/v1/connectors/{id}
```

**권한**: ADMIN

---

### 5.4 커넥터 삭제

```
DELETE /api/v1/connectors/{id}
```

**응답**: 204 No Content

**권한**: ADMIN

---

### 5.5 커넥터 연결 테스트

```
POST /api/v1/connectors/{id}/test
```

외부 플랫폼 API에 테스트 요청을 보내 연결 상태를 확인한다.

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "connected": true,
    "latencyMs": 245,
    "permissions": ["read", "write", "webhook"],
    "projectsAccessible": ["PROJ", "OPS"]
  },
  "error": null,
  "meta": null
}
```

**권한**: ADMIN

---

### 5.6 커넥터 동기화 트리거

```
POST /api/v1/connectors/{id}/sync
```

전체 동기화를 수동으로 트리거한다.

**Request Body:**

```json
{
  "syncType": "FULL",
  "since": "2026-03-01T00:00:00Z"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `syncType` | String | FULL (전체) 또는 INCREMENTAL (증분) |
| `since` | ISO DateTime | 증분 동기화 시작 시점 (INCREMENTAL일 때) |

**응답**: 202 Accepted (비동기 처리)

**권한**: ADMIN

---

### 5.7 OAuth 인증 시작

```
GET /api/v1/connectors/{id}/oauth/authorize
```

외부 플랫폼의 OAuth 인증 페이지로 리다이렉트한다.

**응답**: 302 Redirect → 외부 OAuth 인증 URL

**권한**: ADMIN

---

### 5.8 OAuth 콜백

```
GET /api/v1/connectors/oauth/callback
```

OAuth 인증 완료 후 콜백을 처리한다. 내부적으로 토큰을 암호화하여 저장한다.

**Query Parameters:** `code`, `state`

**응답**: 302 Redirect → 프론트엔드 설정 페이지

---

### 5.9 필드 매핑 조회

```
GET /api/v1/connectors/{id}/field-mappings
```

**응답 예시:**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "externalField": "priority",
      "internalField": "priority",
      "direction": "BOTH",
      "transformRule": {
        "type": "VALUE_MAP",
        "mapping": {
          "Highest": "CRITICAL",
          "High": "HIGH",
          "Medium": "MEDIUM",
          "Low": "LOW"
        }
      }
    }
  ],
  "error": null,
  "meta": null
}
```

**권한**: ADMIN

---

### 5.10 필드 매핑 설정

```
PUT /api/v1/connectors/{id}/field-mappings
```

**Request Body:**

```json
{
  "mappings": [
    {
      "externalField": "priority",
      "internalField": "priority",
      "direction": "BOTH",
      "transformRule": {
        "type": "VALUE_MAP",
        "mapping": { "Highest": "CRITICAL", "High": "HIGH", "Medium": "MEDIUM", "Low": "LOW" }
      }
    },
    {
      "externalField": "status",
      "internalField": "status",
      "direction": "BOTH",
      "transformRule": {
        "type": "VALUE_MAP",
        "mapping": { "To Do": "OPEN", "In Progress": "IN_PROGRESS", "Done": "RESOLVED" }
      }
    }
  ]
}
```

**응답**: 200 OK

**권한**: ADMIN

---

## 6. Dashboard API (대시보드)

### 6.1 대시보드 요약

```
GET /api/v1/dashboard/summary
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "totalIssues": 1590,
    "openIssues": 342,
    "inProgressIssues": 128,
    "resolvedToday": 15,
    "slaComplianceRate": 0.87,
    "activeConnectors": 3,
    "automationRulesActive": 8,
    "pendingPolicyReviews": 2
  },
  "error": null,
  "meta": null
}
```

**권한**: VIEWER 이상

---

### 6.2 이슈 트렌드

```
GET /api/v1/dashboard/trends
```

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `period` | String | `30d` | 기간 (7d, 30d, 90d) |
| `granularity` | String | `day` | 단위 (day, week, month) |

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "period": "30d",
    "granularity": "day",
    "dataPoints": [
      {
        "date": "2026-03-01",
        "created": 12,
        "resolved": 8,
        "netChange": 4
      },
      {
        "date": "2026-03-02",
        "created": 7,
        "resolved": 11,
        "netChange": -4
      }
    ]
  },
  "error": null,
  "meta": null
}
```

**권한**: VIEWER 이상

---

### 6.3 팀 워크로드

```
GET /api/v1/dashboard/workload
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "teamId": "...",
        "teamName": "백엔드팀",
        "totalAssigned": 45,
        "open": 20,
        "inProgress": 15,
        "overdue": 3,
        "members": [
          { "userId": "...", "displayName": "김개발", "assigned": 12, "inProgress": 5 }
        ]
      }
    ]
  },
  "error": null,
  "meta": null
}
```

**권한**: VIEWER 이상

---

### 6.4 SLA 현황

```
GET /api/v1/dashboard/sla
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "overallCompliance": 0.87,
    "policies": [
      {
        "name": "Critical Bug SLA",
        "compliance": 0.92,
        "tracked": 50,
        "breached": 4,
        "atRisk": 2
      }
    ],
    "recentBreaches": [
      {
        "issueTitle": "결제 시스템 장애",
        "policyName": "Critical Bug SLA",
        "overageMinutes": 45
      }
    ]
  },
  "error": null,
  "meta": null
}
```

**권한**: VIEWER 이상

---

### 6.5 커넥터 상태

```
GET /api/v1/dashboard/connectors
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "connectors": [
      {
        "id": "...",
        "platform": "JIRA",
        "name": "Jira Cloud",
        "status": "ACTIVE",
        "lastSyncAt": "2026-03-21T14:30:00Z",
        "syncedIssues": 1250,
        "errorCount24h": 0
      },
      {
        "id": "...",
        "platform": "GITHUB",
        "name": "GitHub Org",
        "status": "ACTIVE",
        "lastSyncAt": "2026-03-21T14:28:00Z",
        "syncedIssues": 340,
        "errorCount24h": 1
      }
    ]
  },
  "error": null,
  "meta": null
}
```

**권한**: VIEWER 이상

---

## 7. SSE (Server-Sent Events)

### 7.1 이벤트 스트림 구독

```
GET /api/v1/stream/events
```

**Headers:**

```
Accept: text/event-stream
Authorization: Bearer {JWT}
```

**이벤트 포맷:**

```
event: issue.updated
data: {"issueId":"550e8400...","title":"로그인 에러","field":"status","oldValue":"OPEN","newValue":"IN_PROGRESS","actor":"김개발","timestamp":"2026-03-21T15:00:00Z"}

event: sync.completed
data: {"connectorId":"...","platform":"JIRA","syncedCount":5,"timestamp":"2026-03-21T15:01:00Z"}

event: sla.warning
data: {"issueId":"...","issueTitle":"결제 장애","policyName":"Critical Bug SLA","remainingMinutes":15,"timestamp":"2026-03-21T15:02:00Z"}

event: heartbeat
data: {"timestamp":"2026-03-21T15:05:00Z"}
```

**이벤트 타입:**

| 이벤트 | 설명 |
|--------|------|
| `issue.created` | 이슈 생성 |
| `issue.updated` | 이슈 수정 |
| `issue.status_changed` | 이슈 상태 변경 |
| `issue.comment_added` | 댓글 추가 |
| `sync.completed` | 동기화 완료 |
| `automation.executed` | 자동화 실행 |
| `policy.published` | 정책 게시 |
| `sla.warning` | SLA 위반 임박 |
| `sla.breached` | SLA 위반 |
| `heartbeat` | 연결 유지 (30초 간격) |

**권한**: VIEWER 이상

---

## 8. Webhooks (외부 플랫폼 수신)

웹훅 엔드포인트는 JWT 인증을 사용하지 않으며, 대신 HMAC 서명 검증으로 요청을 인증한다.

### 8.1 Jira Webhook

```
POST /api/v1/webhooks/jira
```

**Headers:** Jira에서 설정한 웹훅 시크릿으로 HMAC 검증

**처리되는 이벤트:** `jira:issue_created`, `jira:issue_updated`, `jira:issue_deleted`, `comment_created`, `comment_updated`

---

### 8.2 GitHub Webhook

```
POST /api/v1/webhooks/github
```

**Headers:**

```
X-Hub-Signature-256: sha256={HMAC-SHA256 signature}
X-GitHub-Event: issues
X-GitHub-Delivery: {delivery-id}
```

**처리되는 이벤트:** `issues` (opened, edited, closed, reopened, assigned, labeled), `issue_comment` (created, edited), `pull_request`

---

### 8.3 Slack Webhook (Events API)

```
POST /api/v1/webhooks/slack
```

**처리되는 이벤트:** `url_verification` (초기 설정), `event_callback` (메시지, 반응 등)

---

### 8.4 Slack Slash Command

```
POST /api/v1/webhooks/slack/command
```

**처리되는 명령어:** `/issue [search query]`, `/issue create [title]`, `/issue status [id]`

---

### 8.5 Teams Webhook

```
POST /api/v1/webhooks/teams
```

**처리되는 이벤트:** Bot Framework Activity (message, invoke)

---

### 8.6 Discord Webhook (Interaction)

```
POST /api/v1/webhooks/discord
```

**검증:** Ed25519 서명 검증 (`X-Signature-Ed25519`, `X-Signature-Timestamp` 헤더, Application Public Key 사용)

**처리되는 Interaction 타입:**
- `PING` (Type 1) - Discord 초기 엔드포인트 검증
- `APPLICATION_COMMAND` (Type 2) - Slash Command (`/issue create`, `/issue search`, `/issue status`)
- `MESSAGE_COMPONENT` (Type 3) - 버튼 클릭 (상태 변경, 담당자 배정)

---

## 9. Users API (사용자 관리)

### 9.1 현재 사용자 프로필

```
GET /api/v1/users/me
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "dev@company.com",
    "displayName": "김개발",
    "role": "MEMBER",
    "jiraAccountId": "5a...",
    "githubUsername": "kimdev",
    "slackUserId": "U01A...",
    "teamsUserId": null,
    "notificationPrefs": {
      "email": true,
      "slack": true,
      "teams": false,
      "digest": "daily"
    },
    "teams": [
      { "id": "...", "name": "백엔드팀", "role": "MEMBER" }
    ],
    "avatarUrl": "https://...",
    "createdAt": "2026-01-01T00:00:00Z"
  },
  "error": null,
  "meta": null
}
```

**권한**: 인증된 사용자

---

### 9.2 프로필 수정

```
PUT /api/v1/users/me
```

**Request Body:**

```json
{
  "displayName": "김개발 (Backend)",
  "jiraAccountId": "5a...",
  "githubUsername": "kimdev",
  "slackUserId": "U01A..."
}
```

**권한**: 인증된 사용자

---

### 9.3 알림 설정 수정

```
PUT /api/v1/users/me/notification-preferences
```

**Request Body:**

```json
{
  "email": true,
  "slack": true,
  "teams": false,
  "digest": "daily",
  "slaWarning": true,
  "issueAssigned": true,
  "policyPublished": true
}
```

**응답**: 200 OK

**권한**: 인증된 사용자

---

### 9.4 사용자 목록 (관리자)

```
GET /api/v1/users
```

**Query Parameters:** `role`, `teamId`, `search`, `page`, `size`

**권한**: ADMIN

---

### 9.5 사용자 역할 변경 (관리자)

```
PATCH /api/v1/users/{id}/role
```

**Request Body:**

```json
{
  "role": "MANAGER"
}
```

**권한**: ADMIN
