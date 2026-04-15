# IssueHub 연동(Integration) 시스템 설계

> **프로젝트**: IssueHub — AI 기반 이슈 자동화 플랫폼
> **작성일**: 2026-04-15
> **상태**: Draft
> **관련 기획서**: docs/mvp/issuehub-mvp-기획서.md, docs/mvp/issuehub-mvp-기술설계.md

---

## 1. 목표

외부 플랫폼(Jira, Slack 등)에서 발생하는 이슈를 자동 감지하여 IssueHub로 인입하고, 처리 결과를 외부로 발송하는 양방향 연동 시스템을 구축한다.

**핵심 가치**: 사람이 이슈를 수동으로 등록하지 않아도, Slack 에러 알림이나 Jira 이슈 생성을 자동 감지하여 AI 분석 파이프라인으로 연결한다.

---

## 2. 이슈 인입 케이스

### 5가지 인입 경로

| 케이스 | 진입점 | 중간 처리 | MVP |
|--------|--------|-----------|-----|
| **Case 1: 알림 → 협업툴** | Slack/Teams 에러 채널 | n8n 감지 → AI 파싱 → 관리자 확인 → Jira 자동 생성 | Must |
| **Case 2: 협업툴 직접** | Jira에서 이슈 생성 | Webhook → n8n → IssueHub | Must |
| **Case 3: 모니터링 알림** | Grafana/Prometheus Alert | n8n → Jira 생성 | Nice-to-have |
| **Case 4: 자체 등록** | IssueHub UI | 직접 API | Must |
| **Case 5: CI/CD 실패** | GitHub Actions 등 | n8n webhook → 이슈 자동 생성 | Nice-to-have |

### MVP 1단계 플랫폼

- **이슈 소스**: Jira
- **알림 채널 (양방향)**: Slack — 에러 감지(인바운드) + 알림/확인 버튼(아웃바운드)
- **2단계**: GitHub, GitLab, Notion, Teams, Email

---

## 3. 전체 아키텍처

### 시스템 구성

```
┌─────────────────────────────────────────────────────────────┐
│                         IssueHub                             │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ FE 연동  │→ │ app-api      │→ │ core-connector        │  │
│  │ 설정 UI  │  │ Controller   │  │ (UseCase + Port)      │  │
│  └──────────┘  └──────────────┘  └───────┬───────────────┘  │
│                                          │                   │
│                              ┌───────────┼───────────┐       │
│                              ▼           ▼           ▼       │
│                     ┌────────────┐ ┌──────────┐ ┌────────┐  │
│                     │ infra-n8n  │ │ infra-   │ │Keycloak│  │
│                     │ (n8n API   │ │persistence│ │ (RBAC) │  │
│                     │  Adapter)  │ │ (DB)     │ │        │  │
│                     └─────┬──────┘ └──────────┘ └────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │ n8n REST API
                            ▼
               ┌────────────────────────┐
               │         n8n            │
               │  (이벤트 게이트웨이)     │
               │                        │
               │  - Slack 에러 감시      │
               │  - Jira 이슈 수신      │
               │  - Jira 폴링 보조      │
               │  - Jira 티켓 생성      │
               │  - Slack 알림 발송     │
               └──────────┬─────────────┘
                          │ 외부 플랫폼 API
                          ▼
              ┌──────┐  ┌──────┐
              │ Slack │  │ Jira │
              └──────┘  └──────┘
```

### 핵심 원칙

- **n8n = 이벤트 게이트웨이** — 수신/변환/전달만. 판단 로직 금지.
- **n8n = Source of Truth** — 워크플로우 설정은 n8n이 우선. IssueHub는 n8n API로 읽기/쓰기.
- **IssueHub UI = 기본 설정** — 대부분의 사용자는 IssueHub UI에서 연동 설정.
- **n8n UI = 고급 설정** — 파워유저가 워크플로우를 직접 커스텀 가능.
- **Keycloak = 인증/권한** — OIDC + RBAC (ADMIN/MEMBER).

### Hexagonal Architecture 레이어

| 레이어 | 모듈 | 역할 |
|--------|------|------|
| **Inbound Port** | core-connector | ConfigureConnectorUseCase, TestConnectionUseCase, SyncWorkflowUseCase, ListConnectorsUseCase |
| **Outbound Port** | core-connector | ManageWorkflowPort (→ n8n), SaveConnectorPort (→ DB), LoadConnectorPort (→ DB) |
| **Outbound Adapter** | infra-n8n | n8n REST API 호출 (워크플로우 CRUD, credential 관리) |
| **Outbound Adapter** | infra-persistence | integrations 테이블 (설정/상태/n8n workflow ID) |
| **Inbound Adapter** | app-api | ConnectorController (REST API) |
| **Inbound Adapter** | app-api | WebhookController (n8n → IssueHub 이벤트 수신) |

---

## 4. Case 1 상세 플로우 (핵심)

**Slack 에러 감지 → Jira 자동 생성 → AI 분석**

### 7단계 플로우

1. **Slack #prod-alerts** — 에러 메시지 올라옴 (예: "500 Error on /api/login — NullPointerException at AuthService.java:42")
2. **n8n Slack 감시 워크플로우** — 채널 필터 + 키워드 매칭 (error, 500, exception, fail 등) → 매칭되면 IssueHub로 전달
3. **IssueHub AI 파싱** — LLM이 메시지를 구조화 (제목: "로그인 500 에러", 우선순위: HIGH, 컴포넌트: Backend/Auth, 신뢰도: 94%)
4. **관리자 확인 요청** — 동시에 두 곳:
   - Slack: "🐛 새 이슈 감지 — 로그인 500 에러" + [확인] [수정] [무시] 버튼
   - IssueHub: 이슈 목록 "대기 중" 탭에 표시
5. **관리자 액션**:
   - [확인] → Jira 티켓 자동 생성 (AI가 채운 정보로) → AI 분석 파이프라인 시작
   - [수정] → IssueHub 이슈 페이지로 이동, 수정 후 확정
   - [무시] → DISMISSED 처리
6. **Jira 티켓 생성** — n8n "Jira 티켓 생성" 워크플로우로 자동 생성
7. **AI 분석 파이프라인 진입** — 정책 RAG 매칭 → 코드 생성 → 관리자 승인 → 머지

### Slack 감지 기준

- **채널 필터**: 관리자가 감시 대상 채널 지정 (예: #prod-alerts, #backend-errors)
- **키워드 패턴**: 관리자가 키워드 목록 지정 (예: error, 500, exception, fail, timeout)
- **복합 매칭**: 지정 채널 AND 키워드 포함 메시지만 감지

### 중복 이슈 방지

- Slack 메시지 ID(ts)로 멱등성 처리
- 유사 이슈 감지: 같은 에러 패턴이 짧은 시간(설정 가능) 내 반복되면 기존 이슈에 병합

---

## 5. Jira 연동 방식

### 3중 연동

| 방식 | 용도 | 설명 |
|------|------|------|
| **Jira Webhook** | 실시간 | 이슈 생성/수정 이벤트 즉시 수신 |
| **n8n 폴링** | 누락 방지 | 5분 간격으로 새 이슈 체크, 멱등성으로 중복 방지 |
| **Jira Automation** | 고급 옵션 | Jira 내장 자동화 규칙으로 사전 필터링 후 n8n webhook 호출 |

### 연동 설정 플로우 (Jira 추가 시)

1. FE — Jira 카드 클릭 → OAuth 팝업 열림
2. app-api — Jira OAuth 콜백 수신 → access token 획득
3. core-connector — ConfigureConnectorUseCase.create() → token 암호화 + 저장 명령
4. infra-persistence — integrations 테이블에 저장 (token AES-256-GCM 암호화)
5. infra-n8n — n8n REST API로 Jira 워크플로우 3개 자동 생성 + 활성화
6. core-connector — 연결 테스트 실행 → 상태 CONNECTED로 업데이트
7. FE — Jira 카드 상태 "Connected ✅" 로 갱신

---

## 6. n8n 워크플로우 설계

### MVP 워크플로우 5개

| # | 이름 | 방향 | 트리거 | 설명 |
|---|------|------|--------|------|
| 1 | slack-error-monitor | 인바운드 | Slack 메시지 이벤트 | 채널+키워드 매칭 → POST /webhooks/slack-events |
| 2 | jira-issue-receiver | 인바운드 | Jira Webhook | 이슈 생성/수정 → 정규화 → POST /webhooks/issues |
| 3 | jira-polling-backup | 인바운드 | 5분 스케줄 | 누락 이슈 체크 → 멱등성 중복 방지 |
| 4 | jira-ticket-creator | 아웃바운드 | IssueHub 호출 | AI 파싱 결과로 Jira 티켓 생성 |
| 5 | slack-notification | 아웃바운드 | IssueHub 호출 | 알림 + 확인 버튼 Slack 메시지 발송 |

### 워크플로우 자동 생성

IssueHub가 n8n REST API로 워크플로우를 자동 관리:

- `POST /api/v1/workflows` — 워크플로우 생성 (JSON 템플릿 + 사용자 설정값 주입)
- `POST /api/v1/workflows/{id}/activate` — 활성화
- `PUT /api/v1/workflows/{id}` — 설정 변경 시 업데이트
- `DELETE /api/v1/workflows/{id}` — 연동 해제 시 삭제
- `POST /api/v1/credentials` — OAuth credential 등록

워크플로우 JSON 템플릿은 IssueHub 코드에 내장. 사용자 설정값(채널명, 프로젝트키, 키워드 등)만 주입.

---

## 7. FE 연동 설정 화면

### 페이지 구조

`/integrations` — 단일 스크롤 페이지, 3개 섹션

1. **이슈 소스** — Jira(활성), GitHub/GitLab/Notion(Phase 2 표시)
2. **알림 채널** — Slack(활성), Teams/Email(Phase 2 표시)
3. **코드 생성 엔진** — OpenHands, LLM Direct

각 연동은 **카드형 UI**:
- 연결 상태 뱃지 (Connected / Disconnected / Error)
- 설정 버튼, 연결 테스트 버튼, 해제 버튼
- 연결된 경우: 세부 정보 (프로젝트, 채널, 마지막 동기화)

### OAuth 플로우

팝업 방식 사용 (리다이렉트 X):
- OAuth 팝업 → 인증 완료 → `postMessage`로 부모 창에 결과 전달
- 콜백 경로: `app/(auth)/oauth/callback/[provider]/page.tsx`

### n8n 고급 설정

- "n8n 고급 설정 ↗" 버튼 → n8n UI URL로 새 탭 열기
- ADMIN 권한만 접근 가능

### FE 컴포넌트 구조

```
features/integrations/
├── components/
│   ├── connector-grid.tsx          # 카테고리별 카드 그리드 (메인)
│   ├── connector-card.tsx          # 개별 연동 카드 (상태 뱃지)
│   ├── oauth-connect-button.tsx    # OAuth 팝업 트리거 + postMessage 리스너
│   ├── slack-config-modal.tsx      # Slack 채널/키워드 설정
│   ├── jira-config-modal.tsx       # Jira 프로젝트 선택
│   ├── engine-config-modal.tsx     # 코드 생성 엔진 URL/Key
│   └── connection-test-badge.tsx   # 연결 테스트 결과 표시
├── hooks/
│   ├── useConnectors.ts            # SWR: 연동 목록 + 상태
│   ├── useOAuthPopup.ts            # 팝업 open + postMessage
│   └── useConnectorTest.ts         # 연결 테스트 mutation
├── types/
│   └── connector.ts                # ConnectorType, ConnectorStatus, ConnectorConfig
└── utils/
    └── connector-registry.ts       # 플랫폼별 아이콘/라벨/OAuth URL 매핑
```

---

## 8. 대기 이슈 큐

### UI 위치 (B+C)

- **대시보드 위젯**: "대기 이슈 N건" + 긴급 항목 미리보기 → "전체 보기" 클릭 시 이슈 목록으로 이동
- **이슈 목록 탭**: `/issues?tab=pending` — "전체 이슈 / 대기 중" 탭 전환

### 대기 이슈 상태

```
PENDING → CONFIRMED (확정 → Jira 생성 + AI 분석)
PENDING → DISMISSED (무시)
PENDING → EDITED → CONFIRMED (수정 후 확정)
```

### API

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/pending-issues` | 대기 이슈 목록 | ADMIN |
| GET | `/pending-issues/{id}` | 대기 이슈 상세 (AI 파싱 결과) | ADMIN |
| POST | `/pending-issues/{id}/confirm` | 확정 → Jira 생성 + AI 분석 | ADMIN |
| PUT | `/pending-issues/{id}` | 수정 | ADMIN |
| POST | `/pending-issues/{id}/dismiss` | 무시 | ADMIN |

### Slack Interactive 연동

관리자가 Slack [확인] 버튼 클릭 → Slack Interactive Message → n8n → `POST /pending-issues/{id}/confirm`

---

## 9. 인증/권한 (Keycloak)

### 구성

- **Keycloak**: Docker Compose에 포함, OIDC Provider
- **Spring Security**: `spring-boot-starter-oauth2-resource-server`로 JWT 검증
- **역할**: ADMIN, MEMBER

### RBAC 권한 매트릭스

| 기능 | ADMIN | MEMBER |
|------|:-----:|:------:|
| 연동 목록 조회 | ✅ | ✅ (읽기) |
| 연동 추가/수정/삭제 | ✅ | ❌ |
| 연결 테스트 | ✅ | ❌ |
| n8n 고급 설정 접근 | ✅ | ❌ |
| 대기 이슈 확인/무시 | ✅ | ❌ |
| 이슈 목록 조회 | ✅ | ✅ |
| 이슈 상세 + AI 분석 조회 | ✅ | ✅ |
| 정책 관리 | ✅ | ❌ |
| 승인/거절 | ✅ | ❌ |

### 인증 플로우

```
사용자 로그인 → Keycloak (OIDC) → JWT 발급 (역할 포함)
→ IssueHub API 요청 시 Authorization: Bearer {JWT}
→ Spring Security가 Keycloak에서 JWT 검증 + 역할 추출
→ @PreAuthorize("hasRole('ADMIN')") 등으로 권한 체크
```

---

## 10. API 스펙

### 연동 API

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/integrations` | 연동 목록 | ALL |
| POST | `/integrations` | 연동 추가 | ADMIN |
| PUT | `/integrations/{id}` | 연동 수정 | ADMIN |
| DELETE | `/integrations/{id}` | 연동 해제 | ADMIN |
| POST | `/integrations/{id}/test` | 연결 테스트 | ADMIN |
| GET | `/integrations/{id}/n8n-url` | n8n UI 링크 | ADMIN |

### Webhook API (n8n → IssueHub)

인증: HMAC signature 검증 (`X-Webhook-Signature` 헤더, shared secret 기반)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/webhooks/issues` | 외부 이슈 수신 (Jira) — 멱등성: X-Webhook-Id |
| POST | `/webhooks/slack-events` | Slack 에러 감지 이벤트 수신 |
| POST | `/webhooks/slack-interactive` | Slack 버튼 클릭 콜백 |

### OAuth 콜백 API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/oauth/callback/jira` | Jira OAuth 2.0 콜백 |
| GET | `/oauth/callback/slack` | Slack OAuth 2.0 콜백 |

---

## 11. 기존 기획서 대비 변경점

| 기존 기획서 | 변경 |
|-------------|------|
| Slack/Teams = 알림 발송 전용 | Slack = **양방향** (에러 감지 인바운드 + 알림/확인 아웃바운드) |
| 외부 이슈 → 바로 IssueHub 인입 | Slack 에러 → **AI 파싱 + 관리자 확인** → Jira 생성 → IssueHub |
| n8n = webhook 수신만 | n8n = Slack 채널 감시 + **Jira 티켓 생성까지** |
| Jira webhook만 | Webhook + **폴링 보조 + Jira Automation 옵션** |
| 연동 설정 = IssueHub UI만 | IssueHub UI 기본 + **n8n 고급 설정 접근** (n8n = SoT) |
| MVP: 4개 이슈소스 전부 | MVP 1단계: **Jira + Slack만** (나머지 2단계) |
| 인증 없음 (JWT 간소화) | **Keycloak** OIDC + RBAC (ADMIN/MEMBER) |

---

## 12. 잠재 리스크

| 리스크 | 등급 | 대응 |
|--------|------|------|
| Slack Rate Limit | 높음 | Slack Events API (Socket Mode) 사용, 폴링 대신 Push 방식 |
| AI 파싱 정확도 | 중간 | 관리자 확인 단계가 안전장치, 신뢰도 점수 표시 |
| 중복 이슈 생성 | 중간 | Slack ts + Jira sourceId 기반 멱등성, 유사 이슈 감지 |
| OAuth Token 보안 | 높음 | AES-256-GCM 암호화, 키는 환경변수/Vault |
| n8n 장애 시 이슈 누락 | 중간 | 폴링 보조로 누락 복구, n8n health check 모니터링 |

---

## 13. 구현 스코프 (FE/BE 병렬)

### FE (연동 설정 화면)

- 연동 설정 페이지 (`/integrations`) — 카드 그리드 + OAuth 팝업
- 대시보드 대기 이슈 위젯
- 이슈 목록 "대기 중" 탭
- Keycloak 로그인 연동

### BE (인프라 + API)

- Docker Compose (PostgreSQL + Redis + Kafka + n8n + Keycloak + Ollama)
- DB 스키마 (integrations, pending_issues 테이블)
- 연동 API + Webhook API + OAuth 콜백
- core-connector 모듈 (UseCase + Port)
- infra-n8n 모듈 (n8n REST API Adapter)
- Keycloak 설정 (Realm, Client, Roles)

### 병렬 진행 전략

- **API Contract First**: OpenAPI 스펙 먼저 합의
- **FE**: MSW Mock으로 독립 개발
- **BE**: 실제 구현
- 스펙 변경 시 OpenAPI 파일 업데이트 → 양쪽 반영
