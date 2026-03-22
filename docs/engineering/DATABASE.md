# IssueHub - 데이터베이스 설계

> 문서 버전: 1.0
> 최종 수정일: 2026-03-21
> 작성자: IssueHub 개발팀
> 상태: 검토 중

---

## 1. 개요

IssueHub는 PostgreSQL 16 이상을 사용하며, pgvector 확장을 통해 벡터 유사도 검색을 지원한다.
스키마 관리는 Flyway를 사용하며, 모든 마이그레이션은 버전별 SQL 파일로 관리한다.

### 1.1 설계 원칙

- **정규화 우선**: 3NF 기반 설계, 성능이 필요한 곳에서만 비정규화
- **JSONB 활용**: 유연한 스키마가 필요한 메타데이터, 설정 데이터에 JSONB 사용
- **감사 추적**: 모든 주요 테이블에 `created_at`, `updated_at` 포함
- **Soft Delete**: 주요 엔티티는 `deleted_at` 컬럼으로 논리 삭제
- **UUID 기본키**: 분산 환경 대비 UUID v7 사용

---

## 2. ER 다이어그램

```
┌─────────────┐       ┌──────────────┐       ┌──────────────────┐
│   users     │       │    teams     │       │  team_members    │
│─────────────│       │──────────────│       │──────────────────│
│ id (PK)     │◄──┐   │ id (PK)      │◄──┐   │ team_id (FK)     │
│ email       │   │   │ name         │   │   │ user_id (FK)     │
│ display_name│   │   │ description  │   │   │ role             │
│ role        │   │   └──────────────┘   │   └──────────────────┘
│ jira_acct_id│   │                      │
│ github_user │   │                      │
│ slack_user  │   │   ┌──────────────────┘
│ teams_user  │   │   │
│ notif_prefs │   │   │
└──────┬──────┘   │   │
       │          │   │
       │          │   │
┌──────▼──────┐   │   │   ┌──────────────────┐
│   issues    │   │   │   │  issue_comments  │
│─────────────│   │   │   │──────────────────│
│ id (PK)     │◄──┼───┼───│ issue_id (FK)    │
│ external_id │   │   │   │ author_id (FK)   │
│ source      │   │   │   │ content          │
│ title       │   │   │   │ external_id      │
│ description │   │   │   └──────────────────┘
│ status      │   │   │
│ priority    │   │   │   ┌──────────────────┐
│ assignee_id │───┘   │   │  issue_links     │
│ team_id     │───────┘   │──────────────────│
│ labels      │           │ source_id (FK)   │
│ metadata    │◄──────────│ target_id (FK)   │
│ embedding   │           │ link_type        │
│ sync_version│           └──────────────────┘
│ project_key │
└──────┬──────┘
       │
       │          ┌──────────────────┐     ┌──────────────────┐
       │          │   policies       │     │ policy_versions  │
       │          │──────────────────│     │──────────────────│
       │          │ id (PK)          │◄────│ policy_id (FK)   │
       │          │ title            │     │ version          │
       │          │ content          │     │ content          │
       │          │ status           │     │ changed_by (FK)  │
       │          │ category         │     │ change_summary   │
       │          │ owner_id (FK)    │     └──────────────────┘
       │          │ current_version  │
       │          │ expires_at       │     ┌──────────────────┐
       │          │ embedding        │     │ policy_templates │
       │          └──────────────────┘     │──────────────────│
       │                                   │ id (PK)          │
       │                                   │ name             │
       │          ┌──────────────────┐     │ category         │
       │          │ automation_rules │     │ content_template │
       │          │──────────────────│     └──────────────────┘
       │          │ id (PK)          │
       │          │ name             │     ┌──────────────────┐
       │          │ trigger_config   │     │  sla_policies    │
       │          │ condition_config │     │──────────────────│
       │          │ action_config    │     │ id (PK)          │
       │          │ enabled          │     │ name             │
       │          │ priority         │     │ conditions       │
       │          └──────────────────┘     │ response_time    │
       │                                   │ resolution_time  │
       │                                   │ escalation_rules │
       │          ┌──────────────────┐     └──────────────────┘
       │          │connector_configs │
       │          │──────────────────│     ┌────────────────────────┐
       │          │ id (PK)          │     │connector_field_mappings│
       │          │ platform         │     │────────────────────────│
       │          │ name             │◄────│ connector_id (FK)      │
       │          │ credentials      │     │ external_field         │
       │          │ webhook_secret   │     │ internal_field         │
       │          │ settings         │     │ transform_rule         │
       │          │ status           │     └────────────────────────┘
       │          └──────────────────┘
       │
       │          ┌──────────────────┐     ┌──────────────────┐
       └──────────│  audit_logs      │     │  notifications   │
                  │──────────────────│     │──────────────────│
                  │ id (PK)          │     │ id (PK)          │
                  │ entity_type      │     │ user_id (FK)     │
                  │ entity_id        │     │ type             │
                  │ action           │     │ title            │
                  │ actor_id (FK)    │     │ content          │
                  │ changes          │     │ channel          │
                  │ created_at       │     │ read_at          │
                  └──────────────────┘     └──────────────────┘
```

---

## 3. 테이블 상세 스키마

### 3.1 users (사용자)

사용자 정보 및 외부 플랫폼 계정 매핑을 저장한다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | 사용자 고유 식별자 |
| `keycloak_id` | VARCHAR(255) | UNIQUE, NOT NULL | Keycloak 사용자 ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 주소 |
| `display_name` | VARCHAR(100) | NOT NULL | 표시 이름 |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'MEMBER' | 시스템 역할 (ADMIN, MANAGER, MEMBER, VIEWER) |
| `jira_account_id` | VARCHAR(255) | NULLABLE | Jira 계정 ID |
| `github_username` | VARCHAR(100) | NULLABLE | GitHub 사용자명 |
| `slack_user_id` | VARCHAR(50) | NULLABLE | Slack 사용자 ID |
| `teams_user_id` | VARCHAR(255) | NULLABLE | Teams 사용자 ID |
| `notification_prefs` | JSONB | DEFAULT '{}' | 알림 설정 |
| `avatar_url` | VARCHAR(500) | NULLABLE | 프로필 이미지 URL |
| `is_active` | BOOLEAN | DEFAULT true | 활성 상태 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정 시각 |

```sql
-- notification_prefs JSONB 구조 예시
{
  "email": true,
  "slack": true,
  "teams": false,
  "digest": "daily",
  "sla_warning": true,
  "issue_assigned": true,
  "policy_published": true
}
```

### 3.2 teams (팀)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 팀 고유 식별자 |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | 팀 이름 |
| `description` | TEXT | NULLABLE | 팀 설명 |
| `lead_id` | UUID | FK → users(id), NULLABLE | 팀 리드 |
| `slack_channel_id` | VARCHAR(50) | NULLABLE | Slack 채널 ID |
| `teams_channel_id` | VARCHAR(255) | NULLABLE | Teams 채널 ID |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정 시각 |

### 3.3 team_members (팀 멤버)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `team_id` | UUID | PK, FK → teams(id) | 팀 ID |
| `user_id` | UUID | PK, FK → users(id) | 사용자 ID |
| `role` | VARCHAR(20) | DEFAULT 'MEMBER' | 팀 내 역할 (LEAD, MEMBER) |
| `joined_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 합류 시각 |

### 3.4 issues (이슈)

정규화된 이슈 데이터를 저장한다. 외부 플랫폼 이슈를 내부 모델로 변환하여 관리한다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 내부 이슈 고유 식별자 |
| `external_id` | VARCHAR(255) | NULLABLE | 외부 플랫폼 이슈 ID (예: PROJ-123, #456) |
| `external_url` | VARCHAR(1000) | NULLABLE | 외부 플랫폼 이슈 URL |
| `source_platform` | VARCHAR(20) | NOT NULL | 소스 플랫폼 (INTERNAL, JIRA, GITHUB) |
| `connector_id` | UUID | FK → connector_configs(id), NULLABLE | 연동 커넥터 ID |
| `project_key` | VARCHAR(50) | NULLABLE | 프로젝트 키 (Jira 프로젝트 키 등) |
| `title` | VARCHAR(500) | NOT NULL | 이슈 제목 |
| `description` | TEXT | NULLABLE | 이슈 설명 (Markdown) |
| `status` | VARCHAR(30) | NOT NULL, DEFAULT 'OPEN' | 상태 (OPEN, IN_PROGRESS, RESOLVED, CLOSED) |
| `priority` | VARCHAR(20) | NOT NULL, DEFAULT 'MEDIUM' | 우선순위 (CRITICAL, HIGH, MEDIUM, LOW) |
| `issue_type` | VARCHAR(30) | DEFAULT 'TASK' | 유형 (BUG, TASK, STORY, EPIC) |
| `reporter_id` | UUID | FK → users(id), NULLABLE | 보고자 |
| `assignee_id` | UUID | FK → users(id), NULLABLE | 담당자 |
| `team_id` | UUID | FK → teams(id), NULLABLE | 담당 팀 |
| `labels` | TEXT[] | DEFAULT '{}' | 라벨 배열 |
| `metadata` | JSONB | DEFAULT '{}' | 플랫폼별 추가 메타데이터 |
| `embedding` | vector(768) | NULLABLE | 이슈 제목+설명 임베딩 벡터 |
| `sync_version` | BIGINT | NOT NULL, DEFAULT 0 | 동기화 버전 (충돌 감지용) |
| `synced_at` | TIMESTAMPTZ | NULLABLE | 마지막 동기화 시각 |
| `due_date` | TIMESTAMPTZ | NULLABLE | 마감일 |
| `resolved_at` | TIMESTAMPTZ | NULLABLE | 해결 시각 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정 시각 |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | 논리 삭제 시각 |

```sql
-- metadata JSONB 구조 예시 (Jira 소스)
{
  "jira_issue_type": "Story",
  "jira_sprint": "Sprint 23",
  "jira_story_points": 5,
  "jira_components": ["backend", "api"],
  "jira_fix_versions": ["v2.1.0"],
  "custom_fields": {
    "customfield_10001": "value"
  }
}

-- metadata JSONB 구조 예시 (GitHub 소스)
{
  "github_repo": "org/repo-name",
  "github_milestone": "v2.0",
  "github_is_pull_request": false,
  "github_reactions": { "thumbsup": 3, "heart": 1 }
}
```

### 3.5 issue_comments (이슈 댓글)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 댓글 고유 식별자 |
| `issue_id` | UUID | FK → issues(id), NOT NULL | 이슈 ID |
| `author_id` | UUID | FK → users(id), NULLABLE | 작성자 (외부 유저일 경우 NULL) |
| `author_name` | VARCHAR(100) | NOT NULL | 작성자 표시 이름 |
| `content` | TEXT | NOT NULL | 댓글 내용 (Markdown) |
| `external_id` | VARCHAR(255) | NULLABLE | 외부 플랫폼 댓글 ID |
| `source_platform` | VARCHAR(20) | NOT NULL | 소스 플랫폼 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정 시각 |

### 3.6 issue_links (이슈 링크)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 링크 고유 식별자 |
| `source_issue_id` | UUID | FK → issues(id), NOT NULL | 소스 이슈 |
| `target_issue_id` | UUID | FK → issues(id), NOT NULL | 대상 이슈 |
| `link_type` | VARCHAR(30) | NOT NULL | 관계 유형 (BLOCKS, RELATES_TO, DUPLICATES, CAUSED_BY) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |

### 3.7 policies (정책)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 정책 고유 식별자 |
| `title` | VARCHAR(300) | NOT NULL | 정책 제목 |
| `content` | TEXT | NOT NULL | 정책 본문 (Markdown) |
| `summary` | TEXT | NULLABLE | 정책 요약 |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'DRAFT' | 상태 (DRAFT, REVIEW, APPROVED, PUBLISHED, EXPIRED, ARCHIVED) |
| `category` | VARCHAR(50) | NOT NULL | 카테고리 (SECURITY, OPERATIONAL, COMPLIANCE, HR, IT) |
| `owner_id` | UUID | FK → users(id), NOT NULL | 정책 소유자 |
| `reviewer_id` | UUID | FK → users(id), NULLABLE | 검토자 |
| `approver_id` | UUID | FK → users(id), NULLABLE | 승인자 |
| `current_version` | INTEGER | NOT NULL, DEFAULT 1 | 현재 버전 번호 |
| `template_id` | UUID | FK → policy_templates(id), NULLABLE | 사용된 템플릿 |
| `embedding` | vector(768) | NULLABLE | 정책 내용 임베딩 벡터 |
| `effective_date` | DATE | NULLABLE | 시행일 |
| `expires_at` | TIMESTAMPTZ | NULLABLE | 만료일 |
| `published_at` | TIMESTAMPTZ | NULLABLE | 게시 시각 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정 시각 |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | 논리 삭제 시각 |

### 3.8 policy_versions (정책 버전)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 버전 고유 식별자 |
| `policy_id` | UUID | FK → policies(id), NOT NULL | 정책 ID |
| `version` | INTEGER | NOT NULL | 버전 번호 |
| `content` | TEXT | NOT NULL | 해당 버전의 정책 내용 |
| `changed_by` | UUID | FK → users(id), NOT NULL | 변경자 |
| `change_summary` | TEXT | NULLABLE | 변경 요약 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |

**복합 유니크 제약**: `(policy_id, version)`

### 3.9 policy_templates (정책 템플릿)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 템플릿 고유 식별자 |
| `name` | VARCHAR(200) | NOT NULL | 템플릿 이름 |
| `category` | VARCHAR(50) | NOT NULL | 카테고리 |
| `description` | TEXT | NULLABLE | 템플릿 설명 |
| `content_template` | TEXT | NOT NULL | 템플릿 본문 (Markdown + 플레이스홀더) |
| `is_active` | BOOLEAN | DEFAULT true | 활성 상태 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정 시각 |

### 3.10 policy_acknowledgments (정책 읽음 확인)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 고유 식별자 |
| `policy_id` | UUID | FK → policies(id), NOT NULL | 정책 ID |
| `user_id` | UUID | FK → users(id), NOT NULL | 사용자 ID |
| `version_acknowledged` | INTEGER | NOT NULL | 확인한 버전 번호 |
| `acknowledged_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 확인 시각 |

**복합 유니크 제약**: `(policy_id, user_id, version_acknowledged)`

### 3.11 automation_rules (자동화 규칙)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 규칙 고유 식별자 |
| `name` | VARCHAR(200) | NOT NULL | 규칙 이름 |
| `description` | TEXT | NULLABLE | 규칙 설명 |
| `trigger_config` | JSONB | NOT NULL | 트리거 설정 |
| `condition_config` | JSONB | DEFAULT '{}' | 조건 설정 |
| `action_config` | JSONB | NOT NULL | 액션 설정 |
| `enabled` | BOOLEAN | DEFAULT true | 활성 상태 |
| `priority` | INTEGER | DEFAULT 0 | 실행 우선순위 (높을수록 먼저 실행) |
| `execution_count` | BIGINT | DEFAULT 0 | 실행 횟수 |
| `last_executed_at` | TIMESTAMPTZ | NULLABLE | 마지막 실행 시각 |
| `created_by` | UUID | FK → users(id), NOT NULL | 생성자 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정 시각 |

```sql
-- trigger_config JSONB 구조 예시
{
  "type": "ISSUE_CREATED",
  "filters": {
    "source_platform": ["JIRA", "GITHUB"],
    "project_key": ["PROJ"]
  }
}

-- condition_config JSONB 구조 예시
{
  "all": [
    { "field": "priority", "operator": "equals", "value": "CRITICAL" },
    { "field": "labels", "operator": "contains", "value": "production" }
  ]
}

-- action_config JSONB 구조 예시
{
  "actions": [
    {
      "type": "ASSIGN_USER",
      "params": { "user_id": "uuid-here" }
    },
    {
      "type": "ADD_LABEL",
      "params": { "label": "urgent" }
    },
    {
      "type": "SEND_NOTIFICATION",
      "params": {
        "channel": "slack",
        "target": "#incidents",
        "template": "critical_issue_created"
      }
    }
  ]
}
```

### 3.12 sla_policies (SLA 정책)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | SLA 정책 고유 식별자 |
| `name` | VARCHAR(200) | NOT NULL | SLA 정책 이름 |
| `description` | TEXT | NULLABLE | 설명 |
| `conditions` | JSONB | NOT NULL | 적용 조건 (이슈 타입, 우선순위 등) |
| `response_time_minutes` | INTEGER | NOT NULL | 응답 목표 시간 (분) |
| `resolution_time_minutes` | INTEGER | NOT NULL | 해결 목표 시간 (분) |
| `escalation_rules` | JSONB | NOT NULL | 에스컬레이션 단계 설정 |
| `business_hours_only` | BOOLEAN | DEFAULT true | 업무 시간만 적용 여부 |
| `enabled` | BOOLEAN | DEFAULT true | 활성 상태 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정 시각 |

```sql
-- conditions JSONB 구조 예시
{
  "priority": ["CRITICAL", "HIGH"],
  "issue_type": ["BUG"],
  "labels": ["production"]
}

-- escalation_rules JSONB 구조 예시
{
  "levels": [
    {
      "level": 1,
      "threshold_percent": 75,
      "notify": ["assignee"],
      "channel": "slack"
    },
    {
      "level": 2,
      "threshold_percent": 100,
      "notify": ["team_lead"],
      "channel": "slack",
      "action": "reassign_to_lead"
    },
    {
      "level": 3,
      "threshold_percent": 150,
      "notify": ["manager", "admin"],
      "channel": ["slack", "email"],
      "action": "escalate_to_manager"
    }
  ]
}
```

### 3.13 connector_configs (커넥터 설정)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 커넥터 고유 식별자 |
| `platform` | VARCHAR(20) | NOT NULL | 플랫폼 (JIRA, GITHUB, SLACK, TEAMS) |
| `name` | VARCHAR(200) | NOT NULL | 커넥터 표시 이름 |
| `credentials` | BYTEA | NOT NULL | AES-256 암호화된 인증 정보 |
| `webhook_secret` | VARCHAR(255) | NULLABLE | 웹훅 서명 검증 시크릿 |
| `base_url` | VARCHAR(500) | NULLABLE | API 기본 URL (Jira 등) |
| `settings` | JSONB | DEFAULT '{}' | 플랫폼별 추가 설정 |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | 상태 (ACTIVE, INACTIVE, ERROR) |
| `last_sync_at` | TIMESTAMPTZ | NULLABLE | 마지막 동기화 시각 |
| `last_error` | TEXT | NULLABLE | 마지막 에러 메시지 |
| `created_by` | UUID | FK → users(id), NOT NULL | 생성자 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정 시각 |

```sql
-- credentials 복호화 후 구조 예시 (Jira)
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "Bearer",
  "expires_at": "2026-04-01T00:00:00Z",
  "cloud_id": "abc-123-def"
}

-- settings JSONB 구조 예시 (Jira)
{
  "project_keys": ["PROJ", "OPS"],
  "sync_comments": true,
  "sync_attachments": false,
  "status_mapping": {
    "To Do": "OPEN",
    "In Progress": "IN_PROGRESS",
    "Done": "RESOLVED"
  }
}
```

### 3.14 connector_field_mappings (커넥터 필드 매핑)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 매핑 고유 식별자 |
| `connector_id` | UUID | FK → connector_configs(id), NOT NULL | 커넥터 ID |
| `external_field` | VARCHAR(200) | NOT NULL | 외부 플랫폼 필드명 |
| `internal_field` | VARCHAR(200) | NOT NULL | IssueHub 내부 필드명 |
| `direction` | VARCHAR(10) | NOT NULL, DEFAULT 'BOTH' | 동기화 방향 (IN, OUT, BOTH) |
| `transform_rule` | JSONB | NULLABLE | 값 변환 규칙 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |

```sql
-- transform_rule JSONB 구조 예시
{
  "type": "VALUE_MAP",
  "mapping": {
    "Highest": "CRITICAL",
    "High": "HIGH",
    "Medium": "MEDIUM",
    "Low": "LOW",
    "Lowest": "LOW"
  },
  "default_value": "MEDIUM"
}
```

### 3.15 audit_logs (감사 로그)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 로그 고유 식별자 |
| `entity_type` | VARCHAR(50) | NOT NULL | 엔티티 유형 (ISSUE, POLICY, RULE, CONNECTOR) |
| `entity_id` | UUID | NOT NULL | 엔티티 ID |
| `action` | VARCHAR(30) | NOT NULL | 작업 유형 (CREATE, UPDATE, DELETE, STATUS_CHANGE) |
| `actor_id` | UUID | FK → users(id), NULLABLE | 수행자 (시스템 작업 시 NULL) |
| `actor_type` | VARCHAR(20) | DEFAULT 'USER' | 수행자 유형 (USER, SYSTEM, AUTOMATION, WEBHOOK) |
| `changes` | JSONB | NOT NULL | 변경 상세 |
| `ip_address` | VARCHAR(45) | NULLABLE | 요청 IP 주소 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |

```sql
-- changes JSONB 구조 예시
{
  "fields": [
    {
      "field": "status",
      "old_value": "OPEN",
      "new_value": "IN_PROGRESS"
    },
    {
      "field": "assignee_id",
      "old_value": null,
      "new_value": "550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}
```

### 3.16 notifications (알림)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 알림 고유 식별자 |
| `user_id` | UUID | FK → users(id), NOT NULL | 수신자 |
| `type` | VARCHAR(50) | NOT NULL | 알림 유형 (ISSUE_ASSIGNED, SLA_WARNING, POLICY_PUBLISHED 등) |
| `title` | VARCHAR(300) | NOT NULL | 알림 제목 |
| `content` | TEXT | NOT NULL | 알림 내용 |
| `channel` | VARCHAR(20) | NOT NULL | 발송 채널 (IN_APP, EMAIL, SLACK, TEAMS) |
| `entity_type` | VARCHAR(50) | NULLABLE | 관련 엔티티 유형 |
| `entity_id` | UUID | NULLABLE | 관련 엔티티 ID |
| `sent_at` | TIMESTAMPTZ | NULLABLE | 발송 시각 |
| `read_at` | TIMESTAMPTZ | NULLABLE | 읽음 시각 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |

---

## 추가 필요 테이블 (Phase 2 설계)

> GPT 구현 분석에서 도출된 누락 테이블. Phase 2 양방향 동기화 구현 시 상세 설계 필요.

### external_issue_mapping (외부 이슈 매핑)

IssueHub 내부 ID와 외부 플랫폼 원본 ID의 안정적 매핑을 관리한다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 매핑 고유 식별자 |
| `issue_id` | UUID | FK → issues(id), NOT NULL | 내부 이슈 ID |
| `connector_id` | UUID | FK → connector_configs(id), NOT NULL | 커넥터 ID |
| `external_id` | VARCHAR(255) | NOT NULL | 외부 플랫폼 이슈 ID |
| `external_url` | VARCHAR(1000) | NULLABLE | 외부 이슈 URL |
| `sync_status` | VARCHAR(20) | NOT NULL, DEFAULT 'SYNCED' | 동기화 상태 (SYNCED, PENDING, CONFLICT, ERROR) |
| `last_synced_at` | TIMESTAMPTZ | NULLABLE | 마지막 동기화 시각 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각 |

### sync_conflict (동기화 충돌)

필드 단위 충돌 발생 시 양쪽 값을 저장하고 사용자 해결을 대기한다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 충돌 고유 식별자 |
| `issue_id` | UUID | FK → issues(id), NOT NULL | 대상 이슈 ID |
| `field_name` | VARCHAR(50) | NOT NULL | 충돌 발생 필드명 |
| `local_value` | TEXT | NULLABLE | IssueHub 쪽 값 |
| `remote_value` | TEXT | NULLABLE | 외부 플랫폼 쪽 값 |
| `resolved` | BOOLEAN | DEFAULT false | 해결 여부 |
| `resolved_by` | UUID | FK → users(id), NULLABLE | 해결한 사용자 |
| `resolved_at` | TIMESTAMPTZ | NULLABLE | 해결 시각 |
| `resolution` | VARCHAR(20) | NULLABLE | 해결 방법 (LOCAL, REMOTE, MANUAL) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 충돌 발생 시각 |

### webhook_event (웹훅 이벤트 이력)

수신된 웹훅 이벤트를 기록하여 멱등성 보장 및 디버깅에 활용한다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 이벤트 고유 식별자 |
| `connector_id` | UUID | FK → connector_configs(id), NOT NULL | 커넥터 ID |
| `external_event_id` | VARCHAR(255) | NOT NULL | 외부 이벤트 고유 ID (멱등성 키) |
| `event_type` | VARCHAR(50) | NOT NULL | 이벤트 유형 (issue_created, issue_updated 등) |
| `payload` | JSONB | NOT NULL | 원본 페이로드 |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'RECEIVED' | 처리 상태 (RECEIVED, PROCESSED, FAILED, SKIPPED) |
| `error_message` | TEXT | NULLABLE | 실패 시 에러 메시지 |
| `processed_at` | TIMESTAMPTZ | NULLABLE | 처리 완료 시각 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수신 시각 |

UNIQUE(connector_id, external_event_id) -- 멱등성 보장

### sync_cursor (동기화 커서)

폴링 기반 동기화 시 마지막 조회 위치를 추적한다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PK | 커서 고유 식별자 |
| `connector_id` | UUID | FK → connector_configs(id), UNIQUE, NOT NULL | 커넥터 ID |
| `last_sync_cursor` | VARCHAR(255) | NULLABLE | 마지막 동기화 커서 값 (타임스탬프 또는 페이지 토큰) |
| `last_sync_at` | TIMESTAMPTZ | NULLABLE | 마지막 폴링 시각 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정 시각 |

---

## 4. 인덱스 전략

### 4.1 일반 인덱스

```sql
-- issues 테이블
CREATE INDEX idx_issues_status ON issues(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_priority ON issues(priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_assignee ON issues(assignee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_team ON issues(team_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_source ON issues(source_platform) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_external ON issues(source_platform, external_id);
CREATE INDEX idx_issues_created ON issues(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_project ON issues(project_key) WHERE deleted_at IS NULL;

-- 복합 인덱스 (자주 사용되는 필터 조합)
CREATE INDEX idx_issues_status_priority ON issues(status, priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_assignee_status ON issues(assignee_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_team_status ON issues(team_id, status) WHERE deleted_at IS NULL;

-- issue_comments 테이블
CREATE INDEX idx_comments_issue ON issue_comments(issue_id, created_at DESC);

-- policies 테이블
CREATE INDEX idx_policies_status ON policies(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_policies_category ON policies(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_policies_owner ON policies(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_policies_expires ON policies(expires_at) WHERE status = 'PUBLISHED';

-- audit_logs 테이블
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- notifications 테이블
CREATE INDEX idx_notif_user_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;
```

### 4.2 GIN 인덱스 (Full-Text Search)

```sql
-- 이슈 전문 검색
CREATE INDEX idx_issues_fts ON issues
  USING GIN (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')));

-- 정책 전문 검색
CREATE INDEX idx_policies_fts ON policies
  USING GIN (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content, '')));

-- JSONB 인덱스
CREATE INDEX idx_issues_metadata ON issues USING GIN (metadata);
CREATE INDEX idx_issues_labels ON issues USING GIN (labels);
CREATE INDEX idx_rules_trigger ON automation_rules USING GIN (trigger_config);
CREATE INDEX idx_sla_conditions ON sla_policies USING GIN (conditions);
```

### 4.3 pgvector 인덱스 (유사도 검색)

```sql
-- IVFFlat 인덱스 (이슈 임베딩)
CREATE INDEX idx_issues_embedding ON issues
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- IVFFlat 인덱스 (정책 임베딩)
CREATE INDEX idx_policies_embedding ON policies
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);
```

---

## 5. pgvector 활용

### 5.1 임베딩 저장

이슈와 정책의 텍스트 내용을 Google Gemini `text-embedding-004` (768 차원) 모델로 임베딩하여 저장한다.

```sql
-- pgvector 확장 설치
CREATE EXTENSION IF NOT EXISTS vector;

-- 임베딩 컬럼 정의 (issues, policies 테이블에 이미 포함)
-- embedding vector(768)
```

### 5.2 유사도 검색 쿼리

```sql
-- 유사 이슈 검색 (코사인 유사도, 상위 5건)
SELECT id, title, status, priority,
       1 - (embedding <=> :query_embedding) AS similarity
FROM issues
WHERE deleted_at IS NULL
  AND embedding IS NOT NULL
  AND id != :current_issue_id
ORDER BY embedding <=> :query_embedding
LIMIT 5;

-- 정책 기반 RAG 검색 (관련 정책 조각 검색)
SELECT id, title, content, category,
       1 - (embedding <=> :query_embedding) AS similarity
FROM policies
WHERE status = 'PUBLISHED'
  AND deleted_at IS NULL
  AND embedding IS NOT NULL
ORDER BY embedding <=> :query_embedding
LIMIT 3;
```

### 5.3 임베딩 갱신 전략

| 트리거 | 동작 |
|--------|------|
| 이슈 생성 | Spring Event (Phase 1-2) / Kafka (Phase 3+) → 비동기 임베딩 생성 |
| 이슈 제목/설명 수정 | Spring Event (Phase 1-2) / Kafka (Phase 3+) → 임베딩 재생성 |
| 정책 게시 | 동기 임베딩 생성 (게시 전 완료) |
| 정책 내용 수정 | 새 버전 게시 시 임베딩 재생성 |
| 배치 재인덱싱 | 스케줄러로 주 1회 전체 재생성 |

---

## 6. 마이그레이션 전략 (Flyway)

### 6.1 마이그레이션 파일 구조

```
infra-persistence/src/main/resources/db/migration/
├── V1__init_schema.sql              -- 초기 스키마 (users, teams, team_members)
├── V2__create_issues.sql            -- 이슈 관련 테이블
├── V3__create_policies.sql          -- 정책 관련 테이블
├── V4__create_automation.sql        -- 자동화 규칙 테이블
├── V5__create_connectors.sql        -- 커넥터 설정 테이블
├── V6__create_audit_notifications.sql -- 감사 로그, 알림 테이블
├── V7__add_pgvector.sql             -- pgvector 확장 및 임베딩 컬럼
├── V8__create_indexes.sql           -- 인덱스 생성
├── V9__seed_templates.sql           -- 초기 정책 템플릿 데이터
└── V10__add_policy_acknowledgments.sql -- 정책 읽음 확인 테이블
```

### 6.2 마이그레이션 규칙

| 규칙 | 설명 |
|------|------|
| **파일 명명** | `V{번호}__{설명}.sql` (언더스코어 2개) |
| **멱등성** | 가능한 한 `IF NOT EXISTS` 사용 |
| **롤백** | 각 마이그레이션에 대응하는 `U{번호}__` undo 스크립트 작성 |
| **데이터 마이그레이션** | DDL과 DML 분리, 별도 마이그레이션 파일로 관리 |
| **환경 분리** | `afterMigrate.sql`로 환경별 시드 데이터 구분 |
| **리뷰 필수** | 모든 마이그레이션 SQL은 코드 리뷰 대상 |

### 6.3 Flyway 설정

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
    validate-on-migrate: true
    out-of-order: false
    table: flyway_schema_history
```
