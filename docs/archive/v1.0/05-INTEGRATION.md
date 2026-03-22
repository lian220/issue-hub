# IssueHub - 외부 연동 가이드

> 문서 버전: 1.0
> 최종 수정일: 2026-03-21
> 작성자: IssueHub 개발팀
> 상태: 검토 중

---

## 1. 연동 아키텍처 개요

IssueHub는 Jira, GitHub, Slack, Teams, Discord 5개 플랫폼과의 연동을 지원한다.
각 플랫폼은 **커넥터(Connector)** 단위로 관리되며, OAuth 기반 인증과 웹훅 기반 실시간 동기화를 제공한다.

### 1.1 연동 전략 원칙

| 원칙 | 설명 |
|------|------|
| **Webhook 우선** | 실시간 변경 감지는 웹훅을 기본으로 사용 |
| **폴링 폴백** | 웹훅 장애 시 주기적 폴링으로 보완 (5분 간격) |
| **양방향 동기화** | Jira, GitHub는 IssueHub ↔ 외부 양방향 동기화 |
| **단방향 알림** | Slack, Teams, Discord는 IssueHub → 외부 알림 중심 |
| **필드 매핑** | 각 플랫폼의 필드를 IssueHub 내부 모델로 커스텀 매핑 |
| **충돌 해결** | sync_version 기반 낙관적 잠금 + 충돌 플래그 |

### 1.2 연동 데이터 흐름

```
외부 플랫폼                     IssueHub                      사용자
    │                              │                            │
    │  [인바운드: 웹훅/폴링]        │                            │
    │ ───────────────────────────► │                            │
    │                              │  파싱 → 매핑 → 저장        │
    │                              │  → 이벤트 발행              │
    │                              │ ──────────────────────────►│
    │                              │        (SSE 실시간 푸시)    │
    │                              │                            │
    │  [아웃바운드: API 호출]        │                            │
    │ ◄─────────────────────────── │                            │
    │                              │ ◄────────────────────────── │
    │                              │     (이슈 수정, 댓글 추가)   │
```

---

## 2. OAuth 공통 플로우

모든 외부 플랫폼 연동은 OAuth 2.0 기반 인증을 사용한다.

### 2.1 OAuth 인증 흐름

```
사용자                  IssueHub Frontend         IssueHub Backend          외부 플랫폼
  │                          │                          │                      │
  │ 1. "연동 설정" 클릭       │                          │                      │
  │ ────────────────────────►│                          │                      │
  │                          │ 2. GET /connectors/{id}  │                      │
  │                          │    /oauth/authorize      │                      │
  │                          │ ────────────────────────►│                      │
  │                          │                          │ 3. OAuth URL 생성     │
  │                          │                          │    (state 포함)       │
  │                          │ 4. 302 Redirect          │                      │
  │                          │ ◄────────────────────────│                      │
  │ 5. 외부 플랫폼 로그인 페이지                           │                      │
  │ ◄────────────────────────│                          │                      │
  │                          │                          │                      │
  │ 6. 로그인 + 권한 승인      │                          │                      │
  │ ────────────────────────────────────────────────────────────────────────►│
  │                          │                          │                      │
  │                          │                          │ 7. Callback (code)   │
  │                          │                          │ ◄─────────────────── │
  │                          │                          │                      │
  │                          │                          │ 8. code → token 교환 │
  │                          │                          │ ────────────────────►│
  │                          │                          │ ◄─────────────────── │
  │                          │                          │ 9. access_token,     │
  │                          │                          │    refresh_token     │
  │                          │                          │                      │
  │                          │                          │ 10. AES-256 암호화   │
  │                          │                          │     → DB 저장        │
  │                          │                          │                      │
  │                          │ 11. 302 → 설정 완료 페이지 │                      │
  │                          │ ◄────────────────────────│                      │
  │ 12. "연동 완료" 표시      │                          │                      │
  │ ◄────────────────────────│                          │                      │
```

### 2.2 토큰 관리

| 항목 | 처리 방법 |
|------|-----------|
| **저장** | AES-256-GCM 암호화 → `connector_configs.credentials` (BYTEA) |
| **사용** | 복호화 → API 호출 → 사용 후 메모리 즉시 폐기 |
| **갱신** | access_token 만료 시 refresh_token으로 자동 갱신 |
| **폐기** | 커넥터 삭제 시 저장된 토큰 완전 삭제 |
| **암호화 키** | 환경 변수 (`ENCRYPTION_SECRET_KEY`)로 관리, 코드에 하드코딩 금지 |

---

## 3. Jira 연동

### 3.1 개요

| 항목 | 값 |
|------|-----|
| API | Jira REST API v3 |
| 인증 | OAuth 2.0 (3LO) |
| 동기화 방향 | 양방향 |
| 실시간 감지 | Webhook |
| 폴백 | 폴링 (5분) |

### 3.2 OAuth 설정 절차

1. [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)에서 OAuth 2.0 앱 생성
2. Redirect URL 설정: `https://{issuehub-host}/api/v1/connectors/oauth/callback`
3. 필요 스코프:
   - `read:jira-work` - 이슈 조회
   - `write:jira-work` - 이슈 생성/수정
   - `read:jira-user` - 사용자 조회
   - `manage:jira-webhook` - 웹훅 관리
4. Client ID, Client Secret을 IssueHub 환경 변수에 설정

### 3.3 Jira API 사용

**이슈 조회:**

```
GET /rest/api/3/search
Host: {cloud-id}.atlassian.net
Authorization: Bearer {access_token}

?jql=project=PROJ AND updated>=-5m&fields=summary,status,priority,assignee,labels,comment
```

**이슈 생성:**

```
POST /rest/api/3/issue
Content-Type: application/json

{
  "fields": {
    "project": { "key": "PROJ" },
    "summary": "이슈 제목",
    "description": { "type": "doc", "version": 1, "content": [...] },
    "issuetype": { "name": "Bug" },
    "priority": { "name": "High" }
  }
}
```

**이슈 수정:**

```
PUT /rest/api/3/issue/{issueIdOrKey}
Content-Type: application/json

{
  "fields": {
    "summary": "수정된 제목",
    "priority": { "name": "Critical" }
  }
}
```

### 3.4 웹훅 설정

Jira 웹훅은 Jira REST API를 통해 프로그래밍 방식으로 등록한다.

```
POST /rest/api/3/webhook
Content-Type: application/json

{
  "url": "https://{issuehub-host}/api/v1/webhooks/jira",
  "webhooks": [
    {
      "events": [
        "jira:issue_created",
        "jira:issue_updated",
        "jira:issue_deleted",
        "comment_created",
        "comment_updated"
      ],
      "jqlFilter": "project in (PROJ, OPS)"
    }
  ]
}
```

### 3.5 필드 매핑

| Jira 필드 | IssueHub 필드 | 변환 규칙 |
|-----------|---------------|-----------|
| `key` | `external_id` | 그대로 매핑 (예: PROJ-123) |
| `summary` | `title` | 그대로 매핑 |
| `description` | `description` | ADF → Markdown 변환 |
| `status.name` | `status` | 값 매핑 (커스텀 설정 가능) |
| `priority.name` | `priority` | 값 매핑 (Highest→CRITICAL, High→HIGH 등) |
| `issuetype.name` | `issue_type` | 값 매핑 |
| `assignee.accountId` | `assignee_id` | 사용자 매핑 테이블 참조 |
| `labels` | `labels` | 그대로 매핑 |
| `created` | `created_at` | ISO 8601 파싱 |
| `updated` | `updated_at` | ISO 8601 파싱 |
| `customfield_*` | `metadata` (JSONB) | JSONB에 보존 |

**기본 상태 매핑:**

| Jira Status | IssueHub Status |
|-------------|-----------------|
| To Do | OPEN |
| In Progress | IN_PROGRESS |
| In Review | IN_PROGRESS |
| Done | RESOLVED |
| Closed | CLOSED |

관리자가 UI에서 커스텀 매핑을 설정할 수 있다.

### 3.6 양방향 동기화 전략

```
Jira → IssueHub (인바운드):
  1. 웹훅 수신 또는 폴링으로 변경 감지
  2. Jira 이슈 데이터를 필드 매핑에 따라 정규화
  3. sync_version 비교로 충돌 여부 확인
  4. 충돌 없으면 업데이트, 충돌 시 CONFLICT 플래그

IssueHub → Jira (아웃바운드):
  1. IssueHub에서 이슈 수정 발생
  2. 변경된 필드만 추출 (diff)
  3. 필드 매핑 역변환 (IssueHub → Jira 포맷)
  4. Jira REST API로 업데이트
  5. 성공 시 sync_version 증가
```

---

## 4. GitHub 연동

### 4.1 개요

| 항목 | 값 |
|------|-----|
| API | GitHub REST API v3 + GraphQL API v4 |
| 인증 | GitHub App (Installation Token) |
| 동기화 방향 | 양방향 |
| 실시간 감지 | Webhook |
| 폴백 | 폴링 (5분) |

### 4.2 GitHub App 설정

1. [GitHub Developer Settings](https://github.com/settings/apps)에서 GitHub App 생성
2. 설정 항목:

| 항목 | 값 |
|------|-----|
| Homepage URL | `https://{issuehub-host}` |
| Callback URL | `https://{issuehub-host}/api/v1/connectors/oauth/callback` |
| Webhook URL | `https://{issuehub-host}/api/v1/webhooks/github` |
| Webhook Secret | 랜덤 생성 후 환경 변수 저장 |

3. 필요 권한:

| 권한 | 접근 수준 | 용도 |
|------|-----------|------|
| Issues | Read & Write | 이슈 CRUD |
| Pull Requests | Read | PR 정보 조회 |
| Metadata | Read | 레포 메타데이터 |
| Webhooks | Read & Write | 웹훅 수신 |

4. 구독 이벤트: `issues`, `issue_comment`, `pull_request`

### 4.3 HMAC 웹훅 검증

GitHub 웹훅은 `X-Hub-Signature-256` 헤더로 무결성을 검증한다.

```kotlin
fun verifyGitHubWebhook(payload: ByteArray, signature: String, secret: String): Boolean {
    val mac = Mac.getInstance("HmacSHA256")
    mac.init(SecretKeySpec(secret.toByteArray(), "HmacSHA256"))
    val expected = "sha256=" + mac.doFinal(payload).toHexString()
    return MessageDigest.isEqual(expected.toByteArray(), signature.toByteArray())
}
```

### 4.4 웹훅 이벤트 처리

| GitHub 이벤트 | 액션 | IssueHub 처리 |
|---------------|------|---------------|
| `issues` | `opened` | 이슈 생성 |
| `issues` | `edited` | 이슈 수정 (제목, 설명) |
| `issues` | `closed` | 이슈 상태 → CLOSED |
| `issues` | `reopened` | 이슈 상태 → OPEN |
| `issues` | `assigned` | 담당자 변경 |
| `issues` | `labeled` | 라벨 추가 |
| `issues` | `unlabeled` | 라벨 제거 |
| `issue_comment` | `created` | 댓글 추가 |
| `issue_comment` | `edited` | 댓글 수정 |
| `pull_request` | `opened` | PR 이슈로 생성 (issue_type: PR) |
| `pull_request` | `closed` | PR 이슈 상태 업데이트 |

### 4.5 필드 매핑

| GitHub 필드 | IssueHub 필드 | 변환 규칙 |
|-------------|---------------|-----------|
| `number` | `external_id` | `#` 접두사 추가 (예: #123) |
| `html_url` | `external_url` | 그대로 매핑 |
| `title` | `title` | 그대로 매핑 |
| `body` | `description` | Markdown 그대로 |
| `state` | `status` | open→OPEN, closed→CLOSED |
| `labels[].name` | `labels` | 배열 매핑 |
| `assignees[0].login` | `assignee_id` | 사용자 매핑 참조 |
| `milestone.title` | `metadata.github_milestone` | JSONB 저장 |
| `repository.full_name` | `metadata.github_repo` | JSONB 저장 |

### 4.6 GitHub GraphQL 활용

대량 데이터 조회 시 REST API 대신 GraphQL을 사용하여 API 호출 수를 줄인다.

```graphql
query {
  repository(owner: "org", name: "repo") {
    issues(first: 100, after: $cursor, filterBy: { since: $since }) {
      pageInfo { hasNextPage, endCursor }
      nodes {
        number
        title
        body
        state
        createdAt
        updatedAt
        author { login }
        assignees(first: 5) { nodes { login } }
        labels(first: 10) { nodes { name } }
        comments(first: 20) {
          nodes { body, author { login }, createdAt }
        }
      }
    }
  }
}
```

---

## 5. Slack 연동

### 5.1 개요

| 항목 | 값 |
|------|-----|
| API | Slack Web API, Events API |
| 인증 | OAuth 2.0 (Bot Token) |
| 동기화 방향 | IssueHub → Slack (알림), Slack → IssueHub (명령어) |
| 기능 | 알림 발송, Slash Command, Interactive Messages |

### 5.2 Slack App 설정

1. [Slack API](https://api.slack.com/apps)에서 Slack App 생성
2. 설정 항목:

**OAuth & Permissions:**

| Bot Token Scope | 용도 |
|----------------|------|
| `chat:write` | 메시지 발송 |
| `chat:write.customize` | 커스텀 이름/아이콘으로 발송 |
| `channels:read` | 채널 목록 조회 |
| `commands` | Slash Command |
| `users:read` | 사용자 정보 조회 |

**Event Subscriptions:**

| 이벤트 | 용도 |
|--------|------|
| `url_verification` | 초기 URL 확인 |
| `app_mention` | 봇 멘션 감지 |

**Slash Commands:**

| 명령어 | Request URL | 설명 |
|--------|-------------|------|
| `/issue` | `https://{host}/api/v1/webhooks/slack/command` | 이슈 조회/생성 |

**Interactivity:**

| 항목 | URL |
|------|-----|
| Request URL | `https://{host}/api/v1/webhooks/slack/interactive` |

### 5.3 알림 발송

**chat.postMessage API:**

```
POST https://slack.com/api/chat.postMessage
Authorization: Bearer {bot-token}
Content-Type: application/json

{
  "channel": "#incidents",
  "text": "[CRITICAL] 결제 시스템 장애",
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "🚨 Critical 이슈 생성됨" }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*제목:*\n결제 시스템 장애" },
        { "type": "mrkdwn", "text": "*우선순위:*\n🔴 Critical" },
        { "type": "mrkdwn", "text": "*담당자:*\n김개발" },
        { "type": "mrkdwn", "text": "*소스:*\nJira PROJ-456" }
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "IssueHub에서 보기" },
          "url": "https://{host}/issues/{id}"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "담당자 변경" },
          "action_id": "reassign_issue",
          "value": "{issue_id}"
        }
      ]
    }
  ]
}
```

### 5.4 Slash Command 처리

**`/issue` 명령어:**

| 사용법 | 설명 |
|--------|------|
| `/issue search 로그인 에러` | 키워드로 이슈 검색 |
| `/issue create 긴급 배포 필요` | 새 이슈 생성 (모달 팝업) |
| `/issue status PROJ-123` | 특정 이슈 상태 조회 |
| `/issue my` | 나에게 배정된 이슈 목록 |

**처리 흐름:**

```
Slack                    IssueHub
  │                         │
  │ POST /webhooks/slack/   │
  │ command                 │
  │ payload: {              │
  │   command: "/issue",    │
  │   text: "search 에러",  │
  │   user_id: "U01A...",  │
  │   response_url: "..."  │
  │ }                       │
  │ ───────────────────────►│
  │                         │ 1. 명령어 파싱
  │                         │ 2. 이슈 검색 실행
  │ 3. 즉시 응답 (200 OK)   │
  │ ◄───────────────────────│
  │                         │
  │ 4. 비동기 결과 전송      │
  │    (response_url 사용)  │
  │ ◄───────────────────────│
  │                         │
  │ [검색 결과 블록 표시]     │
```

### 5.5 Interactive Messages

**버튼 클릭 등 사용자 상호작용 처리:**

```
POST /api/v1/webhooks/slack/interactive
Content-Type: application/x-www-form-urlencoded

payload={
  "type": "block_actions",
  "trigger_id": "...",
  "user": { "id": "U01A..." },
  "actions": [
    {
      "action_id": "reassign_issue",
      "value": "{issue_id}"
    }
  ]
}
```

버튼 클릭 시 모달을 열어 담당자 선택 UI를 제공할 수 있다.

---

## 6. Microsoft Teams 연동

### 6.1 개요

| 항목 | 값 |
|------|-----|
| API | Microsoft Graph API, Bot Framework |
| 인증 | OAuth 2.0 (Azure AD) |
| 동기화 방향 | IssueHub → Teams (알림) |
| 기능 | Adaptive Cards, Channel Notifications |

### 6.2 Azure AD 앱 등록

1. [Azure Portal](https://portal.azure.com/) → Azure Active Directory → App registrations
2. 새 앱 등록:

| 항목 | 설정 |
|------|------|
| Redirect URI | `https://{host}/api/v1/connectors/oauth/callback` |
| Supported account types | Multitenant |

3. 필요 권한 (Microsoft Graph):

| 권한 | 타입 | 용도 |
|------|------|------|
| `Channel.ReadBasic.All` | Delegated | 채널 목록 조회 |
| `ChannelMessage.Send` | Delegated | 채널 메시지 발송 |
| `Team.ReadBasic.All` | Delegated | 팀 정보 조회 |
| `User.Read` | Delegated | 사용자 정보 조회 |

### 6.3 Bot Framework 설정

1. [Bot Framework Portal](https://dev.botframework.com/)에서 Bot 등록
2. Messaging endpoint: `https://{host}/api/v1/webhooks/teams`
3. Microsoft App ID와 Password를 환경 변수에 설정

### 6.4 Adaptive Cards 알림

```json
{
  "type": "message",
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.4",
        "body": [
          {
            "type": "TextBlock",
            "text": "🚨 Critical 이슈 생성됨",
            "weight": "Bolder",
            "size": "Medium"
          },
          {
            "type": "FactSet",
            "facts": [
              { "title": "제목", "value": "결제 시스템 장애" },
              { "title": "우선순위", "value": "🔴 Critical" },
              { "title": "담당자", "value": "김개발" },
              { "title": "소스", "value": "Jira PROJ-456" },
              { "title": "상태", "value": "OPEN" }
            ]
          }
        ],
        "actions": [
          {
            "type": "Action.OpenUrl",
            "title": "IssueHub에서 보기",
            "url": "https://{host}/issues/{id}"
          }
        ]
      }
    }
  ]
}
```

### 6.5 Graph API를 통한 채널 메시지 발송

```
POST https://graph.microsoft.com/v1.0/teams/{team-id}/channels/{channel-id}/messages
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "body": {
    "contentType": "html",
    "content": "<attachment id='adaptivecard'></attachment>"
  },
  "attachments": [
    {
      "id": "adaptivecard",
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": "{adaptive card JSON}"
    }
  ]
}
```

### 6.6 Subscription 설정 (변경 감지)

Teams 채널의 변경 사항을 감지하기 위한 Graph API Subscription 등록은
현재 버전에서는 지원하지 않으며, Phase 4에서 검토한다.

---

## 7. Discord 연동

### 7.1 개요

| 항목 | 값 |
|------|-----|
| API | Discord Bot API (REST + Gateway WebSocket) |
| Webhook | Discord Webhook (간단한 알림 전용) |
| Interactions | Discord Interactions API (Slash Commands) |
| 인증 | Bot Token, OAuth2 (사용자 인증 필요 시) |
| 동기화 방향 | IssueHub → Discord (알림), Discord → IssueHub (Slash Command) |
| 기능 | 채널 알림 (Embed), Slash Command (`/issue`), 버튼 인터랙션 |

### 7.2 인증 방식

| 방식 | 용도 |
|------|------|
| **Bot Token** | 서버에 봇 초대 후 토큰 발급, API 호출에 사용 |
| **OAuth2** | 사용자 인증이 필요한 경우 (사용자별 연동) |
| **Application ID + Public Key** | Interaction 수신 시 Ed25519 서명 검증 |

### 7.3 Discord Bot 설정

1. [Discord Developer Portal](https://discord.com/developers/applications)에서 Application 생성
2. Bot 탭에서 Bot 추가 및 Token 발급
3. OAuth2 → URL Generator에서 봇 초대 URL 생성

**필요 권한 (Bot Permissions):**

| 권한 | 용도 |
|------|------|
| `Send Messages` | 채널에 알림 메시지 발송 |
| `Embed Links` | Embed 메시지 전송 |
| `Use Slash Commands` | Slash Command 등록 및 응답 |
| `Read Message History` | 메시지 컨텍스트 확인 |

**Slash Command 등록:**

Application Command는 Discord API를 통해 등록한다.

```
PUT https://discord.com/api/v10/applications/{application_id}/commands
Authorization: Bot {bot_token}
Content-Type: application/json

[
  {
    "name": "issue",
    "description": "IssueHub 이슈 관리",
    "options": [
      {
        "name": "create",
        "description": "새 이슈 생성",
        "type": 1,
        "options": [
          { "name": "title", "description": "이슈 제목", "type": 3, "required": true }
        ]
      },
      {
        "name": "search",
        "description": "이슈 검색",
        "type": 1,
        "options": [
          { "name": "keyword", "description": "검색 키워드", "type": 3, "required": true }
        ]
      },
      {
        "name": "status",
        "description": "이슈 상태 확인",
        "type": 1,
        "options": [
          { "name": "issue_id", "description": "이슈 ID", "type": 3, "required": true }
        ]
      }
    ]
  }
]
```

### 7.4 채널 알림 (Webhook)

Discord Webhook URL을 UI에서 설정하여 간편하게 알림을 전송할 수 있다.

**Webhook을 통한 Embed 메시지 발송:**

```
POST {discord_webhook_url}
Content-Type: application/json

{
  "embeds": [{
    "title": "[CRITICAL] 결제 시스템 오류",
    "description": "결제 처리 중 타임아웃 발생",
    "color": 15158332,
    "fields": [
      {"name": "상태", "value": "OPEN", "inline": true},
      {"name": "담당자", "value": "김개발", "inline": true},
      {"name": "출처", "value": "Jira", "inline": true}
    ],
    "url": "https://issuehub.company.com/issues/123",
    "timestamp": "2026-03-21T10:00:00Z"
  }]
}
```

**우선순위별 Embed 색상 매핑:**

| 이슈 우선순위 | Embed 색상 | 색상 코드 (Decimal) |
|--------------|-----------|-------------------|
| CRITICAL | 빨강 | 15158332 (0xE74C3C) |
| HIGH | 주황 | 15105570 (0xE67E22) |
| MEDIUM | 파랑 | 3447003 (0x3498DB) |
| LOW | 초록 | 3066993 (0x2ECC71) |

### 7.5 Slash Command 처리 (`/issue`)

| 사용법 | 설명 |
|--------|------|
| `/issue create [제목]` | 새 이슈 생성 |
| `/issue search [키워드]` | 키워드로 이슈 검색 |
| `/issue status [이슈ID]` | 특정 이슈 상태 조회 |

**처리 흐름:**

```
Discord                   IssueHub
  │                         │
  │ POST /webhooks/discord  │
  │ (Interaction payload)   │
  │ ───────────────────────►│
  │                         │ 1. Ed25519 서명 검증
  │                         │ 2. Interaction 타입 분기
  │                         │    - PING → PONG 응답
  │                         │    - APPLICATION_COMMAND → 명령어 처리
  │                         │    - MESSAGE_COMPONENT → 버튼 처리
  │                         │
  │ 3. Interaction Response │
  │ ◄───────────────────────│
  │                         │
  │ [Embed 결과 표시]        │
```

Discord Interactions API를 사용하며, IssueHub는 Interaction Endpoint URL로 `https://{host}/api/v1/webhooks/discord`를 등록한다.

### 7.6 버튼 인터랙션

알림 메시지에 버튼을 추가하여 이슈 상태 변경, 담당자 배정 등을 Discord에서 직접 수행할 수 있다.

**Message Components (Action Row + Buttons):**

```json
{
  "embeds": [{ "..." : "이슈 알림 Embed" }],
  "components": [
    {
      "type": 1,
      "components": [
        {
          "type": 2,
          "label": "IssueHub에서 보기",
          "style": 5,
          "url": "https://issuehub.company.com/issues/123"
        },
        {
          "type": 2,
          "label": "상태 변경",
          "style": 1,
          "custom_id": "change_status:123"
        },
        {
          "type": 2,
          "label": "담당자 배정",
          "style": 1,
          "custom_id": "assign_issue:123"
        }
      ]
    }
  ]
}
```

### 7.7 커넥터 설정 (UI에서)

| 설정 항목 | 설명 |
|-----------|------|
| Bot Token 입력 | Discord Bot Token (AES-256-GCM 암호화 저장) |
| 알림 채널 선택 | 서버/채널 목록 자동 조회 후 선택 |
| Webhook URL 입력 | 간편 설정 (Bot 없이 알림만 사용 시) |
| 알림 규칙 설정 | 어떤 이벤트에 알림을 보낼지 설정 |

### 7.8 Webhook 검증

Discord Interaction 수신 시 Ed25519 서명 검증을 수행한다.

```
검증 절차:
1. 요청 헤더에서 X-Signature-Ed25519, X-Signature-Timestamp 추출
2. 검증 대상 메시지 = timestamp + request_body
3. Bot의 Public Key로 Ed25519 서명 검증
4. 검증 실패 시 401 Unauthorized 응답
```

> **참고**: Discord는 HMAC이 아닌 Ed25519 서명을 사용한다. 이는 GitHub/Jira/Slack의 HMAC-SHA256 방식과 다르므로 별도의 검증 로직이 필요하다.

### 7.9 필드 매핑

| IssueHub 필드 | Discord Embed 매핑 | 변환 규칙 |
|--------------|-------------------|-----------|
| `priority` | Embed `color` | CRITICAL=빨강, HIGH=주황, MEDIUM=파랑, LOW=초록 |
| `status` | Embed `fields[0]` | 상태값 그대로 표시 |
| `title` | Embed `title` | `[우선순위] 제목` 형식 |
| `description` | Embed `description` | 최대 4096자 (Discord 제한) |
| `assignee` | Embed `fields[1]` | 담당자 표시명 |
| `external_url` | Embed `url` | IssueHub 이슈 링크 |

---

## 8. 웹훅 수신 아키텍처

### 8.1 웹훅 처리 파이프라인

```
외부 플랫폼                   infra-webhook                    Kafka
    │                              │                            │
    │  1. POST /webhooks/{platform}│                            │
    │ ───────────────────────────► │                            │
    │                              │                            │
    │                 2. 서명 검증   │                            │
    │                 (HMAC/토큰)   │                            │
    │                              │                            │
    │                 3. 페이로드 파싱│                            │
    │                 (플랫폼별 파서)│                            │
    │                              │                            │
    │                 4. 정규화     │                            │
    │                 (공통 이벤트)  │                            │
    │                              │  5. 이벤트 발행              │
    │                              │ ────────────────────────►  │
    │                              │  (토픽: webhook-events)     │
    │  6. 200 OK (빠른 응답)       │                            │
    │ ◄─────────────────────────── │                            │
    │                              │                            │
    │                              │           Kafka Consumer   │
    │                              │                ┌───────────┤
    │                              │                │ 7. 이벤트 │
    │                              │                │    소비    │
    │                              │                │           │
    │                              │                │ 8. 커넥터 │
    │                              │                │    서비스  │
    │                              │                │    처리    │
    │                              │                └───────────┘
```

### 8.2 검증 방식

| 플랫폼 | 검증 방식 | 헤더/파라미터 |
|--------|-----------|--------------|
| **Jira** | Webhook Secret 검증 | 커스텀 헤더 |
| **GitHub** | HMAC-SHA256 | `X-Hub-Signature-256` |
| **Slack** | Signing Secret | `X-Slack-Signature`, `X-Slack-Request-Timestamp` |
| **Teams** | Bot Framework Token | `Authorization: Bearer` (JWT 검증) |
| **Discord** | Ed25519 서명 | `X-Signature-Ed25519`, `X-Signature-Timestamp` |

### 8.3 장애 대응

| 상황 | 대응 |
|------|------|
| 웹훅 서명 검증 실패 | 400 응답, 감사 로그 기록, 반복 시 IP 차단 검토 |
| 중복 웹훅 수신 | `X-GitHub-Delivery` 등 고유 ID로 멱등성 보장 |
| 처리 실패 | Kafka DLQ (Dead Letter Queue)로 이동, 재처리 시도 |
| 외부 플랫폼 장애 | 폴링 스케줄러가 5분 간격으로 보완 동기화 |

---

## 9. 동기화 전략

### 9.1 Webhook 우선 + 폴링 폴백

```
┌─────────────────────────────────────────────────────────┐
│                    동기화 전략                             │
│                                                          │
│  [Primary] Webhook 실시간 수신                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 웹훅 수신 → 즉시 처리 → DB 반영 → SSE 푸시        │    │
│  │ 지연: < 5초                                       │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  [Fallback] 폴링 보완 동기화                              │
│  ┌──────────────────────────────────────────────────┐    │
│  │ app-scheduler가 5분마다 실행                       │    │
│  │ - 마지막 동기화 이후 변경된 이슈 조회                │    │
│  │ - 웹훅으로 누락된 변경사항 보완                     │    │
│  │ - 커넥터별 last_sync_at 기준으로 증분 조회          │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  [Recovery] 전체 동기화                                   │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 관리자가 수동으로 트리거                            │    │
│  │ POST /api/v1/connectors/{id}/sync                 │    │
│  │ - 전체 이슈를 재동기화                              │    │
│  │ - 초기 설정 시 또는 장애 복구 시 사용                │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 9.2 충돌 해결 전략

양방향 동기화 시 양쪽에서 동시에 같은 이슈를 수정하면 충돌이 발생할 수 있다.

**충돌 감지:**

```
sync_version을 사용한 낙관적 잠금:

1. IssueHub에서 이슈 조회 (sync_version = 5)
2. 외부에서 같은 이슈 수정 (웹훅 도착, sync_version → 6)
3. IssueHub에서 수정 시도 (sync_version = 5 전송)
4. 서버에서 현재 sync_version(6) != 요청 sync_version(5) → 충돌 감지
```

**충돌 해결 정책:**

| 정책 | 설명 | 적용 상황 |
|------|------|-----------|
| **Last-Write-Wins** | 마지막 수정이 최종 반영 | 기본 정책, 대부분의 필드 |
| **External-Priority** | 외부 플랫폼 값 우선 | 외부에서 관리하는 필드 (예: Jira Sprint) |
| **Internal-Priority** | IssueHub 값 우선 | 내부에서만 관리하는 필드 |
| **CONFLICT 플래그** | 충돌을 사용자에게 알림 | 중요 필드 (상태, 담당자) 동시 수정 시 |

**CONFLICT 플래그 처리:**

```json
// 이슈 metadata에 충돌 정보 저장
{
  "conflicts": [
    {
      "field": "status",
      "internalValue": "RESOLVED",
      "externalValue": "IN_PROGRESS",
      "detectedAt": "2026-03-21T15:00:00Z",
      "resolvedBy": null
    }
  ]
}
```

사용자가 UI에서 충돌을 확인하고 어느 쪽 값을 채택할지 수동으로 결정할 수 있다.

---

## 10. 알림 채널 통합

### 10.1 알림 발송 흐름

```
이벤트 발생
    │
    ▼
알림 서비스
    │
    ├─ 사용자별 notification_prefs 확인
    │
    ├─ [email=true] ──→ 이메일 발송 (SMTP)
    │
    ├─ [slack=true] ──→ Slack DM 또는 채널 메시지
    │
    ├─ [teams=true] ──→ Teams Adaptive Card
    │
    ├─ [discord=true] ──→ Discord Embed 메시지 (Webhook/Bot)
    │
    └─ [in_app=true] ──→ DB 저장 + SSE 푸시
```

### 10.2 알림 유형별 채널

| 알림 유형 | 기본 채널 | 설정 가능 여부 |
|-----------|-----------|--------------|
| 이슈 배정 | Slack DM, In-App | O |
| SLA 위반 임박 | Slack 채널, Email | O |
| SLA 위반 | Slack 채널, Email, Teams, Discord | O |
| 정책 게시 | Email, In-App | O |
| 동기화 오류 | Slack 채널 (관리자), In-App | O |
| 자동화 실행 결과 | In-App | O |

---

## 11. 환경 변수 설정 참조

```bash
# Jira
JIRA_OAUTH_CLIENT_ID=your-client-id
JIRA_OAUTH_CLIENT_SECRET=your-client-secret

# GitHub
GITHUB_APP_ID=12345
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/private-key.pem
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# Slack
SLACK_CLIENT_ID=your-client-id
SLACK_CLIENT_SECRET=your-client-secret
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Teams
TEAMS_APP_ID=your-app-id
TEAMS_APP_PASSWORD=your-app-password
AZURE_TENANT_ID=your-tenant-id

# Discord
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_APPLICATION_ID=your-application-id
DISCORD_PUBLIC_KEY=your-public-key

# 공통
ENCRYPTION_SECRET_KEY=your-32-byte-encryption-key
WEBHOOK_BASE_URL=https://your-issuehub-host
```
