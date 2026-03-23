# IssueHub 개발 TODO List

> 최종 수정일: 2026-03-23
> 참조: FRONTEND-SPEC.md, BACKEND-SPEC.md, 2026-03-22-issuehub-ai-code-platform-design.md

---

## 0. 프로젝트 구조 셋업

- [ ] **0-1. 프론트엔드 디렉토리 리팩토링**
  - [ ] `app/` → `app/(auth)/` + `app/(dashboard)/` Route Group 분리
  - [ ] `app/(dashboard)/layout.tsx` 에 AppShell 적용
  - [ ] `app/(auth)/layout.tsx` 사이드바 없는 레이아웃
  - [ ] 기존 `app/issues/`, `app/policies/` 등 → `app/(dashboard)/` 하위로 이동
  - [ ] 파일명 kebab-case 통일 (`AppShell.tsx` → `app-shell.tsx`)
- [ ] **0-2. features/ 디렉토리 생성**
  - [ ] `features/dashboard/components/`, `hooks/`
  - [ ] `features/issues/components/`, `hooks/`, `utils/`
  - [ ] `features/projects/components/`
  - [ ] `features/automation/components/`
  - [ ] `features/connectors/components/`
  - [ ] `features/policies/components/`
  - [ ] `features/analytics/components/`
  - [ ] `features/settings/components/`
- [ ] **0-3. 공용 구조 정리**
  - [ ] `config/nav-config.ts` 생성 (기존 `lib/constants.ts`에서 NAV_ITEMS 분리)
  - [ ] `constants/mock-data.ts` (완료)
  - [ ] `components/common/status-badge.tsx` 생성
  - [ ] `components/common/priority-badge.tsx` 생성
  - [ ] `components/common/platform-icon.tsx` 생성
- [ ] **0-4. 기존 컴포넌트 이동**
  - [ ] `components/dashboard/SummaryCards.tsx` → `features/dashboard/components/summary-cards.tsx`
  - [ ] `components/issues/` → `features/issues/components/`
  - [ ] `lib/constants.ts` 분리 → `config/` + `constants/`
  - [ ] 모든 import 경로 수정 + 빌드 확인

---

## 1. 통합 대시보드 UI (목업)

- [ ] **1-1. 사이드바 개선**
  - [ ] 프로젝트 목록 섹션 추가 (프로젝트 아이콘 + 이름 + 동기화 상태)
  - [ ] 프로젝트 선택 시 해당 프로젝트 이슈로 필터
  - [ ] "프로젝트" 네비 항목 추가
- [ ] **1-2. SummaryCards 개선**
  - [ ] 프로젝트별 필터 적용
  - [ ] 카드 클릭 시 이슈 목록으로 이동 (해당 상태 필터)
- [ ] **1-3. RecentIssues 위젯**
  - [ ] 소스 배지 (Jira/GitHub/IssueHub)
  - [ ] 우선순위 도트 + 라벨
  - [ ] SLA 잔여시간/위반 표시
  - [ ] 클릭 시 이슈 상세로 이동
- [ ] **1-4. TeamWorkload 위젯**
  - [ ] 팀원별 이슈 수 + 프로그레스바
  - [ ] 워크로드 과부하 색상 표시 (초록/노랑/빨강)
- [ ] **1-5. TrendChart**
  - [ ] Recharts 설치 + 이슈 트렌드 라인 차트
  - [ ] 기간 선택 (7일/30일/90일)
- [ ] **1-6. SLA 현황 위젯**
  - [ ] 응답/해결 SLA 준수율 프로그레스바
  - [ ] 현재 위반 이슈 수 + 링크
- [ ] **1-7. 반응형 레이아웃**
  - [ ] 모바일: 1열, 태블릿: 2열, 데스크톱: 4열 그리드
  - [ ] 사이드바 접힘 지원 (이미 구현됨, 확인)

---

## 2. 이슈 상세 + AI 분석 화면 (목업)

- [ ] **2-1. 이슈 헤더**
  - [ ] 제목, 우선순위 배지, 상태 배지, 소스 배지
  - [ ] 담당자 아바타, 생성일, SLA 잔여시간
- [ ] **2-2. 탭 구조**
  - [ ] [상세] 설명 + 라벨 + 메타데이터
  - [ ] [AI 분석] AiAnalysisPanel (핵심 차별점)
  - [ ] [히스토리] 상태 변경 타임라인
  - [ ] [댓글] 댓글 목록 + 작성
- [ ] **2-3. AI 분석 패널 (AiAnalysisPanel)**
  - [ ] 영향 파일 목록 (파일명:라인 + 함수명)
  - [ ] 최근 변경 이력 (누가 언제 뭘 바꿨는지)
  - [ ] 유사 과거 이슈 (제목 + 해결 상태 + 링크)
  - [ ] 수정 제안 (AI가 생성한 텍스트)
  - [ ] 모두 목업 데이터
- [ ] **2-4. 자동 개발 섹션**
  - [ ] "자동 개발 시작" 버튼 (목업: 클릭 시 토스트 알림)
  - [ ] 자동 개발 이력 (PR 링크, 상태, 에이전트명)
- [ ] **2-5. 사이드 패널**
  - [ ] 담당자 변경, 우선순위 변경, 라벨 편집, 프로젝트 표시

---

## 3. 이슈 목록 화면 (목업)

- [ ] **3-1. DataTable 구현**
  - [ ] TanStack Table 설치 + 설정
  - [ ] columns.tsx: 우선순위(도트), 제목, 소스(배지), 담당자, SLA, 상태, 생성일
  - [ ] cell-action.tsx: 편집, 상태변경, 자동개발 시작 드롭다운
- [ ] **3-2. 필터 툴바**
  - [ ] 텍스트 검색 (제목, 설명)
  - [ ] 소스 필터 (Jira/GitHub/Notion/IssueHub)
  - [ ] 상태 필터 (열림/진행중/해결됨 등)
  - [ ] 우선순위 필터
  - [ ] 프로젝트 필터
  - [ ] 담당자 필터
  - [ ] URL 기반 필터 상태 관리 (nuqs)
- [ ] **3-3. 페이지네이션**
  - [ ] 페이지 크기 선택 (10/20/50)
  - [ ] URL 기반 페이지 상태 (nuqs)
- [ ] **3-4. 이슈 생성 모달/페이지**
  - [ ] react-hook-form + zod 스키마
  - [ ] 제목, 설명, 우선순위, 프로젝트, 담당자, 라벨 입력

---

## 4. 프로젝트 관리 (백엔드 + 프론트)

### 백엔드
- [ ] **4-1. Project 도메인 모델**
  - [ ] `core-domain/model/Project.kt` (id, orgId, name, serviceTag, gitUrl, codeIntelMode, llmProvider 등)
  - [ ] `core-domain/enums/CodeIntelMode.kt`, `LlmProvider.kt`
- [ ] **4-2. Project UseCase + Port**
  - [ ] `CreateProjectUseCase`, `UpdateProjectUseCase`, `GetProjectUseCase`, `ListProjectsUseCase`
  - [ ] `LoadProjectPort`, `SaveProjectPort`
  - [ ] `ProjectService` 구현
- [ ] **4-3. Project Persistence**
  - [ ] `ProjectJpaEntity`, `ProjectJpaRepository`, `ProjectPersistenceAdapter`
  - [ ] Flyway 마이그레이션 `V3__create_projects.sql`
- [ ] **4-4. Project REST API**
  - [ ] `ProjectController` (GET/POST/PATCH /api/v1/projects)
  - [ ] Request/Response DTO
- [ ] **4-5. Organization 기반**
  - [ ] `OrganizationJpaEntity`, `OrganizationJpaRepository`
  - [ ] Flyway `V4__create_organizations.sql` + 기존 테이블에 org_id FK

### 프론트엔드
- [ ] **4-6. 프로젝트 목록 페이지**
  - [ ] ProjectCard (이름, Git URL, 모드, LLM, 동기화 상태, 이슈 수)
  - [ ] 프로젝트 추가 버튼 → 생성 폼
- [ ] **4-7. 프로젝트 설정 페이지**
  - [ ] 기본 정보 (이름, service_tag)
  - [ ] Git 연동 (URL, 브랜치, 동기화 주기)
  - [ ] 코드 분석 모드 선택 (Local/Agent/API)
  - [ ] LLM 선택 (Ollama/Claude/Gemini) + 폴백 설정
  - [ ] 코딩 에이전트 선택 (OpenHands/SWE-agent/None)
  - [ ] 임베딩 모델 선택
- [ ] **4-8. API 연동**
  - [ ] `features/projects/hooks/use-projects.ts`
  - [ ] 목업 → 실제 API 전환

---

## 5. 자동화 규칙 설정 (백엔드 + 프론트)

### 백엔드
- [ ] **5-1. AutomationRule UseCase + Port**
  - [ ] `CreateRuleUseCase`, `UpdateRuleUseCase`, `DeleteRuleUseCase`, `TestRuleUseCase`
  - [ ] `RuleEvaluator` 확장 (Strategy 패턴으로 ActionHandler 분리)
- [ ] **5-2. SLA 정책 서비스**
  - [ ] `SlaService` (시작, 일시정지, 재개, 위반 체크)
  - [ ] 비즈니스 시간 계산 (주말/공휴일 제외)
- [ ] **5-3. 에스컬레이션 체인**
  - [ ] `EscalationService` (담당자 → 팀장 → 매니저 단계별)
- [ ] **5-4. REST API**
  - [ ] `AutomationController` (CRUD + dry-run)

### 프론트엔드
- [ ] **5-5. 규칙 목록 페이지**
  - [ ] RuleCard (이름, 트리거, 조건, 액션 요약, 활성/비활성 토글)
- [ ] **5-6. 규칙 생성/수정 폼**
  - [ ] 트리거 선택 (이슈 생성, 상태 변경, 시간 기반 등)
  - [ ] 조건 빌더 (필드 + 연산자 + 값)
  - [ ] 액션 선택 (담당자 배정, 라벨 추가, 알림, 에스컬레이션)
  - [ ] Dry-run 테스트 버튼

---

## 6. 자동 개발 추적 대시보드 (백엔드 + 프론트)

### 백엔드
- [ ] **6-1. CodingTask 도메인**
  - [ ] `CodingAgentPort` + `OpenHandsAdapter` 구현
  - [ ] `coding_tasks` 테이블 (status: PENDING/RUNNING/COMPLETED/FAILED)
  - [ ] REST API: POST /api/v1/issues/{id}/auto-dev, GET /api/v1/coding-tasks
- [ ] **6-2. 상태 추적**
  - [ ] OpenHands API 폴링으로 상태 업데이트
  - [ ] `CodingTaskCompletedEvent` 발행

### 프론트엔드
- [ ] **6-3. 자동 개발 대시보드 페이지**
  - [ ] 진행중/완료/실패 탭
  - [ ] 작업별: 이슈 링크, PR 링크, 에이전트명, 시작시간, 소요시간
- [ ] **6-4. 이슈 상세 연동**
  - [ ] "자동 개발 시작" 버튼 → API 호출
  - [ ] 자동 개발 이력 섹션 실제 데이터 연동

---

## 7. DB 스키마 (백엔드 인프라)

- [ ] **7-1. V3: organizations 테이블**
  - [ ] id, slug, name, plan, settings(JSONB), created_at
- [ ] **7-2. V4: 기존 테이블 org_id 추가**
  - [ ] users, issues, teams, policies, connector_configs, automation_rules, audit_logs에 org_id FK
- [ ] **7-3. V5: projects 테이블**
  - [ ] id, org_id, name, service_tag, git_url, git_branch, code_intel_mode, coding_agent, llm_provider, embedding_provider, last_sync_at
- [ ] **7-4. V6: 코드 인텔리전스 테이블**
  - [ ] code_chunks (file_path, chunk_type, symbol_name, content, embedding, last_commit_sha)
  - [ ] symbol_index (symbol_name, symbol_type, file_path, line_number, language)
  - [ ] file_dependencies (source_file, target_file, dependency_type)
- [ ] **7-5. V7: coding_tasks 테이블**
  - [ ] id, project_id, issue_id, agent_provider, status, pr_url, error_message, started_at, completed_at

---

## 8. 이슈 CRUD API + Jira 동기화 (백엔드 인프라)

- [ ] **8-1. Issue REST API**
  - [ ] `IssueController` (GET/POST/PATCH/DELETE /api/v1/issues)
  - [ ] `CreateIssueRequest`, `UpdateIssueRequest`, `IssueResponse` DTO
  - [ ] 페이지네이션 + 필터 (상태, 우선순위, 소스, 프로젝트, 담당자)
- [ ] **8-2. JWT 인증**
  - [ ] `SecurityConfig` (Spring Security + JWT)
  - [ ] 로그인/토큰 발급 API
- [ ] **8-3. RBAC 기본**
  - [ ] ADMIN/MEMBER 2단계 (Phase 1 최소)
  - [ ] `@PreAuthorize` 적용
- [ ] **8-4. Jira 단방향 동기화**
  - [ ] `JiraConnectorAdapter` (Jira REST API v3)
  - [ ] 5분 주기 폴링 (`@Scheduled`)
  - [ ] Jira 이슈 → IssueHub Issue 매핑

---

## 9. Git bare clone + fetch (백엔드 인프라)

- [ ] **9-1. GitRepoMirror 서비스**
  - [ ] 프로젝트 등록 시 `git clone --bare`
  - [ ] 주기적 `git fetch` (5분 또는 webhook)
  - [ ] 디스크 사용량 모니터링
- [ ] **9-2. 저장소 관리**
  - [ ] `/data/repos/{project_id}.git/` 디렉토리 구조
  - [ ] 프로젝트 삭제 시 클린업
  - [ ] Git 인증 토큰 관리 (읽기 전용 scope)

---

## 10. 코드 인덱싱 파이프라인 (백엔드 인프라)

- [ ] **10-1. CodeIntelPort 인터페이스**
  - [ ] `analyzeForTicket()`, `searchCode()`, `getAffectedFiles()`
- [ ] **10-2. LocalCodeIntelAdapter**
  - [ ] 코드 청킹 (함수/클래스 단위)
  - [ ] 임베딩 생성 (EmbeddingPort → Ollama nomic-embed)
  - [ ] pgvector 저장 (code_chunks 테이블)
- [ ] **10-3. 심볼 인덱스**
  - [ ] AST 파싱 (tree-sitter 또는 정규식 기반 Phase 1)
  - [ ] symbol_index 테이블 적재
- [ ] **10-4. TicketEnrichmentService**
  - [ ] 이슈 생성 시 관련 코드 자동 검색
  - [ ] LLM으로 분석 결과 생성
  - [ ] 이슈에 AI 분석 결과 첨부

---

## 11. Ollama + LLM 연동 (백엔드 인프라)

- [ ] **11-1. OllamaLlmAdapter**
  - [ ] Ollama REST API 호출 (`POST /api/generate`)
  - [ ] 모델 선택 (프로젝트 설정 기반)
- [ ] **11-2. ClaudeApiLlmAdapter**
  - [ ] Claude API 폴백
  - [ ] 프로젝트별 LLM 라우팅 로직
- [ ] **11-3. OllamaEmbeddingAdapter**
  - [ ] `POST /api/embeddings` 호출
  - [ ] nomic-embed-text 모델
- [ ] **11-4. Docker Compose 설정**
  - [ ] Ollama 서비스 추가
  - [ ] OLLAMA_NUM_PARALLEL, OLLAMA_KEEP_ALIVE 설정
  - [ ] 모델 자동 다운로드 스크립트

---

## 12. 외부 연동 확장 (백엔드 인프라)

- [ ] **12-1. GitHub 양방향 동기화**
  - [ ] GitHub App OAuth 설정
  - [ ] Webhook 수신 (issues, pull_request 이벤트)
  - [ ] GitHub Issue ↔ IssueHub Issue 매핑
  - [ ] PR-이슈 자동 연결 (`fixes #123` 파싱)
- [ ] **12-2. Notion 커넥터**
  - [ ] Notion OAuth 설정
  - [ ] Notion DB ↔ IssueHub Issue 동기화
- [ ] **12-3. Slack 연동**
  - [ ] Slack App 설정 (Bot Token)
  - [ ] 알림 발송 (이슈 생성, SLA 위반, 에스컬레이션)
  - [ ] Slash Commands (/issue create, /issue search)

---

## 13. 코딩 에이전트 연동 (백엔드 인프라)

- [ ] **13-1. CodingAgentPort 인터페이스**
  - [ ] `createPullRequest(task)`, `getTaskStatus(taskId)`, `cancelTask(taskId)`
- [ ] **13-2. OpenHandsAdapter**
  - [ ] OpenHands REST API 연동
  - [ ] 작업 생성: 이슈 컨텍스트 + 코드 분석 결과 전달
  - [ ] 결과 수신: PR URL + 상태 업데이트
- [ ] **13-3. 에이전트 실행 관리**
  - [ ] 동시 실행 제한 (프로젝트당 1개)
  - [ ] 타임아웃 설정 (30분)
  - [ ] 실패 시 재시도 정책 (최대 1회)
  - [ ] coding_tasks 상태 머신 (PENDING → RUNNING → COMPLETED/FAILED)

---

## 의존성

```
[0] 구조 셋업 ──→ [1] 대시보드 ──→ [2] 이슈 상세 ──→ [3] 이슈 목록
                                                          │
                                                    (목업 Phase 완료)
                                                          │
[7] DB 스키마 ──┬→ [8] 이슈 CRUD+Jira ──→ [12] 외부 연동  │
               ├→ [9] Git clone ──┐                       │
               └→ [11] Ollama ────┼→ [10] 코드 인덱싱 ──→ [13] 코딩 에이전트
                                  │
               [1~3 완료] ──→ [4] 프로젝트 관리 ──→ [5] 자동화 ──→ [6] 자동 개발
```

### 병렬 작업 가능 조합

- **[0] + [7]**: 프론트 구조 셋업과 DB 스키마는 동시 진행 가능
- **[1] + [8]**: 대시보드 목업과 이슈 CRUD API 동시 진행 가능
- **[9] + [11]**: Git clone과 Ollama 설정은 동시 진행 가능
- **[12-1] + [12-2] + [12-3]**: GitHub/Notion/Slack 연동은 독립적으로 병렬 가능
