# IssueHub 데이터 플로우 (Data Flow)

> 외부 시스템 <-> IssueHub <-> AI 분석 파이프라인 데이터 흐름을 섹션별로 분리

---

## 1. 인바운드 데이터 흐름 (외부 -> IssueHub)

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 40, 'rankSpacing': 60, 'padding': 20}}}%%
flowchart LR
    JIRA[Jira Cloud] -->|Webhook| WH[Webhook Receiver]
    GITHUB[GitHub] -->|Webhook| WH
    SLACK[Slack] -->|슬래시 커맨드| WH

    WH --> VERIFY[서명 검증]
    VERIFY --> MAP[필드 매핑]
    MAP --> PII[PII 마스킹]
    PII --> CONFLICT[충돌 검사]
    CONFLICT --> SVC[IssueService]
    SVC --> DB[(PostgreSQL)]

    style JIRA fill:#e3f2fd,stroke:#1565c0
    style GITHUB fill:#e3f2fd,stroke:#1565c0
    style SLACK fill:#e3f2fd,stroke:#1565c0
    style DB fill:#f3e5f5,stroke:#7b1fa2
```

---

## 2. 프론트엔드 <-> API

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 40, 'rankSpacing': 60, 'padding': 20}}}%%
flowchart LR
    DASH[대시보드] --> API[REST API]
    ISSUES[이슈 목록/상세] --> API
    AI_PANEL[AI 분석 패널] --> API
    CONNECTOR[커넥터 설정] --> API

    API --> ISSUE_SVC[IssueService]
    API --> PROJ_SVC[ProjectService]

    ISSUE_SVC --> PG[(PostgreSQL)]
    ISSUE_SVC --> REDIS[(Redis)]
    PROJ_SVC --> PG

    style DASH fill:#e0f2f1,stroke:#00695c
    style ISSUES fill:#e0f2f1,stroke:#00695c
    style AI_PANEL fill:#e0f2f1,stroke:#00695c
    style CONNECTOR fill:#e0f2f1,stroke:#00695c
    style PG fill:#f3e5f5,stroke:#7b1fa2
    style REDIS fill:#f3e5f5,stroke:#7b1fa2
```

---

## 3. 이벤트 후처리

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 40, 'rankSpacing': 60, 'padding': 20}}}%%
flowchart TD
    SVC[IssueService] --> EVENT[EventBus]

    EVENT --> AUTO[자동화 엔진]
    EVENT --> NOTIF[알림 디스패처]
    EVENT --> SSE[SSE 실시간]
    EVENT --> SYNC[동기화 오케스트레이터]

    AUTO --> SVC
    SYNC -->|PUT| JIRA[Jira]
    SYNC -->|PATCH| GITHUB[GitHub]

    style EVENT fill:#fff8e1,stroke:#f9a825
    style JIRA fill:#e3f2fd,stroke:#1565c0
    style GITHUB fill:#e3f2fd,stroke:#1565c0
```

---

## 4. AI 코드 인덱싱 (백그라운드)

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 40, 'rankSpacing': 60, 'padding': 20}}}%%
flowchart LR
    REPO[GitHub Repo] -->|bare clone / fetch| MIRROR[Git Mirror]
    MIRROR --> CHUNK[코드 청킹]
    CHUNK --> EMBED[임베딩 생성]
    EMBED --> VECTOR[(pgvector)]

    style REPO fill:#e3f2fd,stroke:#1565c0
    style VECTOR fill:#f3e5f5,stroke:#7b1fa2
```

---

## 5. 이슈 AI 분석

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 40, 'rankSpacing': 60, 'padding': 20}}}%%
flowchart TD
    ISSUE[이슈 생성/수정] --> ENRICH[TicketEnrichment]

    ENRICH --> SEARCH[pgvector 유사도 검색]
    SEARCH --> CHUNKS[관련 코드 TOP-K]
    CHUNKS --> LLM{LLM 분석}

    LLM -->|기본| OLLAMA[Ollama]
    LLM -->|폴백| CLAUDE[Claude API]

    OLLAMA --> RESULT[분석 결과]
    CLAUDE --> RESULT

    RESULT --> SAVE[(PostgreSQL)]
    RESULT --> UI[AI 분석 패널]

    style ISSUE fill:#fff8e1,stroke:#f9a825
    style OLLAMA fill:#fce4ec,stroke:#c62828
    style CLAUDE fill:#fce4ec,stroke:#c62828
    style SAVE fill:#f3e5f5,stroke:#7b1fa2
    style UI fill:#e0f2f1,stroke:#00695c
```

---

## 6. 이슈 동기화 시퀀스

### 6-1. 인바운드 (Jira -> IssueHub)

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '18px', 'fontFamily': 'arial'}, 'sequence': {'actorFontSize': 18, 'messageFontSize': 16, 'noteFontSize': 16}}}%%
sequenceDiagram
    participant J as Jira
    participant WH as Webhook
    participant FM as FieldMapper
    participant IS as IssueService
    participant DB as PostgreSQL
    participant EB as EventBus

    J->>WH: 이슈 변경 Webhook
    WH->>WH: 서명 검증
    WH->>FM: 필드 매핑
    FM->>FM: PII 마스킹
    FM->>IS: 저장 요청
    IS->>DB: INSERT/UPDATE
    IS->>EB: IssueUpdatedEvent
```

### 6-2. 이벤트 후처리 + 아웃바운드

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '18px', 'fontFamily': 'arial'}, 'sequence': {'actorFontSize': 18, 'messageFontSize': 16, 'noteFontSize': 16}}}%%
sequenceDiagram
    participant IS as IssueService
    participant EB as EventBus
    participant AE as Automation
    participant SO as SyncOrch
    participant NT as Notification
    participant J as Jira

    IS->>EB: IssueUpdatedEvent
    EB->>AE: 규칙 매칭 + 액션
    EB->>NT: 알림 발송
    EB->>SO: 아웃바운드 동기화
    SO->>J: PUT /issue/{key}
    J-->>SO: 200 OK
```

---

## 7. 자동화 규칙 실행

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 40, 'rankSpacing': 60, 'padding': 20}}}%%
flowchart LR
    TRIGGER[트리거 발생] --> MATCH{규칙 매칭}

    MATCH -->|없음| SKIP[스킵]
    MATCH -->|있음| EVAL{조건 평가}

    EVAL -->|불충족| SKIP
    EVAL -->|충족| ACTIONS[액션 실행]

    ACTIONS --> LOG[실행 이력 저장]

    style TRIGGER fill:#fff8e1,stroke:#f9a825
    style ACTIONS fill:#e8f5e9,stroke:#4caf50
```
