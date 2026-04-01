# Phase 0 Jira 티켓 생성 목록

> 프로젝트: LIH | 에픽: EP-0 Phase 0: 기반 정리
> 생성 순서: 프론트엔드 먼저 → 백엔드
> 참조: docs/TODO.md, docs/engineering/FRONTEND-SPEC.md, docs/engineering/BACKEND-SPEC.md

---

## 에픽

| 필드 | 값 |
|------|-----|
| 이슈 타입 | Epic |
| 제목 | [EP-0] Phase 0: 기반 정리 |
| 설명 | docker compose up으로 백엔드+프론트 앱이 뜨고, CI가 동작한다 |
| 레이블 | `infra`, `frontend` |

---

## 프론트엔드 티켓 (우선)

### 티켓 1: P0-5. UI 인프라 정리

| 필드 | 값 |
|------|-----|
| 이슈 타입 | Task |
| 제목 | P0-5. UI 인프라 정리 (loading/error/skeleton/toast/파일명) |
| 우선순위 | High |
| 레이블 | `frontend`, `infra` |
| 에픽 | EP-0 |
| 스토리 포인트 | 3 |

**설명:**
프론트엔드 기반 UI 인프라를 정리한다. 글로벌/라우트별 로딩·에러 처리, Skeleton 컴포넌트, Toast 시스템을 추가하고, 파일명을 kebab-case로 통일한다.

**수락 조건 (Acceptance Criteria):**
- [ ] `app/(dashboard)/loading.tsx`, `app/(dashboard)/error.tsx` 글로벌 추가
- [ ] 주요 라우트(`issues/`, `projects/`)별 `loading.tsx` + `error.tsx` 추가
- [ ] shadcn Skeleton 컴포넌트 설치 (`npx shadcn@latest add skeleton`)
- [ ] 대시보드 위젯별 Skeleton 생성 (SummaryCards, RecentIssues, TeamWorkload, SlaStatus)
- [ ] Toast 시스템 설치 (`npx shadcn@latest add sonner`) + 기존 `alert()` 호출 제거
- [ ] 파일명 통일: `Header.tsx` → `header.tsx`, `Sidebar.tsx` → `sidebar.tsx` 등
- [ ] `npm run build` 성공 + Console 에러 0개

**기술 노트:**
- shadcn/ui 컴포넌트는 `npx shadcn@latest add`로만 추가, 직접 수정 금지
- 파일명은 CLAUDE.md 네이밍 컨벤션(kebab-case) 준수
- 참조: docs/engineering/FRONTEND-SPEC.md §2 디렉토리 구조

---

### 티켓 2: P0-6. Mock 추상화 레이어

| 필드 | 값 |
|------|-----|
| 이슈 타입 | Task |
| 제목 | P0-6. Mock 추상화 레이어 (컴포넌트→훅 분리) |
| 우선순위 | High |
| 레이블 | `frontend` |
| 에픽 | EP-0 |
| 스토리 포인트 | 3 |
| 선행 티켓 | P0-5 (is blocked by) |

**설명:**
컴포넌트에서 Mock 데이터를 직접 import하는 패턴을 훅 기반으로 전환한다. 이후 API 연동 시 훅 내부만 교체하면 되도록 추상화한다.

**수락 조건 (Acceptance Criteria):**
- [ ] `features/dashboard/hooks/use-dashboard-stats.ts` 훅 생성 (SummaryCards, RecentIssues, TeamWorkload, SlaStatus 데이터)
- [ ] `features/issues/hooks/use-issues.ts` 훅 생성 (이슈 목록 데이터)
- [ ] `features/issues/hooks/use-issue-detail.ts` 훅 생성 (이슈 상세 + AI 분석 데이터)
- [ ] 모든 컴포넌트에서 `MOCK_*` 직접 import 제거 → 훅으로 교체
- [ ] 훅 시그니처: `{ data, isLoading, error }` 반환 (SWR 호환)
- [ ] `npm run build` 성공

**기술 노트:**
- Mock → API 전환 전략: FRONTEND-SPEC.md §6 참조
- 훅 파일명: camelCase (`useIssues.ts`, `useDashboardStats.ts`)
- 컴포넌트는 훅만 바라보므로, Phase 1에서 훅 내부만 SWR로 교체하면 전환 완료

---

### 티켓 3: P0-7. 폼/테스트 라이브러리 설치

| 필드 | 값 |
|------|-----|
| 이슈 타입 | Task |
| 제목 | P0-7. 폼/테스트 라이브러리 설치 (react-hook-form, vitest, msw) |
| 우선순위 | Medium |
| 레이블 | `frontend`, `test` |
| 에픽 | EP-0 |
| 스토리 포인트 | 2 |
| 선행 티켓 | P0-6 (is blocked by) |

**설명:**
폼 처리(react-hook-form + zod)와 테스트(vitest + testing-library + msw) 기반을 구축한다.

**수락 조건 (Acceptance Criteria):**
- [ ] `react-hook-form` + `zod` + `@hookform/resolvers` 설치
- [ ] `vitest` + `@testing-library/react` + `@testing-library/jest-dom` + `msw` 설치
- [ ] `vitest.config.ts` 설정 (jsdom 환경, path alias 등)
- [ ] 첫 번째 테스트 작성: `use-dashboard-stats` 훅 단위 테스트
- [ ] `npm test` 통과

**기술 노트:**
- 폼 패턴: CLAUDE.md Frontend Rules > 폼 패턴 참조
- vitest는 Next.js + TypeScript path alias(@/) 설정 필요
- msw는 Phase 1 API 연동 시 Mock 서버로 활용

---

## 백엔드 티켓

### 티켓 4: P0-2. API 공통 인프라

| 필드 | 값 |
|------|-----|
| 이슈 타입 | Task |
| 제목 | P0-2. API 공통 인프라 (ApiResponse, GlobalExceptionHandler, 프로파일) |
| 우선순위 | High |
| 레이블 | `backend`, `infra` |
| 에픽 | EP-0 |
| 스토리 포인트 | 3 |

**설명:**
REST API의 공통 응답 포맷과 예외 처리를 구축한다. 환경별 프로파일을 분리한다.

**수락 조건 (Acceptance Criteria):**
- [ ] `ApiResponse<T>` 공용 래퍼 구현 (`success`, `data`, `error`, `timestamp`)
- [ ] `PageResponse<T>` 페이지네이션 래퍼 구현 (`data`, `page: {number, size, totalElements, totalPages}`)
- [ ] `GlobalExceptionHandler` (@RestControllerAdvice) — DomainException 매핑
  - EntityNotFound → 404
  - BusinessRuleViolation → 422
  - ValidationFailed → 400
- [ ] `application-local.yml`, `application-dev.yml` 프로파일 분리
- [ ] 에러 발생 시 일관된 JSON 응답 반환 확인

**기술 노트:**
- API 응답 포맷: CLAUDE.md Backend Rules > API 응답 포맷 참조
- 에러 처리 패턴: CLAUDE.md Backend Rules > 에러 처리 패턴 참조
- app-api 모듈에 위치 (`com.issuehub.api.config/`, `com.issuehub.api.controller/`)

---

### 티켓 5: P0-3. DB 마이그레이션 (V3~V5)

| 필드 | 값 |
|------|-----|
| 이슈 타입 | Task |
| 제목 | P0-3. DB 마이그레이션 V3~V5 (organizations, org_id FK, projects) |
| 우선순위 | High |
| 레이블 | `backend`, `infra`, `database` |
| 에픽 | EP-0 |
| 스토리 포인트 | 3 |
| 선행 티켓 | P0-2 (is blocked by) |

**설명:**
멀티테넌시 지원을 위한 organizations, projects 테이블을 추가하고, 기존 테이블에 org_id FK를 적용한다.

**수락 조건 (Acceptance Criteria):**
- [ ] V3: `organizations` 테이블 생성 (id, slug, name, plan, settings JSONB, created_at)
- [ ] V4: 기존 테이블에 `org_id` FK 추가 (users, issues, teams 등)
- [ ] V5: `projects` 테이블 생성 (id, org_id, name, service_tag, git_url, code_intel_mode, llm_provider 등)
- [ ] Flyway 마이그레이션 성공 (`./gradlew flywayMigrate`)
- [ ] 테이블 생성 확인 (psql 또는 테스트)

**기술 노트:**
- DB 스키마: docs/engineering/DATABASE.md 참조
- Flyway 스크립트 위치: `infra-persistence/src/main/resources/db/migration/`
- Issue 도메인 모델에는 이미 orgId, projectId 추가됨 (P0-1 완료)

---

### 티켓 6: P0-4. 개발 인프라

| 필드 | 값 |
|------|-----|
| 이슈 타입 | Task |
| 제목 | P0-4. 개발 인프라 (Docker Compose, TestContainers, ArchUnit, CI) |
| 우선순위 | Medium |
| 레이블 | `backend`, `infra`, `ci` |
| 에픽 | EP-0 |
| 스토리 포인트 | 5 |

**설명:**
개발/테스트/CI 인프라를 구축한다. Docker Compose로 로컬 환경을 통합하고, TestContainers와 ArchUnit으로 테스트 품질을 확보한다.

**수락 조건 (Acceptance Criteria):**
- [ ] Docker Compose에 백엔드 앱 서비스 추가 (또는 로컬 bootRun 가이드 문서화)
- [ ] TestContainers 설정 (PostgreSQL) + 샘플 통합 테스트 1개
- [ ] ArchUnit 기본 규칙 추가
  - core-domain은 Spring 의존 금지
  - core-* → infra-* 의존 금지
  - infra-* 간 상호 의존 금지
- [ ] GitHub Actions CI 워크플로우 (build + test on PR)
- [ ] `docker compose up` 후 `/actuator/health` 200 반환

**기술 노트:**
- ArchUnit 테스트: CLAUDE.md Backend Rules > 테스트 컨벤션 참조
- Docker Compose: deploy/docker-compose.yml
- CI: .github/workflows/ci.yml

---

## 생성 순서 및 의존성

```
[에픽] EP-0 Phase 0: 기반 정리
  ├── P0-5 UI 인프라 정리          ← 먼저
  │     └── P0-6 Mock 추상화      ← P0-5 완료 후
  │           └── P0-7 폼/테스트   ← P0-6 완료 후
  ├── P0-2 API 공통 인프라         ← 병렬 가능
  │     └── P0-3 DB 마이그레이션   ← P0-2 완료 후
  └── P0-4 개발 인프라             ← 병렬 가능
```

## Jira 생성 커맨드 (다음 세션)

```
jira:create "P0-5. UI 인프라 정리" --type Task
jira:create "P0-6. Mock 추상화 레이어" --type Task
jira:create "P0-7. 폼/테스트 라이브러리 설치" --type Task
jira:create "P0-2. API 공통 인프라" --type Task
jira:create "P0-3. DB 마이그레이션 V3~V5" --type Task
jira:create "P0-4. 개발 인프라" --type Task
```
