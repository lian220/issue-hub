# IssueHub 데이터 플로우 (Data Flow)

> MVP 기획서 기반 이벤트 드리븐 아키텍처 데이터 흐름
> 최종 수정: 2026-04-09

## 1. 전체 시스템 데이터 플로우

```mermaid
flowchart TB
    subgraph EXTERNAL [외부 시스템 — n8n 연동 허브]
        JIRA[Jira Cloud]
        NOTION[Notion]
        GITHUB[GitHub Issues]
        GITLAB[GitLab Issues]
        SLACK[Slack]
        TEAMS[Microsoft Teams]
        EMAIL[Email]
    end

    subgraph N8N [n8n — 이벤트 게이트웨이]
        N8N_IN[Webhook 수신\n이슈 소스 → IssueHub]
        N8N_OUT[알림 발송\nIssueHub → 알림 채널]
    end

    subgraph INBOUND [인바운드 어댑터]
        WH_RECEIVER[Webhook Receiver\ninfra-webhook\n멱등성: X-Webhook-Id]
        REST_API[REST API\napp-api]
    end

    subgraph CORE [코어 도메인 — Hexagonal]
        direction TB
        ISSUE_SVC[IssueService\ncore-issue]
        POLICY_SVC[PolicyService\ncore-policy]
        AI_SVC[AIService\ncore-ai\nSpring AI + RAG]
        AUTO_ENGINE[AutomationEngine\ncore-automation]
        OUTBOX[Outbox 테이블\n트랜잭션 원자성]
    end

    subgraph KAFKA [Kafka — 이벤트 버스]
        direction LR
        ISSUE_TOPIC[이슈 생성 이벤트\npartition key: issue_id]
        ANALYSIS_TOPIC[AI 분석 완료 이벤트]
        CODEGEN_TOPIC[코드 생성 요청 이벤트]
        PR_TOPIC[PR 생성 완료 이벤트]
        DLT[Dead Letter Topic\nretry 3회 실패]
        DEDUP[Consumer 멱등성\nDB dedup table\nON CONFLICT DO NOTHING]
    end

    subgraph PERSISTENCE [영속성 계층]
        PG[(PostgreSQL 16\n+ pgvector HNSW)]
        REDIS[(Redis 7\n캐시)]
    end

    subgraph RAG_PIPELINE [정책 RAG 파이프라인]
        CHUNKING[문단/섹션 단위 청킹]
        EMBEDDING[LLM 임베딩 생성\nOllama / Claude]
        VECTOR_SEARCH[벡터 유사도 검색\npgvector cosine similarity]
    end

    subgraph CODE_GEN [코드 생성 계층]
        OPENHANDS[OpenHands\n코딩 에이전트]
        LLM_DIRECT[LLM 직접 호출\nClaude / Ollama]
        PR_CREATE[PR 생성\nGitHub / GitLab]
    end

    subgraph LLM_LAYER [LLM 계층]
        OLLAMA[Ollama\n로컬 기본]
        CLAUDE_API[Claude API\n폴백]
    end

    subgraph OBSERVABILITY [옵저버빌리티 3축]
        OTEL[OpenTelemetry Collector]
        PROMETHEUS[Prometheus + Alertmanager]
        LOKI[Loki — 로그]
        TEMPO[Grafana Tempo — 트레이스]
        GRAFANA[Grafana 대시보드]
        NODE_EXP[Node Exporter + cAdvisor]
    end

    subgraph FRONTEND [프론트엔드 Next.js]
        FE_DASH[대시보드]
        FE_ISSUES[이슈 목록/상세]
        FE_AI[AI 분석 패널]
        FE_POLICY[정책 관리]
        FE_APPROVAL[승인 워크플로우]
        FE_INTEG[연동 설정]
        FE_MONITOR[모니터링]
    end

    %% 이슈 소스 → n8n → IssueHub
    JIRA -->|Webhook| N8N_IN
    NOTION -->|Webhook| N8N_IN
    GITHUB -->|Webhook| N8N_IN
    GITLAB -->|Webhook| N8N_IN
    N8N_IN -->|HTTP POST| WH_RECEIVER

    %% 프론트엔드 → API
    FRONTEND -->|HTTP| REST_API
    REST_API --> ISSUE_SVC
    REST_API --> POLICY_SVC

    %% 인바운드 → 코어
    WH_RECEIVER --> ISSUE_SVC

    %% 코어 → 영속성 + Outbox
    ISSUE_SVC --> PG
    ISSUE_SVC --> REDIS
    ISSUE_SVC --> OUTBOX
    POLICY_SVC --> PG

    %% 정책 등록 → RAG 파이프라인
    POLICY_SVC --> CHUNKING
    CHUNKING --> EMBEDDING
    EMBEDDING --> LLM_LAYER
    LLM_LAYER --> PG

    %% Outbox → Kafka (Debezium CDC / Polling)
    OUTBOX -->|CDC / Polling| ISSUE_TOPIC

    %% Kafka 이벤트 체인
    ISSUE_TOPIC -->|Consumer + dedup| AI_SVC
    AI_SVC --> VECTOR_SEARCH
    VECTOR_SEARCH --> PG
    AI_SVC --> LLM_LAYER
    AI_SVC --> ANALYSIS_TOPIC

    ANALYSIS_TOPIC --> AUTO_ENGINE
    AUTO_ENGINE --> CODEGEN_TOPIC

    CODEGEN_TOPIC --> CODE_GEN
    OPENHANDS --> PR_CREATE
    LLM_DIRECT --> PR_CREATE
    PR_CREATE --> PR_TOPIC

    %% 실패 → DLT
    CODEGEN_TOPIC -.->|실패/타임아웃| DLT
    DLT -.->|알림| N8N_OUT

    %% 알림 발송
    PR_TOPIC --> N8N_OUT
    N8N_OUT --> SLACK
    N8N_OUT --> TEAMS
    N8N_OUT --> EMAIL

    %% LLM 폴백
    OLLAMA -.->|실패 시| CLAUDE_API

    %% 옵저버빌리티
    CORE --> OTEL
    OTEL --> PROMETHEUS
    OTEL --> LOKI
    OTEL --> TEMPO
    NODE_EXP --> PROMETHEUS
    PROMETHEUS --> GRAFANA
    LOKI --> GRAFANA
    TEMPO --> GRAFANA
    PROMETHEUS --> |Alertmanager| SLACK

    %% 프론트 표시
    REST_API --> FE_DASH
    REST_API --> FE_ISSUES
    REST_API --> FE_AI
    REST_API --> FE_POLICY
    REST_API --> FE_APPROVAL
    REST_API --> FE_INTEG
    REST_API --> FE_MONITOR

    style EXTERNAL fill:#e3f2fd
    style CORE fill:#fff8e1
    style KAFKA fill:#fff3e0
    style RAG_PIPELINE fill:#e8f5e9
    style LLM_LAYER fill:#fce4ec
    style PERSISTENCE fill:#f3e5f5
    style FRONTEND fill:#e0f2f1
    style OBSERVABILITY fill:#eceff1
    style N8N fill:#e1f5fe
    style CODE_GEN fill:#fff9c4
```

## 2. 이슈 처리 이벤트 체인 (시퀀스 다이어그램)

```mermaid
sequenceDiagram
    participant EXT as 외부 이슈 소스
    participant N8N as n8n 허브
    participant WH as Webhook Receiver
    participant IS as IssueService
    participant DB as PostgreSQL
    participant OB as Outbox
    participant KF as Kafka
    participant AI as AI Service
    participant PV as pgvector
    participant LLM as Ollama/Claude
    participant CG as OpenHands/LLM
    participant AP as 관리자
    participant NT as 알림 채널

    Note over EXT,NT: 이슈 등록 → AI 분석 → 코드 생성 → 승인

    EXT->>N8N: Webhook (이슈 변경)
    N8N->>WH: HTTP POST (멱등성: X-Webhook-Id)
    WH->>IS: 이슈 생성 요청
    IS->>DB: INSERT issue + INSERT outbox (동일 트랜잭션)
    DB-->>IS: 저장 완료
    OB->>KF: 이슈 생성 이벤트 (CDC/Polling)

    Note over KF,LLM: AI 이슈 분석 (비동기)
    KF->>AI: Consumer (dedup 체크: ON CONFLICT DO NOTHING)
    AI->>PV: 정책 RAG 검색 (cosine similarity)
    PV-->>AI: 관련 정책 TOP-K

    alt 정책 매칭 성공
        AI->>LLM: 정책 기반 해결 방안 생성
        LLM-->>AI: 해결 방안 + 신뢰도
    else 정책 매칭 실패
        AI->>NT: "정책 추가 필요" 알림
        AI->>LLM: 일반 지식 기반 방안 생성
        LLM-->>AI: 해결 방안 (정책 없음 표시)
    end

    AI->>DB: 분석 결과 저장
    AI->>KF: 코드 생성 요청 이벤트

    Note over KF,CG: 코드 생성 (비동기, 장시간)
    KF->>CG: 코드 생성 시작

    alt 성공
        CG->>CG: PR 생성
        CG->>KF: PR 생성 완료 이벤트
    else 실패/타임아웃
        CG->>KF: Dead Letter Topic
        KF->>NT: 관리자 알림
    end

    Note over AP,NT: 승인 워크플로우
    KF->>AP: 승인 요청 (AI Review Summary 포함)

    alt 승인
        AP->>CG: PR 머지
        CG->>NT: 완료 알림
    else 거절 (코드 수정)
        AP->>KF: 코드 재생성 요청
        KF->>CG: 재생성
    else 거절 (정책 수정)
        AP->>DB: 정책 업데이트
        DB->>KF: 재분석 트리거
        KF->>AI: 재분석
    end
```

## 3. 이벤트 드리븐 설계 원칙

| 원칙 | 구현 방법 |
|------|----------|
| 트랜잭션 원자성 | Transactional Outbox 패턴 (DB저장 + Outbox 동일 트랜잭션) |
| 이벤트 발행 | Debezium CDC 또는 Polling Publisher로 Outbox → Kafka |
| Consumer 멱등성 | DB deduplication 테이블 (event_id UNIQUE constraint + `INSERT ... ON CONFLICT DO NOTHING`) |
| 파티션 키 | issue_id로 동일 이슈 이벤트 순서 보장 |
| 실패 처리 | Dead Letter Topic + 재처리 정책 (retry 3회 → DLT → 관리자 알림) |
| 타임아웃 | OpenHands 호출 타임아웃 설정 + 무응답 시 DLT 이동 |
