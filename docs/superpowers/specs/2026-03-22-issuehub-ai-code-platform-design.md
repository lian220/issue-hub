# IssueHub AI 코드 분석 & 자동 개발 플랫폼 설계서

> 문서 버전: 3.0
> 작성일: 2026-03-22
> 최종 수정일: 2026-03-23
> 상태: v3.0 리뷰 중 (Project Wizard 섹션 추가)

---

## 1. 개요

### 1.1 비전

IssueHub를 **"코드를 이해하는 이슈 관리 플랫폼"**으로 확장한다.

- 여러 프로젝트(Git 레포)를 등록하고 통합 관리
- AI가 레포를 분석하여 **고품질 티켓을 생성**(시장에 없는 차별점)
- 티켓 기반으로 **AI 코딩 에이전트가 자동 개발 → PR 생성** (사람이 리뷰 후 머지)
- 모든 분석/개발 결과를 중앙 대시보드에서 추적
- **[v3.0] 새 프로젝트를 아이디어부터 MVP 배포까지 원클릭으로 생성** (Project Wizard)

### 1.2 핵심 차별점

| 기존 도구 | 한계 |
|-----------|------|
| OpenHands, SWE-agent, Devin | 단일 레포 단위, 티켓이 이미 있어야 동작 |
| Jira, Linear, GitHub Issues | 이슈 관리만, 코드 분석 없음 |
| Greptile, CodeRabbit | 코드 분석만, 이슈 관리 없음 |
| Vercel v0, Bolt.new, Lovable | 코드 생성/배포만, 이슈 관리/프로젝트 라이프사이클 없음 |

**IssueHub = 이슈 통합 + AI 티켓 품질 관리 + 코딩 에이전트 연동 + 프로젝트 생성/배포**

### 1.3 범위 결정

| 직접 만드는 것 | 기존 도구를 연동하는 것 |
|---------------|----------------------|
| 프로젝트/레포 관리 | 코드 수정/PR 생성 → OpenHands |
| 티켓 통합 관리 (Jira, GitHub 등) | LLM 추론 → Ollama, Claude, Gemini |
| AI 티켓 품질 분석 (핵심 차별점) | 임베딩 → Ollama, OpenAI |
| 코드 인덱싱/임베딩/검색 | CI/CD → 기존 파이프라인 |
| 통합 대시보드 | |
| 작업 오케스트레이션 | |
| [v3.0] MVP 분석 + PRD/ERD 자동 생성 | 배포 → Vercel, Railway, Supabase |
| [v3.0] 코드 스캐폴딩 (템플릿 + AI) | |

---

## 2. 자동 개발 워크플로우

### 2.1 전체 흐름

```
[티켓 생성]
  │
  ▼
[AI 티켓 보강] ← 레포 분석으로 기술 컨텍스트 자동 추가
  │               (영향 파일, 관련 코드, 유사 이슈)
  ▼
[사람이 검토] → 티켓 수정/보완
  │
  ▼
[자동 개발 시작 버튼] ← 명시적 트리거 (자동 실행 아님)
  │
  ▼
[코딩 에이전트 실행] → 코드 분석 → 수정 → PR 생성
  │
  ▼
[사람이 PR 리뷰 → 머지]
  │
  ▼
[결과 추적] ← 대시보드에서 티켓-PR 연결 관리
```

### 2.2 티켓 소스

- IssueHub 내부에서 직접 생성
- 외부(Jira, GitHub Issues 등)에서 웹훅으로 수신
- 두 경우 모두 자동 개발 트리거는 **사람이 버튼을 눌렀을 때만**

### 2.3 [v3.0] Project Wizard 워크플로우

기존 프로젝트 연동 외에, **아이디어만으로 새 프로젝트를 생성하고 배포까지** 하는 온보딩 플로우를 제공한다.

#### 2.3.1 두 가지 프로젝트 추가 경로

```
프로젝트 추가
├── 기존 프로젝트 연동 (현재 설계대로)
│   └── Git URL 입력 → 코드 분석 → 이슈 관리
└── 새 프로젝트 만들기 (Project Wizard)
    └── 아이디어 입력 → AI PRD/ERD → 스캐폴딩 → 배포 → 이슈 관리
```

#### 2.3.2 Wizard 단계별 흐름

```
[Step 1] 아이디어 입력
  사용자: "팀원들이 쓸 수 있는 할일 관리 앱, 로그인 있고 팀별로 보드 나눠야 함"
  │
  ▼
[Step 2] AI가 ProjectBlueprint 생성 → 사용자 검토/수정
  ├── PRD (프로젝트 개요, 핵심 기능 목록 - 체크박스로 on/off)
  ├── ERD (테이블, 컬럼, 관계 - 시각화 + 편집 가능)
  └── 페이지 구조 (라우트, 화면 목록)
  │
  ▼
[Step 3] 스택 + 배포 타겟 선택
  ├── 프론트: Next.js | Vite+React
  ├── 백엔드: Next.js API Routes | Spring Boot+Kotlin | 불필요
  ├── DB: Supabase | Railway PostgreSQL | 불필요
  └── 배포: Vercel | Railway | Vercel+Supabase
  │
  ▼
[Step 4] 최종 확인 → [생성 시작] 버튼
  │
  ▼
[Step 5] 비동기 생성 (진행률 표시)
  1. GitHub 레포 생성
  2. 코드 스캐폴딩 (베이스 템플릿 + AI 커스터마이징)
  3. 코드 푸시
  4. 배포 플랫폼 연결 + 배포
  5. DB 프로비저닝 + migration 실행
  6. IssueHub 프로젝트 등록
  7. PRD 기능 목록 → 이슈 자동 생성
  │
  ▼
[완료]
  - 라이브 URL 반환
  - GitHub 레포 URL
  - 이슈 N개 생성됨 → IssueHub 대시보드로 이동
  - 이후는 기존 이슈 기반 워크플로우로 전환
```

#### 2.3.3 Wizard 완료 후 전환

Wizard로 생성된 프로젝트는 기존 연동 프로젝트와 **동일한 상태**가 된다:
- GitHub 레포가 있으므로 코드 인텔리전스 분석 가능
- AI 티켓 보강, 코딩 에이전트 자동 개발 모두 사용 가능
- Vercel/Railway가 GitHub에 연결되어 PR 머지 시 자동 재배포

#### 2.3.4 대상 사용자

| 사용자 | 사용 방식 |
|--------|----------|
| 기획자/PM (비개발자) | 아이디어 입력 → AI가 PRD/ERD 생성 → 검토/수정 → MVP 배포 |
| 개발자 | 스캐폴딩 자동화 → 배포 세팅 생략 → 이슈 기반으로 고도화 |

#### 2.3.5 대화형 빌더 (v4.0 이후)

현재는 단계별 Wizard(폼 기반). 향후 챗봇 인터페이스에서 자연어로 프로젝트를 만드는 Chat-First Builder는 v4.0에서 검토.

---

## 3. 아키텍처

### 3.1 3-컴포넌트 구조

```
┌──────────┐  ┌──────────────────┐  ┌──────────────┐
│   Hub    │  │ Code Intelligence │  │  LLM / Agent │
│          │  │                   │  │              │
│ 티켓 관리 │  │ Git clone/fetch   │  │ Ollama       │
│ 대시보드  │  │ 코드 인덱싱        │  │ Claude API   │
│ RBAC     │  │ 임베딩/검색        │  │ Gemini API   │
│ 자동화   │  │ AST 분석          │  │ OpenHands    │
│ 오케스트  │  │                   │  │ SWE-agent    │
└──────────┘  └──────────────────┘  └──────────────┘
```

### 3.2 3가지 배포 모드

#### 모드 1: 올인원 셀프호스팅

```
고객 서버 (Mac Mini 등)
┌─────────────────────────────────────┐
│  Hub + Code Intelligence + Ollama   │
│  (Docker Compose)                   │
│  모든 데이터가 로컬                   │
└─────────────────────────────────────┘
```

- 대상: 소규모 팀, 보안 민감 조직, 에어갭 환경
- 설치: `docker compose up`

#### 모드 2: 하이브리드 (SaaS + Agent)

```
IssueHub Cloud              고객 인프라
┌──────────────┐           ┌─────────────────────┐
│     Hub      │ ◄─gRPC─► │  Code Intelligence  │
│  (SaaS)      │           │  + Ollama           │
│  코드 없음    │           │  (Agent 컨테이너)    │
└──────────────┘           └─────────────────────┘
```

- 대상: 코드 외부 반출 불가, 중앙 관리 필요
- 설치: `docker run issuehub/agent --token=xxx --server=https://hub.issuehub.io`

#### 모드 3: 완전 SaaS (API 온디맨드)

```
IssueHub Cloud
┌──────────────────────────────────┐
│  Hub + GitHub/GitLab API 접근     │
│  설치 불필요, 분석 품질 제한적      │
└──────────────────────────────────┘
```

- 대상: 무료 티어, 체험용, 보안 덜 민감한 오픈소스
- 제한: 코드 인덱싱/임베딩 불가, API rate limit

#### 프로젝트별 혼합 가능

```
Organization: 우리 회사
├── 결제 서비스 → Agent 모드 (보안 민감)
├── 블로그 → API 모드 (오픈소스)
└── 관리자 포털 → Local 모드 (같은 서버)
```

### 3.3 헥사고날 포트/어댑터

모든 외부 연동을 포트로 추상화하여, 프로젝트별로 다른 구현체를 선택 가능:

```
┌─────────────────────────────────────────────────────────┐
│                    IssueHub 포트 구조                     │
│                                                          │
│  CodeIntelPort (코드 분석)     CodingAgentPort (코드 수정) │
│  ├── LocalCodeIntelAdapter     ├── OpenHandsAdapter      │
│  ├── RemoteCodeIntelAdapter    ├── SweAgentAdapter       │
│  └── GitHubApiAdapter          ├── DevinApiAdapter       │
│                                └── CopilotSdkAdapter     │
│                                                          │
│  LlmPort (LLM)                EmbeddingPort (임베딩)     │
│  ├── OllamaAdapter             ├── OllamaEmbedAdapter    │
│  ├── ClaudeApiAdapter          ├── OpenAiEmbedAdapter    │
│  └── GeminiApiAdapter          └── VoyageEmbedAdapter    │
└─────────────────────────────────────────────────────────┘
```

### 3.4 핵심 인터페이스 정의

```kotlin
// 코드 분석 (읽기)
interface CodeIntelPort {
    fun analyzeForTicket(projectId: UUID, ticketContext: String): CodeAnalysisResult
    fun searchCode(projectId: UUID, query: String): List<CodeMatch>
    fun getAffectedFiles(projectId: UUID, keywords: List<String>): List<FileInfo>
    fun getRepoStatus(projectId: UUID): RepoSyncStatus
}

// 코드 수정 (쓰기) - 에이전트 위임
interface CodingAgentPort {
    fun createPullRequest(task: CodingTask): PrResult
    fun getTaskStatus(taskId: UUID): TaskStatus
    fun cancelTask(taskId: UUID)
}

// LLM 추론 (ADR-004 확장, 신규 ADR-007 필요)
// tenantId는 포트 시그니처가 아닌 RequestContext(ThreadLocal)로 전달
// classify()는 ADR-004에서 유지, 여기서는 생략
interface LlmPort {
    fun generate(prompt: String, context: List<String> = emptyList()): LlmResponse
    fun classify(text: String, categories: List<String>): ClassificationResult
}

// 임베딩 (차원은 프로젝트 설정의 embedding_provider에 따라 결정)
interface EmbeddingPort {
    fun embed(text: String): FloatArray
    fun embedBatch(texts: List<String>): List<FloatArray>
    fun dimensions(): Int  // ADR-004: DB vector column migration 시 사용
}
```

### 3.5 프로젝트 설정

```yaml
# 프로젝트별 설정 예시
project:
  name: "결제 서비스"
  code-intel:
    mode: agent                    # local | agent | api
  coding-agent:
    provider: openhands            # openhands | swe-agent | devin | none
  llm:
    analysis: ollama               # ollama | claude | gemini
    fallback: claude               # 복잡한 분석 시 폴백
  embedding:
    provider: ollama               # ollama | openai | voyage
```

---

## 4. 코드 인텔리전스 파이프라인

### 4.1 역할 분리

| 역할 | 담당 | 이유 |
|------|------|------|
| 코드 읽기/분석 | IssueHub (직접) | 빈번, 저지연 필요, 핵심 차별점 |
| 코드 수정/PR | 코딩 에이전트 (위임) | 복잡한 에이전트 로직, 기존 도구 활용 |

### 4.2 코드 인덱싱 아키텍처

```
[Git Repo] ──webhook/poll──► [Code Indexing Pipeline]
                                    │
                         ┌──────────┼──────────┐
                         ▼          ▼          ▼
                    [Chunker]   [AST Parser]  [Git Analyzer]
                    (함수/클래스  (심볼 추출,   (blame, 변경빈도,
                     단위 분할)   의존관계)     최근 커밋)
                         │          │          │
                         ▼          ▼          ▼
                    [EmbeddingPort] ──► pgvector (code_embeddings)
                                        + symbol_index
                                        + dependency_graph
```

### 4.3 Git 관리 전략

- **최초**: `git clone --bare` (서버에 저장)
- **이후**: `git fetch` (변경분만, webhook 트리거 또는 주기적)
- **작업 시**: `git worktree` (티켓별 격리된 작업 디렉토리)
- **주기적**: 백그라운드 sync (5분마다, fetch 지연 최소화)

```
/data/repos/
├── {project_id}.git/              ← bare clone (계속 유지)
│   ├── worktree-TICKET-123/       ← 티켓별 작업 공간 (임시)
│   └── worktree-TICKET-456/       ← 병렬 작업 가능
├── {project_id_2}.git/
```

### 4.4 티켓 품질 분석 흐름

```
[이슈 생성/수정]
  │
  ▼
[Ticket Enrichment Service]
  │
  ├── 코드 시맨틱 검색 (pgvector)
  ├── 심볼 검색 (symbol_index)
  ├── 변경 이력 분석 (git blame/log)
  └── 유사 이슈 검색 (기존 이슈 임베딩)
  │
  ▼
[LLM Context Assembly]
  (관련 코드 + 이슈 텍스트 + 유사 이슈 + 변경 이력)
  │
  ▼
[LlmPort.generate()]
  │
  ▼
[티켓에 자동 추가]
  - 영향받는 파일/모듈 목록
  - 관련 변경 이력 요약
  - 수정 범위 제안
  - 유사 과거 이슈 참조
```

---

## 5. LLM 전략

### 5.1 하이브리드 모델

```
일상적 분석 (80%)              복잡한 분석 (20%)
├── Ollama 로컬                ├── Claude Sonnet API
├── 티켓 요약/분류              ├── 복잡한 버그 추론
├── 코드 컨텍스트 생성          ├── 아키텍처 수준 분석
├── 유사 이슈 탐지              └── 멀티파일 영향도 분석
└── 비용: 전기세만              └── 비용: 월 $10-50 수준
```

### 5.2 Ollama 로컬 모델 추천

> 모델 추천은 2026-03-22 기준이며, 구현 시점에 재평가 필요

| 용도 | 추천 모델 | RAM | 속도 |
|------|----------|-----|------|
| 메인 분석 | Qwen3-Coder-Next (3B active, MoE) | ~8GB | 40-60 tok/s |
| 고품질 분석 | Qwen2.5-Coder-14B | ~10GB | 15-25 tok/s |
| 최고 품질 (48GB+) | Qwen2.5-Coder-32B | ~22GB | 8-14 tok/s |
| 임베딩 | nomic-embed-code | ~1GB | 빠름 |

### 5.3 Ollama 서버 설정

```
OLLAMA_NUM_PARALLEL=4        # 동시 4건 처리
OLLAMA_KEEP_ALIVE=24h        # 모델 메모리 유지
OLLAMA_KV_CACHE_TYPE=q8_0    # KV cache 양자화
```

### 5.4 Mac Mini 사양별 권장

| 사양 | 추천 모델 | 일일 처리량 |
|------|----------|-----------|
| M4 Pro 24GB | Qwen3-Coder-Next | ~3,000건 |
| M4 Pro 36GB | Qwen2.5-Coder-14B | ~2,000건 |
| M4 Pro 48GB | Qwen2.5-Coder-32B | ~1,500건 |

---

## 6. 데이터 모델

### 6.1 계층 구조

```
Organization (네이버, 토스 — 또는 단일 조직)
  └── Project (Git 레포 단위, service_tag로 서비스 구분)
       └── Issue (통합 이슈)
```

### 6.2 기존 테이블 마이그레이션

v1에서는 `org_id` 컬럼과 FK를 추가하되, RLS 정책 적용은 v3(멀티 조직)에서 수행한다.

```sql
-- 기존 테이블에 org_id 추가 (V2 마이그레이션)
ALTER TABLE users ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
ALTER TABLE issues ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
ALTER TABLE teams ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
ALTER TABLE policies ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
ALTER TABLE connector_configs ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
ALTER TABLE automation_rules ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
ALTER TABLE audit_logs ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
```

### 6.3 신규 테이블

```sql
-- 조직
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'FREE',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 프로젝트 (Git 레포 연결)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    service_tag VARCHAR(100),                      -- 서비스 구분 (증권, 쇼핑 등)
    git_url TEXT,                                    -- nullable: Wizard 프로젝트는 레포 생성 후 채워짐
    git_branch VARCHAR(100) DEFAULT 'main',
    code_intel_mode VARCHAR(20) DEFAULT 'local',   -- local | agent | api
    coding_agent VARCHAR(20) DEFAULT 'none',       -- openhands | swe-agent | none
    llm_provider VARCHAR(20) DEFAULT 'ollama',     -- ollama | claude | gemini
    embedding_provider VARCHAR(20) DEFAULT 'ollama',
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 코드 청크 임베딩
CREATE TABLE code_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    file_path TEXT NOT NULL,
    chunk_type VARCHAR(20) NOT NULL,    -- function, class, file, block
    symbol_name TEXT,
    content TEXT NOT NULL,
    start_line INT,
    end_line INT,
    embedding_dimensions INT NOT NULL DEFAULT 768,  -- provider에 따라 768(Ollama), 1536(OpenAI), 3072(OpenAI large)
    embedding vector,  -- 차원은 provider별로 다름, 인덱스는 차원 확정 후 생성
    last_commit_sha VARCHAR(40),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스는 embedding_dimensions 확정 후 생성
-- CREATE INDEX idx_code_chunks_embedding ON code_chunks
--     USING hnsw (embedding vector_cosine_ops);

-- 심볼 인덱스
CREATE TABLE symbol_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    symbol_name TEXT NOT NULL,
    symbol_type VARCHAR(20) NOT NULL,   -- function, class, interface
    file_path TEXT NOT NULL,
    line_number INT,
    language VARCHAR(20)
);

-- 파일 의존성
CREATE TABLE file_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    source_file TEXT NOT NULL,
    target_file TEXT NOT NULL,
    dependency_type VARCHAR(20)         -- import, call, extend
);

-- 자동 개발 작업
CREATE TABLE coding_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    issue_id UUID NOT NULL REFERENCES issues(id),
    agent_provider VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, RUNNING, COMPLETED, FAILED
    pr_url TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 6.4 멀티테넌트 격리 전략

**v1 (단일 조직)**: `org_id` 컬럼 + FK만 추가. RLS 미적용. 애플리케이션 레벨에서 org_id 필터링.
**v3 (멀티 조직)**: PostgreSQL RLS 정책 적용. pgvector 검색 시 org_id 필터 강제.

```sql
-- v3에서 적용할 RLS (v1에서는 미적용)
-- ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY org_isolation ON issues
--     USING (org_id = current_setting('app.current_org_id')::uuid);
```

**v1에서 org_id 컬럼을 추가하는 이유**: 나중에 추가하면 모든 쿼리, API, 테스트를 수정해야 함.
스키마 기반만 먼저 잡고, 정책 적용은 멀티 조직이 실제로 필요할 때.

---

## 7. 모듈 구조

> 기존 모듈(`core-domain`, `core-issue`, `core-policy`, `core-automation`, `core-connector`,
> `infra-persistence`, `infra-kafka` 등)은 유지한다. 아래는 **추가되는 모듈**만 표시한다.
> `core-hub`는 기존 core 모듈들을 대체하지 않으며, 새로운 오케스트레이션 레이어로 추가된다.

```
backend/
├── core-issue/                      # (기존 유지) 이슈 도메인
├── core-policy/                     # (기존 유지) 정책 도메인
├── core-automation/                 # (기존 유지) 자동화 도메인
├── core-connector/                  # (기존 유지) 커넥터 도메인
├── core-ai/                         # (기존 유지) AI 도메인 (LlmPort, EmbeddingPort)
├── infra-persistence/               # (기존 유지)
├── infra-kafka/                     # (기존 유지)
├── infra-llm/                       # (기존 유지)
│
├── core-code-intel/                 # [신규] 코드 인텔리전스 도메인
│   ├── port/outbound/
│   │   ├── CodeIntelPort.kt         # 코드 분석 추상화
│   │   └── CodingAgentPort.kt       # 코딩 에이전트 추상화
│   ├── indexer/
│   │   ├── GitRepoMirror.kt        # git clone/fetch 관리
│   │   ├── CodeChunker.kt          # 파일 → 청크 분할
│   │   ├── AstParser.kt            # tree-sitter 기반
│   │   └── SymbolExtractor.kt
│   ├── graph/
│   │   └── DependencyGraphBuilder.kt
│   ├── search/
│   │   ├── HybridCodeSearch.kt     # 시맨틱 + 키워드 + 심볼
│   │   └── CodeReranker.kt
│   └── service/
│       └── TicketEnrichmentService.kt
│
├── infra-code-intel-local/          # 어댑터: 같은 JVM에서 실행
│   └── LocalCodeIntelAdapter.kt
│
├── infra-code-intel-remote/         # 어댑터: Agent에 gRPC 호출
│   └── RemoteCodeIntelAdapter.kt
│
├── infra-code-intel-api/            # 어댑터: GitHub/GitLab API
│   └── GitHubApiCodeIntelAdapter.kt
│
├── infra-openhands/                 # OpenHands 연동
│   └── OpenHandsCodingAgentAdapter.kt
│
├── infra-swe-agent/                 # SWE-agent 연동
│   └── SweAgentCodingAgentAdapter.kt
│
├── infra-llm/                       # LLM (기존 확장)
│   ├── OllamaLlmAdapter.kt
│   ├── ClaudeApiLlmAdapter.kt
│   └── GeminiApiLlmAdapter.kt
│
├── agent/                           # Agent 독립 실행 파일 (모드 2용)
│   └── AgentApplication.kt         # core-code-intel을 gRPC 서비스로 노출
│
├── core-ai/                         # 기존 AI 모듈 (정책 Q&A, 유사 이슈 등)
│
├── core-project-wizard/             # [v3.0 신규] 프로젝트 생성 도메인
│   ├── port/outbound/
│   │   ├── ScaffoldPort.kt
│   │   ├── GitRepoCreatePort.kt
│   │   └── DeployPort.kt
│   ├── service/
│   │   ├── MvpAnalysisService.kt
│   │   ├── ScaffoldService.kt
│   │   └── AutoDeployService.kt
│   └── model/
│       ├── ProjectBlueprint.kt
│       └── DeployTarget.kt
│
├── infra-scaffold/                  # [v3.0 신규] 스캐폴딩 어댑터
│   ├── NextjsScaffoldAdapter.kt
│   ├── ViteReactScaffoldAdapter.kt
│   └── SpringBootScaffoldAdapter.kt
│
└── infra-deploy/                    # [v3.0 신규] 배포 어댑터
    ├── VercelDeployAdapter.kt
    ├── RailwayDeployAdapter.kt
    └── SupabaseProvisionAdapter.kt
```

---

## 8. 보안

### 8.1 조직 간 격리

| 영역 | 격리 방법 |
|------|----------|
| DB | Row-Level Security (org_id) |
| pgvector 검색 | 모든 쿼리에 org_id 필터 강제 |
| Git 저장소 | 물리적 디렉토리 분리 |
| LLM 컨텍스트 | 요청별 org_id 바인딩, 교차 조직 참조 불가 |
| 암호화 | 조직별 DEK(Data Encryption Key) 분리 |
| 감사 로그 | 조직별 분리, 차등 보존 기간 |

### 8.2 Git 토큰 관리

- 토큰 scope: **읽기 전용** (코드 분석용)
- 코딩 에이전트용 쓰기 토큰은 별도 관리
- 90일 주기 자동 로테이션
- Vault/KMS 연동 권장

### 8.3 LLM 데이터 보호

- LLM 전송 전 시크릿 스캐닝 (gitleaks 패턴)
- PII 마스킹 (기존 PiiDetectionPort 활용)
- 금융 서비스는 Ollama 로컬 전용 (외부 API 전송 금지)
- Prompt injection 탐지 레이어

### 8.4 Agent 통신 보안

- Hub ↔ Agent: mTLS
- Agent 등록: 일회용 토큰 + 기기 인증
- Heartbeat: 30초 주기, 3회 실패 시 비활성

---

## 9. 확장성

### 9.1 단계별 인프라

```
Phase 1: 단일 서버 (Mac Mini)
  - Docker Compose
  - 20-30개 레포, 단일 조직

Phase 2: 서버 분리 (Mac Mini 2-3대)
  - 서버 1: Hub + DB + Redis
  - 서버 2: Ollama (LLM 전용)
  - 서버 3: Code Intelligence + Git

Phase 3: 클라우드 하이브리드
  - Hub: 클라우드 (GKE/EKS)
  - Code Intel: Agent 방식으로 고객 인프라
  - LLM: 클라우드 GPU 또는 API
```

### 9.2 병목 지점과 대응

| 병목 | 발생 시점 | 대응 |
|------|----------|------|
| Ollama 큐 지연 30초+ | 동시 요청 10건+ | LLM 서버 분리 또는 클라우드 폴백 |
| Git 스토리지 100GB+ | 레포 50개+ | NFS/EBS 분리, shallow clone |
| pgvector 검색 500ms+ | 벡터 100만+ | HNSW 인덱스, 파티셔닝 |
| 초기 임베딩 수일 소요 | 대형 레포 온보딩 | 클라우드 임베딩 API 병행 |

---

## 10. [v3.0] Project Wizard 상세 설계

### 10.1 모듈 구조

> 모듈 전체 목록은 섹션 7 참조. 아래는 포트 인터페이스 상세만 기술.

### 10.2 포트 인터페이스

```kotlin
interface ScaffoldPort {
    fun generate(blueprint: ProjectBlueprint): GeneratedProject
    fun supportedStacks(): List<TechStack>
}

interface DeployPort {
    fun deploy(project: GeneratedProject, target: DeployTarget): DeployResult
    fun getStatus(deployId: String): DeployStatus
    fun teardown(deployId: String)
}

interface GitRepoCreatePort {
    fun createRepo(orgName: String, repoName: String, isPrivate: Boolean): RepoInfo
    fun pushCode(repoUrl: String, files: List<GeneratedFile>)
}
```

### 10.3 스캐폴딩 전략

#### 베이스 템플릿 + AI 커스터마이징 (하이브리드)

| 순수 AI 생성 | 순수 템플릿 | **베이스 + AI (선택)** |
|-------------|-----------|---------------------|
| 품질 불안정 | 유연성 없음 | 기반은 안정, 커스텀은 AI |
| 설정 파일 실수 많음 | 아이디어별 차이 없음 | 설정은 검증된 템플릿 사용 |
| 배포 실패 위험 | 확장 어려움 | 배포 성공률 높음 |

#### 템플릿 구조

```
templates/
├── nextjs-supabase/
│   ├── scaffold.yaml              # 메타 정보 (지원 기능, 필수 env 등)
│   ├── base/                      # 항상 포함
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── src/app/layout.tsx
│   │   ├── src/lib/supabase.ts
│   │   └── .github/workflows/ci.yml
│   └── features/                  # 기능별 선택 포함
│       ├── auth/                  # 로그인/회원가입
│       ├── crud/                  # 기본 CRUD 패턴
│       └── kanban/                # 칸반 보드
│
├── nextjs-plain/                  # Supabase 없는 버전
├── vite-react/                    # Vite + React SPA
└── springboot-nextjs/             # 풀스택 (백엔드 분리)
```

#### AI 커스터마이징 범위

```kotlin
data class ScaffoldContext(
    val blueprint: ProjectBlueprint,
    val template: TemplateType,
    val enabledFeatures: List<Feature>
)

// AI가 생성하는 것들:
// 1. DB 스키마 (Supabase migration SQL) - ERD 기반
// 2. API 라우트 (Next.js API Routes) - 기능별 CRUD
// 3. 페이지 컴포넌트 - 기능별 기본 UI (리스트, 폼, 상세)
// 4. TypeScript 타입 정의 - DB 스키마 기반
```

#### 품질 보장

```
생성 후 자동 검증:
  1. npm install → 의존성 설치 성공 확인
  2. npm run build → 빌드 성공 확인
  3. TypeScript 에러 0개 확인
  4. 실패 시 → AI가 에러 분석 → 자동 수정 → 재시도 (최대 3회)
  5. 3회 실패 시 → 베이스 템플릿만으로 배포 + 사용자에게 알림
```

### 10.4 ERD 자동 생성

#### 생성 흐름

Step 2에서 AI가 기능 목록을 기반으로 ERD를 자동 추론:

```
[기능 목록]                    [ERD 자동 생성]
  ☑ 회원가입/로그인      →      users ──1:N── team_members ──N:1── teams
  ☑ 팀 관리                    teams ──1:N── boards
  ☑ 할일 CRUD                  boards ──1:N── columns
  ☑ 칸반 보드                   columns ──1:N── tasks
                               tasks ──N:1── users (assignee)
```

#### 사용자 편집

- 테이블 추가/삭제
- 컬럼 추가/삭제/타입 변경
- 관계(FK) 추가/삭제
- AI에게 자연어로 수정 요청 ("tasks에 due_date 추가해줘")

프론트엔드에서 **React Flow** 기반으로 ERD 시각화 + 편집 UI 제공.

#### ERD → 코드 자동 변환

```
ERD (사용자 확정)
  │
  ├──→ Supabase migration SQL
  │      CREATE TABLE users ( ... );
  │      CREATE TABLE teams ( ... );
  │
  ├──→ TypeScript 타입 정의
  │      type User = { id: string; email: string; ... }
  │      type Task = { id: string; title: string; ... }
  │
  ├──→ API Routes (CRUD)
  │      /api/users, /api/teams, /api/tasks
  │
  └──→ Supabase RLS 정책 (기본)
         사용자는 자기 팀 데이터만 접근
```

### 10.5 배포 파이프라인

#### 배포 흐름

```
[코드 생성 완료]
  │
  ▼
[GitHub 레포 생성 + 푸시]
  │
  ▼
[배포 타겟별 분기]
  ├── Vercel: 레포 연결 → 자동 빌드/배포
  ├── Railway: 레포 연결 → 백엔드 서비스 생성
  └── Supabase: 프로젝트 생성 → migration 실행 → RLS 적용
  │
  ▼
[환경변수 자동 주입]
  Vercel ← SUPABASE_URL, SUPABASE_ANON_KEY
  Railway ← DATABASE_URL
  │
  ▼
[헬스체크]
  프론트: HTTP 200 확인
  백엔드: /health 응답 확인
  DB: 테이블 생성 확인
  │
  ▼
[완료 → 라이브 URL 반환]
```

#### 플랫폼별 API 연동

```kotlin
// Vercel - REST API v9
class VercelDeployAdapter : DeployPort {
    // 1. 프로젝트 생성 (POST /v10/projects)
    // 2. GitHub 레포 연결 (자동 배포 활성화)
    // 3. 환경변수 설정 (POST /v10/projects/{id}/env)
    // 4. 배포 상태 폴링 (GET /v13/deployments/{id})
}

// Railway - GraphQL API
class RailwayDeployAdapter : DeployPort {
    // 1. 프로젝트 생성
    // 2. GitHub 레포 연결
    // 3. 환경변수 설정
    // 4. 서비스 시작
}

// Supabase - Management API
class SupabaseProvisionAdapter : DeployPort {
    // 1. 프로젝트 생성 (POST /v1/projects)
    // 2. DB migration 실행 (SQL 직접 실행)
    // 3. RLS 정책 적용
    // 4. API 키 반환 (anon key, service key)
}
```

#### 사용자 플랫폼 인증

```
사용자가 최초 1회 연결:
  ├── GitHub: OAuth App → access token
  ├── Vercel: OAuth 연동 → access token
  ├── Railway: API token 입력
  └── Supabase: access token (OAuth 또는 수동 입력)

저장: IssueHub DB에 암호화 저장 (AES-256)
갱신: OAuth 토큰은 자동 refresh
```

#### 배포 실패 처리

```
1. 빌드 실패 → AI가 에러 로그 분석 → 코드 수정 → 재푸시 (최대 3회)
2. 환경변수 누락 → 자동 감지 → 사용자에게 입력 요청
3. 플랫폼 장애 → 사용자에게 알림 + 수동 재시도 버튼
4. 무료 티어 한도 초과 → 안내 메시지 + 대안 플랫폼 제안
```

### 10.6 보안 및 접근 제어

#### 플랫폼별 필수 OAuth 스코프

| 플랫폼 | 필수 스코프 | 용도 |
|--------|-----------|------|
| GitHub | `repo` (private), `public_repo` (public) | 레포 생성, 코드 푸시 |
| Vercel | `project:create`, `deployment:create`, `env:write` | 프로젝트 생성, 배포, 환경변수 |
| Railway | `project:create`, `service:create` | 프로젝트/서비스 생성 |
| Supabase | `projects:create`, `database:write` | 프로젝트 생성, migration |

#### Wizard RBAC 권한

| 역할 | 새 프로젝트 만들기 | 배포 관리 | 배포 삭제 |
|------|:----------------:|:---------:|:---------:|
| Admin | O | O | O |
| Manager | O | O | O |
| Member | X | X | X |
| Viewer | X | X | X |

> Wizard는 외부 리소스(레포, 배포, DB)를 생성하므로 Manager 이상만 허용.

#### 생성 제한

- 조직당 Wizard 프로젝트 최대 **10개/월** (무료 플랫폼 남용 방지)
- 동시 생성 작업 **1개** (리소스 보호)
- 90일 미사용 Wizard 프로젝트 → 관리자에게 정리 알림

### 10.7 신규 데이터 모델

#### 신규 테이블

```sql
-- 프로젝트 블루프린트 (AI가 생성한 PRD/ERD)
CREATE TABLE project_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    project_id UUID REFERENCES projects(id),  -- nullable: 블루프린트는 프로젝트 생성 전에 만들어짐
    overview TEXT NOT NULL,
    features JSONB NOT NULL,         -- [{name, description, priority, enabled}]
    erd_schema JSONB NOT NULL,       -- {tables: [...], relations: [...]}
    pages JSONB NOT NULL,            -- [{name, route, description}]
    tech_stack VARCHAR(50) NOT NULL,  -- nextjs-supabase, vite-react 등
    deploy_targets JSONB NOT NULL DEFAULT '[]',  -- ["vercel", "supabase"]
    raw_user_input TEXT,             -- 원본 아이디어 텍스트
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 배포 정보
CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    platform VARCHAR(20) NOT NULL,    -- vercel, railway, supabase
    platform_project_id TEXT,         -- 플랫폼 내 프로젝트 ID
    live_url TEXT,                    -- 배포된 URL
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- PENDING, DEPLOYING, LIVE, FAILED, TEARDOWN
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 플랫폼 인증 토큰
CREATE TABLE platform_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    platform VARCHAR(20) NOT NULL,    -- github, vercel, railway, supabase
    access_token_enc BYTEA NOT NULL,  -- AES-256 암호화
    refresh_token_enc BYTEA,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Wizard 비동기 작업 추적
CREATE TABLE wizard_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    blueprint_id UUID NOT NULL REFERENCES project_blueprints(id),
    project_id UUID REFERENCES projects(id),  -- nullable: 프로젝트 생성 후 채워짐
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- PENDING, IN_PROGRESS, COMPLETED, FAILED
    steps JSONB NOT NULL DEFAULT '[]',
    -- [{name, status, started_at, completed_at, error_message}]
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
```

#### 기존 projects 테이블 확장

```sql
ALTER TABLE projects ADD COLUMN creation_type VARCHAR(20)
    DEFAULT 'imported';  -- imported (기존 연동) | wizard (새로 생성)
ALTER TABLE projects ADD COLUMN blueprint_id UUID
    REFERENCES project_blueprints(id);
```

#### 도메인 모델

```kotlin
data class ProjectBlueprint(
    val id: UUID,
    val overview: String,
    val features: List<Feature>,
    val erd: ErdSchema,
    val pages: List<PageStructure>,
    val techStack: TechStack,
    val deployTargets: List<DeployTarget>,  // DB의 deploy_targets JSONB에 저장
    val rawUserInput: String?
)

data class ErdSchema(
    val tables: List<TableDef>,
    val relations: List<RelationDef>
)

data class TableDef(
    val name: String,
    val columns: List<ColumnDef>
)

data class RelationDef(
    val from: String,        // table.column
    val to: String,          // table.column
    val type: RelationType   // ONE_TO_ONE, ONE_TO_MANY, MANY_TO_MANY
)
```

### 10.8 API 설계

#### Project Wizard API

```
POST   /api/v1/wizard/analyze
  body: { userInput: "할일 앱 만들어줘..." }
  resp: { blueprint: ProjectBlueprint }
  → AI가 아이디어 분석 → PRD + ERD + 페이지 구조 생성

PUT    /api/v1/wizard/blueprint/{id}
  body: { features: [...], erd: {...}, pages: [...] }
  → 사용자가 수정한 블루프린트 저장

POST   /api/v1/wizard/blueprint/{id}/regenerate-erd
  body: { prompt: "tasks에 due_date 추가해줘" }
  resp: { erd: ErdSchema }
  → AI가 ERD 부분 수정

POST   /api/v1/wizard/create
  body: {
    blueprintId: UUID,
    techStack: "nextjs-supabase",
    deployTargets: ["vercel", "supabase"],
    repoName: "team-todo-board",
    isPrivate: true
  }
  resp: { wizardTaskId: UUID }
  → 비동기 생성 시작

GET    /api/v1/wizard/task/{id}
  resp: {
    status: "IN_PROGRESS",
    steps: [
      { name: "GitHub 레포 생성", status: "DONE" },
      { name: "코드 스캐폴딩", status: "DONE" },
      { name: "Vercel 배포", status: "IN_PROGRESS" },
      { name: "Supabase 설정", status: "PENDING" },
      { name: "이슈 생성", status: "PENDING" }
    ]
  }
  → 진행률 폴링 (SSE로도 제공)

GET    /api/v1/wizard/task/{id}/result
  resp: {
    projectId: UUID,
    liveUrl: "https://team-todo-board.vercel.app",
    repoUrl: "https://github.com/org/team-todo-board",
    issueCount: 6
  }
```

#### 배포 관리 API

```
GET    /api/v1/projects/{id}/deployments
  → 프로젝트의 배포 목록

POST   /api/v1/projects/{id}/deployments/{deployId}/redeploy
  → 수동 재배포 트리거

DELETE /api/v1/projects/{id}/deployments/{deployId}
  → 배포 삭제 (teardown)
```

#### 플랫폼 토큰 API

```
POST   /api/v1/platforms/{platform}/connect
  → OAuth 플로우 시작 (GitHub, Vercel)

DELETE /api/v1/platforms/{platform}/disconnect
  → 연결 해제

GET    /api/v1/platforms/status
  resp: {
    github: { connected: true, username: "..." },
    vercel: { connected: true, teamName: "..." },
    railway: { connected: false },
    supabase: { connected: true }
  }
```

### 10.9 프론트엔드 화면

#### 신규 화면 목록

```
/projects/new                    → 프로젝트 추가 (분기 선택)
/projects/new/wizard             → Wizard Step 1: 아이디어 입력
/projects/new/wizard/blueprint   → Wizard Step 2: PRD + ERD + 페이지 구조 편집
/projects/new/wizard/stack       → Wizard Step 3: 스택 + 배포 타겟 선택
/projects/new/wizard/confirm     → Wizard Step 4: 최종 확인
/projects/new/wizard/progress    → Wizard Step 5: 생성 진행률
/projects/{id}/deployments       → 배포 현황 (기존 프로젝트 상세에 탭 추가)
/settings/platforms              → 플랫폼 연결 관리
```

#### 블루프린트 편집 화면

```
┌─────────────────────────────────────────────────┐
│  ← 이전                              다음 →     │
├────────┬────────┬──────────┬───────────────────── │
│  개요  │ 기능   │  ERD     │  페이지 구조         │
├────────┴────────┴──────────┴───────────────────── │
│                                                   │
│  [기능 탭]                                         │
│  ☑ 회원가입/로그인                                  │
│  ☑ 팀 생성/관리                                    │
│  ☑ 할일 CRUD                                      │
│  ☑ 칸반 보드                                       │
│  ☐ 실시간 알림 ← MVP에서 제외 가능                   │
│                                                   │
│  [ERD 탭] - React Flow 기반                        │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│  │ users   │───>│ teams   │───>│ tasks   │       │
│  │─────────│    │─────────│    │─────────│       │
│  │ id      │    │ id      │    │ id      │       │
│  │ email   │    │ name    │    │ title   │       │
│  │ name    │    │ owner_id│    │ board_id│       │
│  └─────────┘    └─────────┘    └─────────┘       │
│                                                   │
│  ┌───────────────────────────────────────┐       │
│  │ 💬 "tasks에 due_date 추가해줘"  [전송] │       │
│  └───────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
```

#### 생성 진행률 화면

```
┌─────────────────────────────────────────┐
│  프로젝트 생성 중...                      │
│                                         │
│  ✅ GitHub 레포 생성                     │
│  ✅ 코드 스캐폴딩                        │
│  ✅ 코드 푸시                            │
│  🔄 Vercel 배포 중...                    │
│  ⏳ Supabase 설정                       │
│  ⏳ IssueHub 프로젝트 등록               │
│  ⏳ 이슈 자동 생성                       │
│                                         │
│  ████████████░░░░░░░░  60%              │
└─────────────────────────────────────────┘

완료 시:
┌─────────────────────────────────────────┐
│  프로젝트가 생성되었습니다!               │
│                                         │
│  라이브: team-todo.vercel.app           │
│  GitHub: github.com/org/team-todo       │
│  이슈 6개 생성됨                         │
│                                         │
│  [대시보드로 이동]  [라이브 사이트 열기]    │
└─────────────────────────────────────────┘
```

---

## 11. 로드맵

### [v3.0] Project Wizard 로드맵

기존 Phase와 병행하여 추가:

| Phase | Wizard 태스크 | 설명 |
|-------|-------------|------|
| **Phase 2** | `core-project-wizard` 모듈 + 포트 설계 | ScaffoldPort, DeployPort, GitRepoCreatePort |
| | `MvpAnalysisService` 구현 | LlmPort로 PRD/ERD 자동 생성 |
| | 베이스 템플릿 1종 (nextjs-supabase) | 가장 범용적인 조합 먼저 |
| | Vercel + Supabase 배포 어댑터 | 무료 배포 파이프라인 |
| | Wizard UI (5단계) + ERD 편집기 | React Flow 기반 |
| **Phase 3** | 추가 템플릿 (vite-react, springboot-nextjs) | 스택 선택지 확장 |
| | Railway 배포 어댑터 | 백엔드 분리 배포 |
| | AI 자연어 ERD 수정 | "컬럼 추가해줘" 지원 |
| **Phase 4+** | Chat-First Builder (대화형) | 자연어로 프로젝트 생성 |
| | 추가 배포 플랫폼 (Netlify, Fly.io 등) | 수요 기반 |

### Phase 1: 셀프호스팅 MVP (현재 로드맵 확장)

기존 Phase 1-2에 추가:

| 태스크 | 설명 |
|--------|------|
| `organizations` 테이블 + RLS | **즉시** - 나중에 추가하면 전체 리팩토링 |
| `projects` 테이블 + Git 연결 | 프로젝트 등록 + bare clone |
| `CodeIntelPort` 인터페이스 설계 | 핵심 추상화, 이것만 잘 하면 확장 쉬움 |
| `LocalCodeIntelAdapter` 구현 | AST 파싱 + 임베딩 + 검색 |
| 기본 티켓 보강 | 코드 컨텍스트 자동 첨부 |

### Phase 2: 코딩 에이전트 연동

| 태스크 | 설명 |
|--------|------|
| `CodingAgentPort` 인터페이스 | 코딩 에이전트 추상화 |
| `OpenHandsAdapter` 구현 | OpenHands API 연동 |
| 작업 추적 대시보드 | 티켓 → PR 연결 관리 |
| Ollama 서버 설정 최적화 | 모델 선택, 동시 처리, 큐 관리 |

### Phase 3: Agent 모드 + SaaS

| 태스크 | 설명 |
|--------|------|
| `agent/` 독립 실행 파일 | gRPC 서비스로 Code Intelligence 노출 |
| `RemoteCodeIntelAdapter` | Hub → Agent 통신 |
| Agent 등록/인증/모니터링 | mTLS, heartbeat |
| `GitHubApiCodeIntelAdapter` | API 온디맨드 모드 (무료 티어) |
| SaaS 멀티테넌트 강화 | 과금, SLA, 조직 관리 |

---

## 12. 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Ollama 로컬 모델 품질 부족 | 분석 품질 저하 | Claude API 폴백 |
| OpenHands 프로젝트 방치 | 코딩 에이전트 불능 | CodingAgentPort 추상화로 교체 용이 |
| 대형 레포 인덱싱 시간 | 온보딩 지연 | 클라우드 임베딩 + 점진적 인덱싱 |
| 기능 과다 (84개 PRD 기능) | 출시 지연 | P0만 우선, 나머지 제거/연기 |
| [v3.0] AI 스캐폴딩 품질 불안정 | 빌드 실패, 배포 실패 | 베이스 템플릿으로 폴백, 3회 자동 수정 |
| [v3.0] 무료 배포 플랫폼 정책 변경 | 무료 티어 축소/폐지 | DeployPort 추상화로 대안 플랫폼 교체 용이 |
| [v3.0] ERD → 코드 변환 정확도 | 잘못된 스키마/타입 | 사용자 검토 단계 필수, AI 재생성 가능 |

---

## 13. 외부 연동 전략

### 13.1 연동 대상 도구 (우선순위)

| 티어 | 도구 | 연동 방식 | 시점 |
|------|------|----------|------|
| **Tier 1 (필수)** | Jira | 양방향 동기화 + OAuth2 | Phase 1-2 |
| | GitHub Issues | 양방향 동기화 + GitHub App | Phase 2 |
| **Tier 2 (높음)** | Notion | 양방향 동기화 + OAuth2 | Phase 2-3 |
| | Linear | 양방향 동기화 + OAuth2 | Phase 2-3 |
| | GitLab Issues | 양방향 동기화 + OAuth2 | Phase 2-3 |
| | Slack | 단방향 알림 + Slash Commands | Phase 2 |
| | Discord | 단방향 알림 + Slash Commands | Phase 2 |
| | Teams | 단방향 알림 + Adaptive Cards | Phase 3 |
| **Tier 3 (선택)** | Trello, Asana, ClickUp, YouTrack | 수요 기반 | Phase 4+ |

### 13.2 연동 아키텍처: 하이브리드

**핵심 CRUD/동기화 → Direct REST API, AI 기능 → Spring AI + MCP**

```
┌──────────────────────────────────────────────────┐
│                  IssueHub                         │
│                                                   │
│  [핵심 CRUD/동기화]         [AI 기능]              │
│   Direct REST API           Spring AI + MCP       │
│                                                   │
│  • JiraAdapter              • 티켓 자동 분류       │
│  • GitHubAdapter            • 유사 이슈 탐지       │
│  • NotionAdapter            • 코드 분석            │
│  • LinearAdapter            • 정책 Q&A             │
│  • 웹훅 수신/발송                                   │
│  • 양방향 동기화                                    │
│  • 필드 매핑/충돌 해결                              │
│                                                   │
│  ConnectorPort              LlmPort + MCP Client  │
│  (기존 아키텍처 유지)        (Spring AI 추가)       │
└──────────────────────────────────────────────────┘
```

### 13.3 왜 이 구조인가

| 방식 | CRUD/동기화 | AI 기능 | 선택 |
|------|:-----------:|:-------:|:----:|
| **Direct REST API** | 최적 (완전 제어, 최고 성능) | 매번 직접 구현 | CRUD용 |
| **MCP** | 부적합 (대량 처리, 웹훅 미지원) | 최적 (LLM 도구 연동) | AI용 |

### 13.4 MCP 확장 로드맵

| Phase | MCP 활용 |
|-------|---------|
| Phase 3 | Spring AI MCP Client로 GitHub MCP 서버 등 활용 (AI 코드 분석) |
| Phase 4+ | IssueHub 자체를 MCP Server로 노출 → Claude, Copilot 등 외부 AI가 IssueHub 데이터 접근 가능 |

---

## 14. 기술 스택 결정

### 14.1 메인 스택: Spring Boot 3.x + Kotlin (변경 없음)

| 고려한 대안 | 제외 이유 |
|------------|----------|
| **Python (FastAPI)** | AI 생태계는 우수하나, IssueHub의 핵심 70-80%는 엔터프라이즈 기능(OAuth, RBAC, 양방향 동기화, 트랜잭션). Spring이 압도적으로 성숙 |
| **Python 하이브리드** | 4-5명 팀이 2개 언어/빌드/배포 파이프라인 유지는 과잉. AI 기능은 HTTP API 호출 수준이라 Kotlin으로 충분 |
| **Node.js (NestJS)** | 타입 안전성, 엔터프라이즈 기능에서 Spring에 밀림 |

### 14.2 왜 Python이 아닌가 — AI 기능의 실체

IssueHub의 AI 기능은 **LLM API HTTP 호출 + pgvector 쿼리**이다:

```
IssueHub가 하는 AI 작업:
  ✓ Ollama/Claude에 HTTP 요청 보내기      → Kotlin WebClient로 충분
  ✓ JSON 응답 파싱                        → Jackson으로 충분
  ✓ pgvector에 벡터 저장/검색              → JPA로 충분
  ✓ 프롬프트 템플릿 채우기                  → 문자열 처리

IssueHub가 안 하는 것:
  ✗ PyTorch로 모델 훈련
  ✗ HuggingFace에서 모델 로드
  ✗ numpy/pandas 데이터 처리
```

### 14.3 Python이 필요해지는 시점

| 기능 | Python 필요? | 시점 |
|------|:-----------:|------|
| LLM API 호출 | X | - |
| pgvector 검색 | X | - |
| OpenHands 연동 (REST API) | X | - |
| **Tree-sitter AST 파싱** | **O** | Phase 4+ |
| **로컬 CodeBERT 모델 서빙** | **O** | 팀 8명+ 이후 |
| **LangGraph 에이전트 체이닝** | **O** | 필요성 검증 후 |

필요해지면 `pipelines/`에 독립 Python 서비스 추가 (Airflow가 이미 Python 인프라 제공).

---

## 15. 자동화 전략

### 15.1 core-automation 직접 구현

IssueHub의 자동화 요구사항(AUT-001~012)은 **도메인 특화 규칙 엔진**이다:
- SLA 일시정지/재개, 비즈니스 시간 계산 → 도메인 서비스 필수
- 에스컬레이션 체인 → 조직 구조 데이터 참조 필수
- Dry-run 테스트 → 같은 코드 경로에서 side-effect 차단
- 트랜잭션 무결성 → `@Transactional`로 이슈 상태 변경 + 규칙 실행 원자적 처리

### 15.2 워크플로우 도구 역할 분리

```
Spring @Scheduled + @Async   → 실시간 이벤트, 짧은 주기 (SLA 체크, 알림)
Airflow (Phase 3)            → 배치 파이프라인 (임베딩 리프레시, 리포트, 감사 아카이빙)
```

**오케스트레이터는 2개로 충분. 3개 이상은 4-5명 팀에 과잉.**

---

## 16. 인프라 요구사항

### 16.1 권장 하드웨어: Mac Mini M4 Pro 48GB

| 사양 | Phase 1-2 | Phase 3 | 판정 |
|------|----------|---------|------|
| 36GB | 여유 | **불가** (Ollama + Airflow로 RAM 초과) | X |
| **48GB** | 매우 여유 | 가능 (여유 ~16GB) | **추천** |
| 64GB | 매우 여유 | 매우 여유 | 14B 모델 직접 돌릴 때 |

### 16.2 Phase별 RAM 사용량

| Phase | 서비스 | 예상 RAM |
|-------|--------|---------|
| **Phase 1** | PostgreSQL, Redis, Spring Boot, Next.js, Nginx | ~7GB |
| **Phase 2** | + OpenSearch, Redis Streams, K3d | ~11GB |
| **Phase 3** | + Ollama (7B Q4: ~5GB), Airflow, OpenHands | ~22-27GB |

> PostgreSQL/Redis는 외부 서비스(Aiven/Upstash) 사용 시 로컬 RAM 절약

### 16.3 Ollama 모델 전략

**Ollama = 실행 엔진, Qwen = AI 모델 (DVD 플레이어 vs DVD 디스크)**

```bash
ollama pull qwen2.5-coder:7b      # 모델 다운로드 (~5GB RAM)
ollama run qwen2.5-coder:7b       # 실행, API 서버로 동작

# IssueHub는 Ollama의 REST API를 호출
# POST http://localhost:11434/api/generate
```

| 전략 | 모델 | RAM | 용도 |
|------|------|-----|------|
| **v1 (시작)** | Qwen2.5-Coder-7B (Q4) | ~5GB | 일상 분석, 48GB에서 여유 |
| **v2 (여유 시)** | Qwen2.5-Coder-14B (Q4) | ~10GB | 고품질 분석 |
| **폴백** | Claude Sonnet API | 0 (클라우드) | 복잡한 분석 20% |

### 16.4 리소스 최적화 필수 사항

- PostgreSQL/Redis → **Aiven/Upstash 외부화** (이미 계획됨, 반드시 실행)
- Kafka UI → 디버깅 시에만 실행 (`--profile debug`)
- OpenHands → 필요할 때만 실행 (on-demand)
- Airflow → LocalExecutor 사용 + 기존 PostgreSQL에 스키마 분리

---

## 17. 결정 사항 전체 요약

| 결정 | 선택 | 이유 |
|------|------|------|
| 코드 보유 | IssueHub가 직접 보유 (bare clone) | 분석 품질, 레이턴시, 핵심 차별점 |
| 코드 수정 | OpenHands 등 코딩 에이전트에 위임 | 기존 도구 활용, 포트로 교체 가능 |
| LLM | Ollama 기본 + Claude API 폴백 | 비용 최적화 (80% 로컬, 20% 클라우드) |
| 로컬 모델 | Qwen2.5-Coder-7B 시작 → 14B 확장 | 48GB Mac Mini에서 안정적 운영 |
| 배포 모드 | 3가지 (셀프호스팅/에이전트/SaaS) 선택 가능 | 고객 보안/규모에 따라 |
| 코딩 에이전트 | 프로젝트별 선택 (OpenHands, SWE-agent 등) | CodingAgentPort 추상화 |
| 연동 도구 | Jira, GitHub, Notion, Linear + 확장 | 한국 시장 우선순위 기반 |
| 연동 방식 | CRUD → Direct REST API, AI → Spring AI + MCP | 각 영역에 최적 기술 |
| 자동화 | core-automation 직접 구현 | 도메인 특화 (SLA, 에스컬레이션) |
| 워크플로우 | Spring Scheduler + Airflow (Phase 3) | 2개로 충분, n8n 제외 |
| 메인 스택 | Spring Boot 3.x + Kotlin (변경 없음) | 엔터프라이즈 기능 70-80%에 최적 |
| Python | 불필요 (Phase 4+에서 재검토) | AI 작업이 HTTP 호출 수준 |
| 데이터 모델 | Org → Project (2단계), Service는 태그 | MVP 단순화 |
| v1 타겟 | 단일 조직 멀티 서비스 | 현실적 범위, PMF 검증 우선 |
| 멀티 조직 | v3에서 (PMF 검증 후) | 보안/격리 복잡도 높음 |
| Mac Mini | 48GB 추천 | Phase 3까지 안정 운영 가능 |
| n8n | 제외 | AUT와 중복, 양방향 동기화 부적합, 팀 규모 |
| LangChain | 제외 | 기존 추상화로 충분, Spring AI가 더 적합 |
| [v3.0] Project Wizard | 단계별 Wizard (폼 기반) | 안정적 UX, Chat-First는 v4.0 |
| [v3.0] 스캐폴딩 | 베이스 템플릿 + AI 커스터마이징 | 배포 성공률 + 유연성 균형 |
| [v3.0] 배포 플랫폼 | Vercel + Railway + Supabase | 무료 티어 활용, 프론트+백엔드+DB 커버 |
| [v3.0] ERD | AI 자동 생성 + React Flow 편집 | 비개발자도 데이터 모델 이해/수정 가능 |
| [v3.0] 첫 템플릿 | nextjs-supabase | 가장 범용적, 무료 배포 최적 |
| [v3.0] Wizard 후 전환 | 이슈 기반 워크플로우로 전환 | 기존 IssueHub 기능과 자연스러운 연결 |
