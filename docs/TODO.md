# IssueHub MVP TODO

> 최종 수정일: 2026-04-20
> Jira: https://liandy220-developer.atlassian.net/jira/software/projects/LIH
> 구조: 에픽 = Phase, 스토리 = 사용자 스토리, 라벨 = 도메인
> 참조: Expert Panel 결과 (2026-03-25, 2026-04-01), FRONTEND-SPEC.md, BACKEND-SPEC.md
> 전략: "핵심 슬라이스" — AI 코드 분석(핵심 차별점)을 Phase 1으로 당겨 조기 검증

---

## 완료 현황

- [x] ~~프론트 구조 셋업 (Route Group, Feature-based, kebab-case)~~
- [x] ~~대시보드 목업 (SummaryCards, RecentIssues, TeamWorkload, SlaStatus)~~
- [x] ~~이슈 상세 + AI 분석 목업 (AiAnalysisPanel, AutoDevSection)~~
- [x] ~~이슈 목록 목업 (DataTable, 칩 필터, 검색)~~
- [x] ~~P0-1. 스켈레톤 코드 정리~~
- [x] ~~EP-MVP-1 레이아웃 + 공통 컴포넌트 (Forge Logic 디자인 시스템)~~
- [x] ~~EP-MVP-2 이슈 화면 (대시보드 + 이슈 목록 + 이슈 상세)~~
- [x] ~~LIH-107 정책 관리 화면~~
- [x] ~~LIH-108 승인 워크플로우 화면~~
- [x] ~~LIH-109 연동 설정 화면 (카드 그리드 + Jira/Slack 모달 + 대기 이슈 큐)~~
- [x] ~~연동 시스템 설계 문서 + 구현 플랜 작성~~

---

## [EP-0] Phase 0: 기반 정리 (1주) — LIH-1

> 목표: docker compose up으로 백엔드+프론트+Ollama가 뜨고, CI가 동작한다

### 백엔드 기반 `label:infra`

- [ ] **P0-2. API 공통 인프라** — [LIH-5](https://liandy220-developer.atlassian.net/browse/LIH-5)
  - `ApiResponse<T>` 공용 래퍼 (success, data, error, timestamp)
  - `PageResponse<T>` 페이지네이션 래퍼
  - `GlobalExceptionHandler` (@RestControllerAdvice)
  - `application-local.yml`, `application-dev.yml` 프로파일 분리
  - DoD: 에러 발생 시 일관된 JSON 응답 반환

- [ ] **P0-3. DB 마이그레이션 (V3~V5)** — [LIH-6](https://liandy220-developer.atlassian.net/browse/LIH-6)
  - V3: `organizations` 테이블 (id, slug, name, plan, settings, created_at)
  - V4: 기존 테이블에 `org_id` FK 추가 (users, issues, teams 등)
  - V5: `projects` 테이블 (id, org_id, name, service_tag, git_url, code_intel_mode, llm_provider 등)
  - DoD: Flyway 마이그레이션 성공, 테이블 생성 확인

- [ ] **P0-4. 개발 인프라 + Ollama** — [LIH-7](https://liandy220-developer.atlassian.net/browse/LIH-7)
  - Docker Compose에 백엔드 앱 서비스 추가 (또는 로컬 bootRun 가이드)
  - Docker Compose에 Ollama 서비스 추가 (codellama 또는 mistral 모델)
  - TestContainers 설정 (PostgreSQL)
  - ArchUnit 기본 규칙 (core-domain은 Spring 의존 금지, core→infra 의존 금지)
  - GitHub Actions CI (build + test on PR)
  - DoD: `docker compose up` 후 `/actuator/health` 200 반환 + Ollama API 응답 확인

### 프론트엔드 기반 `label:frontend`

- [x] **P0-5. UI 인프라 정리** — [LIH-2](https://liandy220-developer.atlassian.net/browse/LIH-2) ✅ 완료

- [x] **P0-6. Mock 추상화 레이어** — [LIH-3](https://liandy220-developer.atlassian.net/browse/LIH-3) ✅ 완료
  - 각 feature에 `use-{feature}.ts` 훅 생성 (mock 데이터 반환)
  - 컴포넌트에서 `MOCK_*` 직접 import 제거 → 훅으로 교체
  - `features/dashboard/hooks/use-dashboard-stats.ts`
  - `features/issues/hooks/use-issue-detail.ts`
  - DoD: 모든 컴포넌트가 훅을 통해서만 데이터 접근

- [ ] **P0-7. 폼/테스트 라이브러리 설치** — [LIH-4](https://liandy220-developer.atlassian.net/browse/LIH-4)
  - `react-hook-form` + `zod` + `@hookform/resolvers` 설치
  - `vitest` + `@testing-library/react` + `msw` 설치
  - `vitest.config.ts` 설정
  - 첫 번째 테스트: `use-dashboard-stats` 훅 테스트
  - DoD: `npm test` 통과

---

## [EP-1] Phase 1: AI 코드 분석 MVP (2~3주) — LIH-8 — 핵심 차별점

> 목표: 이슈를 클릭하면 AI가 실제 코드를 분석해서 영향 파일과 수정 제안을 보여준다

### LLM 연동 `label:llm`

- [ ] **P1-1. Ollama + LLM Adapter 구현** — [LIH-30](https://liandy220-developer.atlassian.net/browse/LIH-30)
  - `OllamaLlmAdapter` 실제 구현 (POST /api/generate)
  - `OllamaEmbeddingAdapter` 실제 구현 (POST /api/embeddings)
  - `ClaudeApiLlmAdapter` 폴백 (선택, Ollama 실패 시)
  - LLM 제공자 전환 로직 (`@ConditionalOnProperty` 또는 설정 기반)
  - DoD: Ollama API 호출로 텍스트 생성 + 임베딩 생성 성공
  - 사용자 스토리: "개발자가 시스템에 질문하면 AI가 코드 기반으로 답변할 수 있다"

### 코드 인덱싱 `label:code-intel`

- [ ] **P1-2. Git bare clone + 코드 인덱싱 파이프라인** — [LIH-31](https://liandy220-developer.atlassian.net/browse/LIH-31)
  - `GitRepoMirror` 서비스: `git clone --bare` (IssueHub 자체 레포 대상)
  - V6: `code_chunks` 테이블 (id, project_id, file_path, content, embedding, updated_at)
  - 파일 단위 청킹 → 임베딩 생성 → pgvector 저장
  - 주기적 `git fetch` + 변경 파일 재인덱싱
  - DoD: IssueHub 레포의 코드가 인덱싱되어 벡터 유사도 검색 가능
  - 사용자 스토리: "개발자가 프로젝트에 Git URL을 등록하면 코드가 자동으로 인덱싱된다"

### AI 분석 서비스 `label:code-intel`

- [ ] **P1-3. TicketEnrichmentService** — [LIH-32](https://liandy220-developer.atlassian.net/browse/LIH-32)
  - 이슈 텍스트 → pgvector 유사도 검색 → 관련 코드 TOP-K 추출
  - LLM에 이슈 + 관련 코드 전달 → 영향 파일/수정 제안 생성
  - `issue_ai_analysis` 테이블에 분석 결과 저장
  - 비동기 실행 (이벤트 기반) + 완료 시 저장
  - DoD: 이슈 ID로 AI 분석 요청 시 실제 코드 기반 분석 결과 반환
  - 사용자 스토리: "개발자가 이슈를 열면 AI가 분석한 관련 코드와 수정 제안이 보인다"

### API + 프론트 연동 `label:code-intel` `label:frontend`

- [ ] **P1-4. AI 분석 API + 프론트 실데이터 연동** — [LIH-33](https://liandy220-developer.atlassian.net/browse/LIH-33)
  - `GET /api/v1/issues/{id}/ai-analysis` (분석 결과 조회)
  - `POST /api/v1/issues/{id}/ai-analysis` (분석 실행/재실행)
  - 프론트: `ai-analysis-panel.tsx` Mock → API 훅 연결
  - 프론트: "분석 다시 실행" 버튼 동작
  - DoD: 이슈 상세 AI 분석 탭에서 실제 코드 분석 결과가 표시됨
  - 사용자 스토리: "개발자가 AI 분석 탭에서 실제 영향 파일과 수정 제안을 확인할 수 있다"

### 최소 이슈 CRUD `label:issue`

- [ ] **P1-5. 최소 이슈 CRUD (AI 테스트용)** — [LIH-34](https://liandy220-developer.atlassian.net/browse/LIH-34)
  - `IssueController` GET/POST 최소 구현 (인증 없이)
  - Response DTO + `ApiResponse<T>` 래퍼 적용
  - 시드 데이터: 테스트용 이슈 3~5건 (Flyway 또는 ApplicationRunner)
  - DoD: API로 이슈 생성/조회 가능, AI 분석 요청과 연결 확인
  - 사용자 스토리: "개발자가 이슈를 생성하고 AI 분석을 실행할 수 있다"

### Phase 1 검증
> ✅ "이슈를 클릭하면 AI가 실제 코드를 분석해서 영향 파일과 수정 제안을 보여주는가?"

---

## [EP-2] Phase 2: 인증 + 풀 CRUD + Jira 연동 (4~5주) — LIH-9

> 목표: 사용자가 로그인해서 프로젝트를 관리하고, Jira 이슈가 자동 동기화된다

### 인증 `label:auth`

- [ ] **P2-1. JWT 인증** — [LIH-35](https://liandy220-developer.atlassian.net/browse/LIH-35)
  - `SecurityConfig` (Spring Security + JWT)
  - 로그인 API: `POST /api/v1/auth/login` → JWT 발급
  - 토큰 검증 필터 + RBAC 기본 (ADMIN / MEMBER)
  - 로그인 UI (`app/(auth)/login/page.tsx`, react-hook-form + zod)
  - DoD: 브라우저에서 로그인 → JWT → 인증된 API 호출 → 대시보드 진입
  - 사용자 스토리: "사용자가 이메일/비밀번호로 로그인하면 대시보드로 이동한다"

### 프로젝트/이슈 풀 CRUD `label:project` `label:issue`

- [ ] **P2-2. 프로젝트 CRUD** — [LIH-36](https://liandy220-developer.atlassian.net/browse/LIH-36)
  - Project 도메인 모델 + UseCase + Port + Service
  - `ProjectPersistenceAdapter` + `ProjectJpaEntity`
  - `ProjectController` (GET/POST/PATCH /api/v1/projects)
  - 프로젝트 목록/생성/설정 UI + API 연동
  - DoD: 브라우저에서 프로젝트 생성 → 목록에서 확인
  - 사용자 스토리: "사용자가 Git 레포 URL을 입력하면 프로젝트가 등록된다"

- [ ] **P2-3. 이슈 풀 CRUD + 대시보드 API** — [LIH-37](https://liandy220-developer.atlassian.net/browse/LIH-37)
  - `IssueController` PATCH/DELETE 추가, 풀 페이지네이션 + 필터
  - 대시보드 API: `GET /api/v1/dashboard/stats`, `recent-issues`, `team-workload`
  - 프론트 실데이터 연동: 대시보드, 이슈 목록/상세, 이슈 생성 폼
  - DoD: 목업 데이터 0개, 전부 실제 API 데이터
  - 사용자 스토리: "사용자가 대시보드에서 실제 이슈 현황을 보고, 이슈를 클릭해서 상세를 볼 수 있다"

### Jira 연동 `label:connector`

- [ ] **P2-4. Jira 단방향 동기화 + 커넥터 UI** — [LIH-38](https://liandy220-developer.atlassian.net/browse/LIH-38)
  - `JiraConnectorAdapter` (Jira REST API v3, API Token 인증)
  - 5분 주기 폴링 (`@Scheduled`)
  - 커넥터 설정 API + 커넥터 UI (추가 폼, 동기화 상태, 수동 동기화)
  - DoD: Jira 프로젝트 연결 → 이슈 자동 동기화 → UI에서 확인
  - 사용자 스토리: "사용자가 Jira 프로젝트를 연결하면 이슈가 자동으로 동기화된다"

### 대시보드 강화 `label:dashboard`

- [ ] **P2-5. 차트 + 프로젝트 스위처** — [LIH-39](https://liandy220-developer.atlassian.net/browse/LIH-39)
  - 차트 라이브러리 (recharts) + 이슈 트렌드/분포 차트
  - 사이드바 프로젝트 드롭다운 + 데이터 필터링
  - DoD: 대시보드에 실데이터 차트 + 프로젝트별 필터링 동작
  - 사용자 스토리: "사용자가 프로젝트별 이슈 트렌드를 차트로 확인할 수 있다"

### Phase 2 검증
> ✅ "사용자가 로그인하여 프로젝트를 관리하고, Jira 이슈가 대시보드에 자동으로 보이는가?"

---

## [EP-3] Phase 3: 안정화 + 피드백 (1~2주) — LIH-10

> 목표: 내부 사용자가 1주일간 실제 사용 후 핵심 지표 달성

### 품질 `label:quality`

- [ ] **P3-1. 테스트 보강** — [LIH-40](https://liandy220-developer.atlassian.net/browse/LIH-40)
  - 백엔드: core 서비스 단위 테스트 80%+ (특히 TicketEnrichmentService)
  - 백엔드: API 통합 테스트 (AI 분석 + 이슈 CRUD 엔드포인트)
  - 프론트: 핵심 훅 단위 테스트
  - DoD: 테스트 커버리지 목표 달성

- [ ] **P3-2. 에러 처리 + 모니터링** — [LIH-41](https://liandy220-developer.atlassian.net/browse/LIH-41)
  - 프론트: 글로벌 에러 바운더리 동작 확인
  - 백엔드: 로깅 포맷 정리 (JSON structured logging)
  - LLM 실패 시 사용자 안내 메시지 ("분석을 일시적으로 사용할 수 없습니다")
  - DoD: 에러 발생 시 사용자에게 명확한 피드백 제공

- [ ] **P3-3. 배포 + 사용자 피드백** — [LIH-42](https://liandy220-developer.atlassian.net/browse/LIH-42)
  - 내부 대상 배포
  - 1주일 사용 후 피드백 수집
  - 핵심 지표: AI 분석 유용성 평가, 이슈 해결 시간(MTTR) 측정
  - DoD: 피드백 기반 백로그 조정 완료

### Phase 3 검증
> ✅ "AI 분석이 실제로 이슈 해결에 도움이 되는가? 사용자가 계속 쓰겠다고 하는가?"

---

---

## [MVP 연동] 다음 작업 (우선순위순)

> 설계 문서: docs/superpowers/specs/2026-04-15-integration-system-design.md
> 구현 플랜: docs/superpowers/plans/2026-04-20-plan1-integration-infra.md

### 1. 인프라 셋업 (선행 필수)

- [ ] **Docker Compose에 n8n + Keycloak 추가** — LIH-97, LIH-99
  - n8n (이벤트 게이트웨이), Keycloak (OIDC + RBAC)
  - 플랜: `docs/superpowers/plans/2026-04-20-plan1-integration-infra.md` Task 1

- [ ] **DB 스키마 마이그레이션** — LIH-100
  - integrations 테이블 + pending_issues 테이블
  - 플랜: Task 2

### 2. BE 연동 API (Plan 3 — 작성 필요)

- [ ] **core-connector 모듈 구현** — LIH-128
  - ConfigureConnectorUseCase, TestConnectionUseCase 구현체
  - ManageWorkflowPort (→ n8n API)

- [ ] **infra-n8n 모듈 신규 생성**
  - n8n REST API Adapter (워크플로우 CRUD, credential 관리)
  - 워크플로우 JSON 템플릿 5개 (slack-error-monitor, jira-issue-receiver 등)

- [ ] **Webhook API + 대기 이슈 API** — LIH-113
  - POST /webhooks/issues, /webhooks/slack-events, /webhooks/slack-interactive
  - GET/POST /pending-issues (확인/무시)

- [ ] **Keycloak Spring Security 연동**
  - spring-boot-starter-oauth2-resource-server
  - JWT 검증 + RBAC (@PreAuthorize)

- [ ] **OAuth 콜백 API**
  - GET /oauth/callback/jira, /oauth/callback/slack

### 3. FE Mock → 실 API 연동

- [ ] **useConnectors → SWR + apiClient 교체** — LIH-131
- [ ] **설정 모달 저장 로직 연결**
- [ ] **OAuth 팝업 실제 플로우 구현**

### 4. 나머지 FE 페이지

- [ ] **모니터링 화면** — LIH-110
- [ ] **온보딩 위자드** — LIH-111

---

## MVP 이후 (Phase 4+) — LIH-11 [ARCHIVED]

아래는 MVP 검증 후 진행. 우선순위는 피드백 기반으로 결정.

### Phase 4: 자동화 + 추가 연동
- [ ] 자동화 규칙 엔진 (트리거-조건-액션, SLA 기본)
- [ ] GitHub 양방향 동기화
- [ ] 코딩 에이전트 연동 (OpenHands) — 자동 PR 생성
- [ ] Slack 웹훅 알림

### Phase 5: 고도화
- [ ] SLA 일시정지/재개 + 에스컬레이션 체인
- [ ] Notion/Discord 연동
- [ ] tree-sitter AST 분석 (코드 인덱싱 정식)
- [ ] Graph RAG (코드 호출 그래프 기반 분석 고도화)

### Phase 6: 확장
- [ ] 정책 관리 (CRUD + 승인 워크플로우)
- [ ] Project Wizard (아이디어 → MVP 생성)
- [ ] SaaS 모드 + 멀티테넌트 RLS

---

## Jira 티켓 매핑

| Phase | 에픽 | 스토리 |
|-------|------|--------|
| EP-0 기반 정리 | LIH-1 | LIH-2(완료), LIH-3~7 |
| EP-1 AI 코드 분석 | LIH-8 | LIH-30~34 |
| EP-2 인증+CRUD+Jira | LIH-9 | LIH-35~39 |
| EP-3 안정화+피드백 | LIH-10 | LIH-40~42 |
| Phase 4+ (아카이브) | LIH-11 | — |

> ⚠️ LIH-12~29는 이전 로드맵 기준 작업. 새 스토리(LIH-30~42)로 대체됨.

---

## 의존성

```
[P0] 기반 정리 ──→ [P1] AI 코드 분석 MVP ──→ [P2] 인증 + CRUD + Jira ──→ [P3] 안정화
                      │                          │
                      ├── P1-1 (Ollama)           ├── P2-1 (인증)
                      ├── P1-2 (인덱싱)           ├── P2-2 (프로젝트)
                      ├── P1-3 (AI 서비스)        ├── P2-3 (이슈 풀 CRUD)
                      ├── P1-4 (API+FE연동)       ├── P2-4 (Jira)
                      └── P1-5 (최소 CRUD)        └── P2-5 (차트)
```

### 병렬 가능

| 조합 | 설명 |
|------|------|
| P0 백엔드 + P0 프론트 | 기반 정리 동시 |
| P1-1(Ollama) + P1-2(Git+인덱싱) | LLM과 코드 인덱싱 동시 셋업 |
| P1-4(FE연동) + P1-5(최소 CRUD) | 프론트/백엔드 병렬 |
| P2-1(인증) + P2-2(프로젝트) | 인증과 프로젝트 API 동시 |
| P2-4(Jira) + P2-5(차트) | 연동과 차트 동시 |
