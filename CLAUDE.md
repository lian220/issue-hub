# IssueHub

## Project Links

- **Jira**: https://liandy220-developer.atlassian.net/jira/software/projects/LIH
- **Jira Project Key**: LIH

## Tech Stack

- Backend: Kotlin + Spring Boot 3.x (Hexagonal Architecture)
- Frontend: Next.js 16 + TypeScript + shadcn/ui + Tailwind CSS
- DB: PostgreSQL 16 + pgvector
- Cache: Redis 7
- Search: OpenSearch (nori 한국어 형태소 분석)
- LLM: Ollama (로컬 기본) + Claude/Gemini API (폴백)
- Container: Docker Compose → k3d (Phase 2+)

## Architecture

- Hexagonal (Ports & Adapters) pattern
- Monorepo: backend/ + frontend/ + docs/ + pipelines/ + deploy/
- Design spec: docs/superpowers/specs/2026-03-22-issuehub-ai-code-platform-design.md

## Key Decisions

- LLM: Ollama default, Claude API fallback (ADR-004)
- Automation: core-automation 직접 구현 + n8n을 외부 연동 게이트웨이로 활용 (n8n은 이벤트 수신/발송만 담당, 판단 로직은 core-automation 내부)
- Integration: Direct REST API (CRUD) + Spring AI + MCP (AI 기능)
- Code Intelligence: IssueHub가 Git bare clone 직접 보유, 코딩은 OpenHands에 위임
- Tech Stack: Spring Boot + Kotlin 유지, Python 불필요 (Phase 4+에서 재검토)

---

## Frontend Rules

> 참조 프로젝트: [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)

### 디렉토리 구조

```
frontend/src/
├── app/                      # Next.js App Router (라우팅 + 페이지 진입점만)
│   ├── (auth)/               # Route group: 인증 (사이드바 없는 레이아웃)
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/           # Route group: 대시보드 (AppShell 레이아웃)
│   │   ├── page.tsx           # / → 대시보드 홈
│   │   ├── issues/
│   │   │   ├── page.tsx       # /issues
│   │   │   └── [id]/page.tsx  # /issues/:id
│   │   ├── projects/
│   │   │   ├── page.tsx       # /projects
│   │   │   └── [id]/settings/page.tsx
│   │   ├── automation/page.tsx
│   │   ├── connectors/page.tsx
│   │   ├── policies/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx         # AppShell 적용
│   ├── layout.tsx             # Root (providers, fonts)
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn/ui 기본 컴포넌트 (수정 금지, npx로 관리)
│   ├── forms/                # 재사용 폼 컴포넌트 (FormInput, FormSelect 등)
│   ├── layout/               # AppShell, Header, Sidebar, PageContainer
│   ├── modal/                # 공용 모달 (AlertModal 등)
│   └── common/               # 공용 비즈니스 컴포넌트 (StatusBadge, PriorityBadge)
├── features/                 # 기능별 모듈 (핵심 디렉토리)
│   ├── issues/
│   │   ├── components/       # 이슈 전용 UI 컴포넌트
│   │   │   ├── issue-form.tsx
│   │   │   ├── issue-listing.tsx
│   │   │   └── issue-tables/
│   │   │       ├── columns.tsx
│   │   │       ├── cell-action.tsx
│   │   │       ├── options.tsx
│   │   │       └── index.tsx
│   │   ├── hooks/            # 이슈 전용 훅
│   │   ├── utils/            # 이슈 전용 유틸/스토어
│   │   └── types/            # 이슈 전용 타입 (필요시)
│   ├── dashboard/
│   ├── automation/
│   └── connectors/
├── hooks/                    # 공용 커스텀 훅
├── lib/                      # 공용 유틸리티 (api.ts, utils.ts, parsers.ts)
├── config/                   # 앱 설정 (nav-config.ts, data-table.ts)
├── constants/                # 상수, Mock 데이터
└── types/                    # 공용 타입 정의
```

### 컴포넌트 조직 규칙

- **app/ 디렉토리**: 라우팅과 데이터 페칭 진입점만 배치. 비즈니스 로직은 features/로 위임
  ```tsx
  // app/dashboard/issues/page.tsx - 좋은 예
  import { IssueListingPage } from '@/features/issues/components/issue-listing';
  export default function IssuePage() {
    return <IssueListingPage />;
  }
  ```
- **features/**: 기능별로 components, hooks, utils, types 하위 폴더 구성
- **components/ui/**: shadcn/ui 컴포넌트 전용. `npx shadcn@latest add` 로만 추가, 직접 수정 금지
- **components/common/**: 2개 이상 feature에서 사용하는 비즈니스 컴포넌트
- 한 feature에서만 사용하는 컴포넌트는 반드시 `features/{feature}/components/`에 배치

### 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일명 (컴포넌트) | kebab-case | `issue-form.tsx`, `cell-action.tsx` |
| 파일명 (훅) | camelCase, `use` 접두사 | `useIssues.ts`, `useDataTable.ts` |
| 파일명 (유틸) | kebab-case | `form-schema.ts`, `parsers.ts` |
| 컴포넌트 export | PascalCase | `export function IssueForm()` |
| 타입/인터페이스 | PascalCase | `interface Issue`, `type SearchResult` |
| 상수 | UPPER_SNAKE_CASE | `const MAX_FILE_SIZE = 5000000` |
| 디렉토리 | kebab-case | `issue-tables/`, `product-tables/` |

### 상태 관리 패턴

- **URL 상태** (검색, 필터, 페이지네이션): `nuqs` 사용
  ```tsx
  import { useQueryState, parseAsInteger } from 'nuqs';
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  ```
- **서버 상태** (API 데이터): SWR 또는 React Server Components
- **클라이언트 전역 상태** (UI 상태): Zustand (필요시에만, 최소한으로)
  ```tsx
  // features/kanban/utils/store.ts
  import { create } from 'zustand';
  ```
- **폼 상태**: react-hook-form + zod (아래 폼 패턴 참조)

### 데이터 페칭 패턴

- **Server Components (기본)**: 정적/SEO 필요 데이터, 초기 로드 데이터
- **Client Components + SWR**: 실시간 업데이트, 사용자 인터랙션 후 데이터
- **Parallel Routes**: 대시보드 위젯 등 독립적인 데이터 로딩 (loading.tsx, error.tsx 개별 제공)
  ```
  app/dashboard/overview/
  ├── @area_stats/
  │   ├── page.tsx      # 데이터 페칭 + 렌더링
  │   ├── loading.tsx   # Suspense 폴백
  │   └── error.tsx     # Error boundary
  └── layout.tsx        # Parallel routes 조합
  ```

### 폼 패턴 (react-hook-form + zod)

```tsx
// 1. Zod 스키마 정의 (파일 상단 또는 별도 form-schema.ts)
const issueFormSchema = z.object({
  title: z.string().min(2, { message: '제목은 2자 이상이어야 합니다.' }),
  priority: z.nativeEnum(IssuePriority),
  description: z.string().optional(),
});

// 2. 폼 컴포넌트
export function IssueForm({ initialData }: { initialData?: Issue }) {
  const form = useForm<z.infer<typeof issueFormSchema>>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: { title: initialData?.title ?? '', ... },
  });

  function onSubmit(values: z.infer<typeof issueFormSchema>) { ... }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormInput control={form.control} name="title" label="제목" />
        ...
      </form>
    </Form>
  );
}
```

### 테이블/리스트 패턴 (Tanstack Table)

- 테이블은 feature별 `{feature}-tables/` 디렉토리에 분리:
  - `columns.tsx` - 컬럼 정의 (`ColumnDef<T>[]`)
  - `cell-action.tsx` - 행 액션 (편집, 삭제 드롭다운)
  - `options.tsx` - 필터 옵션 상수
  - `index.tsx` - 테이블 조합 컴포넌트
- 공용 테이블 컴포넌트는 `components/ui/table/`:
  - `data-table.tsx`, `data-table-pagination.tsx`, `data-table-toolbar.tsx` 등
- URL 기반 페이지네이션/필터링은 `hooks/use-data-table.ts` 훅 사용

---

## Backend Rules

> 참조 프로젝트: [hex-arch-kotlin-spring-boot](https://github.com/dustinsand/hex-arch-kotlin-spring-boot)

### 모듈 구조

```
backend/
├── core-domain/          # 순수 도메인 모델 + 도메인 서비스 (의존성 없음)
├── core-issue/           # 이슈 도메인: ports (inbound/outbound) + service
├── core-policy/          # 정책 도메인
├── core-automation/      # 자동화 규칙 도메인
├── core-connector/       # 외부 연동 도메인
├── core-ai/              # AI 기능 도메인
├── infra-persistence/    # JPA 어댑터 (core-* 의 outbound port 구현)
├── infra-kafka/          # Kafka 어댑터
├── infra-webhook/        # Webhook 수신 어댑터 (inbound adapter)
├── infra-llm/            # LLM 어댑터 (core-ai outbound port 구현)
├── app-api/              # REST API 진입점 (inbound adapter + 조합)
└── app-scheduler/        # 스케줄러 진입점
```

**의존성 방향 (반드시 준수)**:
```
app-* → infra-* → core-* → core-domain
                    ↑
              core-domain은 어떤 모듈도 의존하지 않음
              core-*는 다른 core-*를 의존할 수 있으나, infra-*를 의존 금지
              infra-*끼리는 서로 의존 금지
```

### 패키지 네이밍

```
// core-xxx 모듈 (예: core-issue)
com.issuehub.issue
├── port
│   ├── inbound/          # UseCase 인터페이스 + Command/Query DTO
│   │   ├── CreateIssueUseCase.kt
│   │   ├── SearchIssueUseCase.kt
│   │   └── UpdateIssueUseCase.kt
│   └── outbound/         # Port 인터페이스 (외부 의존 추상화)
│       ├── LoadIssuePort.kt
│       └── SaveIssuePort.kt
├── service/              # UseCase 구현체
│   └── IssueService.kt
└── event/                # 도메인 이벤트
    ├── IssueCreatedEvent.kt
    └── IssueUpdatedEvent.kt

// core-domain 모듈
com.issuehub.domain
├── model/                # 도메인 엔티티 (순수 Kotlin data class)
│   ├── Issue.kt
│   └── User.kt
└── enums/                # 도메인 열거형
    ├── IssueStatus.kt
    └── IssuePriority.kt

// infra-xxx 모듈 (예: infra-persistence)
com.issuehub.persistence
├── adapter/              # Port 구현체 (@Component)
│   └── IssuePersistenceAdapter.kt
├── entity/               # JPA 엔티티 (DB 전용)
│   └── IssueJpaEntity.kt
└── repository/           # Spring Data JPA Repository
    └── IssueJpaRepository.kt

// app-api 모듈
com.issuehub.api
├── controller/           # REST Controller (inbound adapter)
│   └── IssueController.kt
└── config/               # Spring 설정
    ├── SecurityConfig.kt
    └── CorsConfig.kt
```

### Port/Adapter 네이밍 컨벤션

| 유형 | 네이밍 패턴 | 위치 | 예시 |
|------|------------|------|------|
| Inbound Port | `{동사}{도메인}UseCase` | `core-*/port/inbound/` | `CreateIssueUseCase` |
| Inbound DTO (쓰기) | `{동사}{도메인}Command` | UseCase 내부 data class | `CreateIssueCommand` |
| Inbound DTO (읽기) | `{동사}{도메인}Query` | UseCase 내부 data class | `SearchIssueQuery` |
| Outbound Port | `{동사}{도메인}Port` | `core-*/port/outbound/` | `LoadIssuePort`, `SaveIssuePort` |
| Service (구현체) | `{도메인}Service` | `core-*/service/` | `IssueService` |
| Adapter (구현체) | `{도메인}{기술}Adapter` | `infra-*/adapter/` | `IssuePersistenceAdapter` |
| JPA Entity | `{도메인}JpaEntity` | `infra-persistence/entity/` | `IssueJpaEntity` |
| JPA Repository | `{도메인}JpaRepository` | `infra-persistence/repository/` | `IssueJpaRepository` |
| Controller | `{도메인}Controller` | `app-api/controller/` | `IssueController` |
| Domain Event | `{도메인}{동작}Event` | `core-*/event/` | `IssueCreatedEvent` |

### JPA Entity vs Domain Entity 분리

- **Domain Entity** (`core-domain/model/`): 순수 Kotlin data class. JPA/Spring 어노테이션 금지
  ```kotlin
  // core-domain: 순수 도메인 모델
  data class Issue(
      val id: UUID = UUID.randomUUID(),
      val title: String,
      val status: IssueStatus = IssueStatus.OPEN,
      ...
  )
  ```
- **JPA Entity** (`infra-persistence/entity/`): DB 매핑 전용. 도메인 로직 금지
  ```kotlin
  // infra-persistence: DB 전용 엔티티
  @Entity @Table(name = "issues")
  class IssueJpaEntity(
      @Id val id: UUID = UUID.randomUUID(),
      @Column(nullable = false) var title: String = "",
      ...
  )
  ```
- **변환 로직**: Adapter 내에 `toDomain()` / `toEntity()` 확장 함수로 구현
  ```kotlin
  // IssuePersistenceAdapter.kt 내부
  private fun IssueJpaEntity.toDomain(): Issue { ... }
  private fun Issue.toEntity(): IssueJpaEntity { ... }
  ```

### 테스트 컨벤션

| 테스트 유형 | 위치 | 접미사 | 도구 | 대상 |
|------------|------|--------|------|------|
| 단위 테스트 | `core-*/src/test/` | `*Test.kt` | JUnit 5 + MockK | Service, Domain Model |
| 통합 테스트 | `infra-*/src/test/` | `*IT.kt` | @SpringBootTest + Testcontainers | Adapter, Repository |
| 아키텍처 테스트 | `app-*/src/test/` | `*ArchitectureTest.kt` | ArchUnit | 의존성 방향 검증 |
| API 테스트 | `app-api/src/test/` | `*ControllerTest.kt` | MockMvc / WebTestClient | Controller |

**아키텍처 테스트 (ArchUnit) 필수 규칙**:
```kotlin
// HexagonalArchitectureTest.kt - 모든 app-* 모듈에 포함
@ArchTest
val `도메인은 application과 adapter를 의존하지 않는다` =
    noClasses()
        .that().resideInAPackage("com.issuehub.domain..")
        .should().dependOnClassesThat()
        .resideInAnyPackage("com.issuehub.*.port..", "com.issuehub.*.service..", "com.issuehub.*.adapter..")

@ArchTest
val `core 모듈은 infra를 의존하지 않는다` =
    noClasses()
        .that().resideInAPackage("com.issuehub.issue..")
        .should().dependOnClassesThat()
        .resideInAnyPackage("com.issuehub.persistence..", "com.issuehub.kafka..")
```

### API 응답 포맷

```kotlin
// 성공 응답 (단건)
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-03-23T10:00:00Z"
}

// 성공 응답 (목록 + 페이지네이션)
{
  "success": true,
  "data": [ ... ],
  "page": { "number": 0, "size": 20, "totalElements": 150, "totalPages": 8 },
  "timestamp": "2026-03-23T10:00:00Z"
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": "ISSUE_NOT_FOUND",
    "message": "Issue not found: 550e8400-...",
    "details": null
  },
  "timestamp": "2026-03-23T10:00:00Z"
}
```

### 에러 처리 패턴

- **도메인 예외**: `core-domain`에 sealed class 정의
  ```kotlin
  // core-domain/exception/
  sealed class DomainException(message: String) : RuntimeException(message) {
      class EntityNotFound(entity: String, id: Any) : DomainException("$entity not found: $id")
      class BusinessRuleViolation(rule: String) : DomainException("Business rule violated: $rule")
      class ValidationFailed(field: String, reason: String) : DomainException("Validation failed for $field: $reason")
  }
  ```
- **글로벌 예외 핸들러**: `app-api`에 `@RestControllerAdvice`로 통합 처리
- **Service 계층에서 직접 throw**: `IllegalArgumentException` 대신 `DomainException` 사용

---

## General Rules

### Git 브랜치 네이밍

```
feat/{jira-ticket-id}-{짧은-설명}     # 새 기능
fix/{jira-ticket-id}-{짧은-설명}      # 버그 수정
chore/{짧은-설명}                     # 설정, 리팩토링, 문서
hotfix/{jira-ticket-id}-{짧은-설명}   # 긴급 수정

# 예시
feat/LIH-42-issue-crud-api
fix/LIH-55-sla-deadline-calculation
chore/update-spring-boot-3.4
```

### 커밋 메시지 포맷

```
{type}({scope}): {설명}

# type: feat, fix, refactor, test, docs, chore, style, perf, ci
# scope: issue, policy, automation, connector, ai, api, frontend, infra

# 예시
feat(issue): 이슈 CRUD API 구현
fix(connector): Jira 동기화 시 중복 이슈 생성 방지
refactor(persistence): IssuePersistenceAdapter toDomain 변환 로직 개선
test(issue): IssueService 단위 테스트 추가
docs(api): API 스펙 문서 업데이트
chore(infra): Docker Compose Redis 설정 추가
```

### PR 컨벤션

- PR 제목: 커밋 메시지와 동일한 포맷 사용
- PR 본문에 반드시 포함:
  - `## Summary` - 변경 사항 요약 (1~3줄)
  - `## Test plan` - 테스트 체크리스트
  - Jira 티켓 링크 (해당시)
- 리뷰어 1명 이상 승인 후 머지
- Squash merge 사용 (커밋 히스토리 정리)

### 파일 크기 제한

| 대상 | 최대 라인 수 | 초과 시 조치 |
|------|-------------|-------------|
| 컴포넌트 파일 | 300줄 | 하위 컴포넌트로 분리 |
| Service 클래스 | 200줄 | UseCase별 Service 분리 |
| Controller 클래스 | 150줄 | 라우트 그룹별 Controller 분리 |
| 테스트 파일 | 400줄 | 테스트 클래스 분리 |
| 유틸리티 파일 | 150줄 | 기능별 파일 분리 |

### Import 순서

**Kotlin (Backend)**:
```kotlin
// 1. Java/Kotlin 표준 라이브러리
import java.time.Instant
import java.util.UUID

// 2. 서드파티 라이브러리
import org.springframework.stereotype.Component
import jakarta.persistence.Entity

// 3. 프로젝트 내부 (core-domain → core-* → infra-* → app-*)
import com.issuehub.domain.model.Issue
import com.issuehub.issue.port.outbound.SaveIssuePort
```

**TypeScript (Frontend)**:
```tsx
// 1. React/Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. 서드파티 라이브러리
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// 3. @/ alias (내부 모듈)
import { Button } from '@/components/ui/button';
import { IssueForm } from '@/features/issues/components/issue-form';

// 4. 상대 경로 (같은 feature 내부)
import { columns } from './columns';
import { CATEGORY_OPTIONS } from './options';
```

### 코드 스타일 공통

- **주석**: 코드가 "왜" 그렇게 작성되었는지 설명. "무엇을"은 코드로 표현
- **매직 넘버 금지**: 상수로 추출하여 의미 부여
- **early return 패턴**: 중첩 if 대신 guard clause 사용
- **Kotlin**: `data class` 적극 활용, `var` 최소화, nullable 타입 신중 사용
- **TypeScript**: `any` 타입 금지, strict mode 유지, `interface` 우선 사용
