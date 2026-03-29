# IssueHub MVP TODO

> 최종 수정일: 2026-03-28
> Jira: https://liandy220-developer.atlassian.net/jira/software/projects/LIH
> 구조: 에픽 = Phase, 스토리 = 사용자 스토리, 라벨 = 도메인
> 참조: Expert Panel 결과 (2026-03-25), FRONTEND-SPEC.md, BACKEND-SPEC.md

---

## 완료 현황

- [x] ~~프론트 구조 셋업 (Route Group, Feature-based, kebab-case)~~
- [x] ~~대시보드 목업 (SummaryCards, RecentIssues, TeamWorkload, SlaStatus)~~
- [x] ~~이슈 상세 + AI 분석 목업 (AiAnalysisPanel, AutoDevSection)~~
- [x] ~~이슈 목록 목업 (DataTable, 칩 필터, 검색)~~

---

## [EP-0] Phase 0: 기반 정리 (1주)

> 목표: docker compose up으로 백엔드+프론트 앱이 뜨고, CI가 동작한다

### 백엔드 기반 `label:infra`

- [x] ~~**P0-1. 스켈레톤 코드 정리**~~
  - ~~Issue 도메인 모델에 `orgId`, `projectId` 추가~~
  - ~~`DomainException` sealed class 생성 (EntityNotFound, BusinessRuleViolation, ValidationFailed)~~
  - ~~`IssueService`에 `@Service` + 예외 체계 적용~~
  - ~~`infra-kafka` 모듈 비활성화 (Phase 2 이후)~~
  - ~~`bin/` 디렉토리 삭제 + `.gitignore` 확인~~
  - ~~`infra-llm`: GeminiAdapter → OllamaAdapter 기본으로 변경~~
  - ~~DoD: `./gradlew build` 성공~~

- [ ] **P0-2. API 공통 인프라**
  - `ApiResponse<T>` 공용 래퍼 (success, data, error, timestamp)
  - `PageResponse<T>` 페이지네이션 래퍼
  - `GlobalExceptionHandler` (@RestControllerAdvice)
  - `application-local.yml`, `application-dev.yml` 프로파일 분리
  - DoD: 에러 발생 시 일관된 JSON 응답 반환

- [ ] **P0-3. DB 마이그레이션 (V3~V5)**
  - V3: `organizations` 테이블 (id, slug, name, plan, settings, created_at)
  - V4: 기존 테이블에 `org_id` FK 추가 (users, issues, teams 등)
  - V5: `projects` 테이블 (id, org_id, name, service_tag, git_url, code_intel_mode, llm_provider 등)
  - DoD: Flyway 마이그레이션 성공, 테이블 생성 확인

- [ ] **P0-4. 개발 인프라**
  - Docker Compose에 백엔드 앱 서비스 추가 (또는 로컬 bootRun 가이드)
  - TestContainers 설정 (PostgreSQL)
  - ArchUnit 기본 규칙 (core-domain은 Spring 의존 금지, core→infra 의존 금지)
  - GitHub Actions CI (build + test on PR)
  - DoD: `docker compose up` 후 `/actuator/health` 200 반환

### 프론트엔드 기반 `label:frontend`

- [ ] **P0-5. UI 인프라 정리**
  - `loading.tsx` + `error.tsx` 글로벌 및 주요 라우트별 추가
  - shadcn Skeleton 컴포넌트 설치 + 위젯별 Skeleton 생성
  - Toast 시스템 (shadcn sonner) 설치 + `alert()` 제거
  - 파일명 통일: `Header.tsx` → `header.tsx`, `Sidebar.tsx` → `sidebar.tsx`
  - DoD: 빌드 성공 + Console 에러 0개

- [ ] **P0-6. Mock 추상화 레이어**
  - 각 feature에 `use-{feature}.ts` 훅 생성 (mock 데이터 반환)
  - 컴포넌트에서 `MOCK_*` 직접 import 제거 → 훅으로 교체
  - `features/dashboard/hooks/use-dashboard-stats.ts`
  - `features/issues/hooks/use-issue-detail.ts`
  - DoD: 모든 컴포넌트가 훅을 통해서만 데이터 접근

- [ ] **P0-7. 폼/테스트 라이브러리 설치**
  - `react-hook-form` + `zod` + `@hookform/resolvers` 설치
  - `vitest` + `@testing-library/react` + `msw` 설치
  - `vitest.config.ts` 설정
  - 첫 번째 테스트: `use-dashboard-stats` 훅 테스트
  - DoD: `npm test` 통과

---

## [EP-1] Phase 1: 인증 + 이슈/프로젝트 CRUD (3~4주)

> 목표: 사용자가 로그인해서 프로젝트를 만들고, 이슈를 생성/조회할 수 있다

### 인증 `label:auth`

- [ ] **P1-1. JWT 인증 백엔드**
  - `SecurityConfig` (Spring Security + JWT)
  - 로그인 API: `POST /api/v1/auth/login` → JWT 발급
  - 토큰 검증 필터
  - RBAC 기본: ADMIN / MEMBER 2단계
  - DoD: Postman으로 로그인 → JWT → 인증된 API 호출 성공
  - 사용자 스토리: "사용자가 이메일/비밀번호로 로그인할 수 있다"

- [ ] **P1-2. 로그인 UI**
  - `app/(auth)/login/page.tsx` 로그인 폼 구현
  - react-hook-form + zod 검증
  - JWT 저장 (httpOnly cookie 또는 localStorage)
  - 인증 상태 관리 (미인증 시 `/login` 리다이렉트)
  - DoD: 브라우저에서 로그인 → 대시보드 진입
  - 사용자 스토리: "사용자가 로그인 화면에서 이메일/비밀번호를 입력하면 대시보드로 이동한다"

### 프로젝트 CRUD `label:project`

- [ ] **P1-3. 프로젝트 CRUD 백엔드**
  - Project 도메인 모델 + UseCase + Port + Service
  - `ProjectPersistenceAdapter` + `ProjectJpaEntity`
  - `ProjectController` (GET/POST/PATCH /api/v1/projects)
  - DoD: API로 프로젝트 생성/조회/수정 가능
  - 사용자 스토리: "사용자가 Git 레포 URL을 입력하면 프로젝트가 등록된다"

- [ ] **P1-4. 프로젝트 관리 UI**
  - 프로젝트 목록 페이지 (ProjectCard)
  - 프로젝트 생성 폼 (이름, Git URL, 브랜치)
  - 프로젝트 설정 페이지 (코드 분석 모드, LLM 선택)
  - API 연동 (`features/projects/hooks/use-projects.ts`)
  - DoD: 브라우저에서 프로젝트 생성 → 목록에서 확인
  - 사용자 스토리: "사용자가 프로젝트를 등록하고 설정을 변경할 수 있다"

### 이슈 CRUD `label:issue`

- [ ] **P1-5. 이슈 CRUD 백엔드**
  - `IssueController` (GET/POST/PATCH/DELETE /api/v1/issues)
  - Request/Response DTO + Validation
  - 페이지네이션 + 필터 (상태, 우선순위, 소스, 프로젝트, 담당자)
  - 대시보드 API: `GET /api/v1/dashboard/stats`, `recent-issues`, `team-workload`
  - DoD: API로 이슈 CRUD + 필터 + 대시보드 통계 조회 가능
  - 사용자 스토리: "사용자가 이슈를 생성하고 목록에서 필터링할 수 있다"

- [ ] **P1-6. 프론트 실데이터 연동**
  - 대시보드: SummaryCards, RecentIssues, TeamWorkload → API 훅 연결
  - 이슈 목록: DataTable → API 훅 연결 + 서버사이드 필터/페이지네이션
  - 이슈 상세: IssueDetail → API 훅 연결
  - 이슈 생성 폼 (react-hook-form + zod)
  - DoD: 목업 데이터 0개, 전부 실제 API 데이터
  - 사용자 스토리: "사용자가 대시보드에서 실제 이슈 현황을 보고, 이슈를 클릭해서 상세를 볼 수 있다"

### Phase 1 검증
> ✅ "사용자가 로그인하여 프로젝트를 등록하고, 이슈를 생성하고 목록에서 확인할 수 있는가?"

---

## [EP-2] Phase 2: Jira 연동 + 대시보드 실데이터 (2~3주)

> 목표: Jira 이슈가 IssueHub 대시보드에 자동으로 보인다

### Jira 동기화 `label:connector`

- [ ] **P2-1. Jira 단방향 동기화**
  - `JiraConnectorAdapter` (Jira REST API v3, API Token 인증)
  - 5분 주기 폴링 (`@Scheduled`)
  - Jira Issue → IssueHub Issue 매핑 (상태/우선순위/담당자)
  - 커넥터 설정 API: `POST /api/v1/connectors` (Jira URL, 프로젝트 키, API Token)
  - DoD: Jira 프로젝트의 이슈가 IssueHub에 자동 동기화
  - 사용자 스토리: "사용자가 Jira 프로젝트를 연결하면 이슈가 자동으로 동기화된다"

- [ ] **P2-2. 커넥터 설정 UI**
  - 커넥터 추가 폼 (Jira URL, 프로젝트 키, API Token 입력)
  - 동기화 상태 표시 (성공/실패/마지막 동기화 시간)
  - 수동 동기화 버튼
  - DoD: 브라우저에서 Jira 연결 설정 → 이슈 목록에서 Jira 이슈 확인
  - 사용자 스토리: "사용자가 UI에서 Jira를 연결하고 동기화 상태를 확인할 수 있다"

### 대시보드 강화 `label:dashboard`

- [ ] **P2-3. 차트 + 트렌드**
  - 차트 라이브러리 설치 (visx 또는 recharts)
  - TrendChart: 이슈 트렌드 (7일/30일/90일)
  - 플랫폼별 이슈 분포 차트
  - DoD: 대시보드에 실데이터 기반 차트 표시
  - 사용자 스토리: "사용자가 대시보드에서 이슈 트렌드를 그래프로 확인할 수 있다"

- [ ] **P2-4. 프로젝트 스위처**
  - 사이드바에 프로젝트 드롭다운 (전체/개별 프로젝트 선택)
  - 선택된 프로젝트에 따라 대시보드/이슈 목록 필터링
  - DoD: 프로젝트 전환 시 데이터가 해당 프로젝트로 필터링
  - 사용자 스토리: "사용자가 프로젝트를 전환하면 해당 프로젝트의 데이터만 보인다"

### Phase 2 검증
> ✅ "Jira 이슈가 IssueHub 대시보드에 보이고, 프로젝트별로 필터링할 수 있는가?"

---

## [EP-3] Phase 3: AI 코드 분석 (4~6주) — 핵심 차별점

> 목표: 이슈를 클릭하면 AI가 분석한 관련 코드/파일/변경이력이 자동으로 보인다

### Git 연동 `label:code-intel`

- [ ] **P3-1. Git bare clone + fetch**
  - `GitRepoMirror` 서비스: 프로젝트 등록 시 `git clone --bare`
  - 주기적 `git fetch` (5분 또는 webhook)
  - 디스크 사용량 모니터링
  - DoD: 프로젝트의 Git 레포가 서버에 미러링되고 주기적 갱신
  - 사용자 스토리: "사용자가 프로젝트에 Git URL을 등록하면 코드가 자동으로 동기화된다"

### LLM 연동 `label:llm`

- [ ] **P3-2. Ollama + LLM 연동**
  - `OllamaLlmAdapter` (POST /api/generate, POST /api/embeddings)
  - `ClaudeApiLlmAdapter` (폴백)
  - 프로젝트별 LLM 라우팅 로직
  - Docker Compose에 Ollama 서비스 추가
  - DoD: Ollama API 호출로 텍스트 생성 + 임베딩 생성 성공
  - 사용자 스토리: "시스템이 Ollama를 통해 코드 분석 결과를 생성할 수 있다"

### 코드 인덱싱 `label:code-intel`

- [ ] **P3-3. 코드 인덱싱 파이프라인 (축소판)**
  - V6: code_chunks, symbol_index 테이블 생성
  - 코드 청킹 (파일 단위, Phase 1에서는 함수 단위 AST 생략)
  - 임베딩 생성 → pgvector 저장
  - 파일 경로 기반 검색 (grep 수준, tree-sitter는 Phase 5)
  - DoD: 프로젝트 레포의 코드가 인덱싱되어 검색 가능
  - 사용자 스토리: "시스템이 Git 레포의 코드를 인덱싱하고 검색할 수 있다"

### 티켓 품질 분석 `label:code-intel`

- [ ] **P3-4. TicketEnrichmentService**
  - 이슈 생성/수정 시 관련 코드 자동 검색 (pgvector 유사도)
  - LLM으로 영향 파일/수정 제안 생성
  - 이슈에 AI 분석 결과 저장 + API 응답에 포함
  - DoD: 이슈 클릭 시 AI 분석 탭에 실제 코드 분석 결과 표시
  - 사용자 스토리: "사용자가 이슈를 열면 AI가 분석한 관련 코드와 수정 제안이 보인다"

- [ ] **P3-5. AI 분석 UI 실데이터 연동**
  - AiAnalysisPanel: 목업 → 실제 API 데이터
  - 영향 파일 클릭 시 코드 하이라이트 (선택적)
  - "분석 다시 실행" 버튼
  - DoD: 이슈 상세의 AI 분석이 실제 코드 분석 결과
  - 사용자 스토리: "사용자가 AI 분석 탭에서 실제 영향 파일과 수정 제안을 확인할 수 있다"

### Phase 3 검증
> ✅ "이슈를 클릭하면 AI가 분석한 관련 코드/파일/변경이력이 자동으로 보이는가?"

---

## [EP-4] Phase 4: 안정화 + 피드백 (1~2주)

> 목표: 내부 5명이 1주일간 실제 사용 후 "계속 쓰겠다"고 한다

### 품질 `label:quality`

- [ ] **P4-1. 테스트 보강**
  - 백엔드: core 서비스 단위 테스트 80%+
  - 백엔드: API 통합 테스트 (핵심 엔드포인트)
  - 프론트: 핵심 훅 단위 테스트
  - DoD: 테스트 커버리지 목표 달성

- [ ] **P4-2. 에러 처리 + 모니터링**
  - 프론트: 글로벌 에러 바운더리 동작 확인
  - 백엔드: 로깅 포맷 정리 (JSON structured logging)
  - 에러 트래킹 설정 (Sentry 또는 대안)
  - DoD: 에러 발생 시 알림 수신

- [ ] **P4-3. 배포 + 사용자 피드백**
  - 내부 5명 대상 배포
  - 1주일 사용 후 피드백 수집
  - 피드백 기반 백로그 조정
  - DoD: 5명 중 3명 이상 "계속 쓰겠다"

### Phase 4 검증
> ✅ "5명이 1주일 쓰고 '계속 쓰겠다'고 하는가?"

---

## MVP 이후 (Phase 5+)

아래는 MVP 검증 후 진행. 우선순위는 피드백 기반으로 결정.

### Phase 5: 자동화 + 추가 연동
- [ ] 자동화 규칙 엔진 (트리거-조건-액션, SLA 기본)
- [ ] GitHub 양방향 동기화
- [ ] 코딩 에이전트 연동 (OpenHands)
- [ ] Slack 웹훅 알림

### Phase 6: 고도화
- [ ] SLA 일시정지/재개 + 에스컬레이션 체인
- [ ] Notion/Discord 연동
- [ ] tree-sitter AST 분석 (코드 인덱싱 정식)
- [ ] 하이브리드 배포 모드 (Agent)

### Phase 7: 확장
- [ ] 정책 관리 (CRUD + 승인 워크플로우)
- [ ] Project Wizard (아이디어 → MVP 생성)
- [ ] SaaS 모드 + 멀티테넌트 RLS

---

## 의존성

```
[P0] 기반 정리 ──→ [P1] 인증 + CRUD ──→ [P2] Jira + 대시보드 ──→ [P3] AI 코드 분석 ──→ [P4] 안정화
                      │                      │
                      ├── P1-1,2 (인증)      ├── P2-1 (Jira)
                      ├── P1-3,4 (프로젝트)  ├── P2-3 (차트)
                      └── P1-5,6 (이슈)      └── P2-4 (프로젝트 스위처)
```

### 병렬 가능

| 조합 | 설명 |
|------|------|
| P0 백엔드 + P0 프론트 | 기반 정리 동시 |
| P1-1(JWT) + P1-3(프로젝트 BE) | 인증과 프로젝트 API 동시 |
| P1-4(프로젝트 UI) + P1-5(이슈 BE) | FE/BE 병렬 |
| P3-1(Git) + P3-2(Ollama) | Git과 LLM 동시 셋업 |
