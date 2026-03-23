# IssueHub 프론트엔드 아키텍처 명세서

> 문서 버전: 1.0
> 작성일: 2026-03-23
> 기술 스택: Next.js 16 + React 19 + shadcn/ui + Tailwind CSS v4 + TypeScript

---

## 1. 라우트 구조

```
app/
├── (auth)/                    # 인증 (사이드바 없는 레이아웃)
│   ├── login/page.tsx
│   └── layout.tsx
├── (dashboard)/               # 대시보드 영역 (AppShell 레이아웃)
│   ├── page.tsx               # / → 대시보드 홈
│   ├── issues/
│   │   ├── page.tsx           # /issues → 이슈 목록
│   │   └── [id]/page.tsx      # /issues/:id → 이슈 상세 + AI 분석
│   ├── projects/
│   │   ├── page.tsx           # /projects → 프로젝트 목록
│   │   └── [id]/
│   │       └── settings/page.tsx  # /projects/:id/settings
│   ├── automation/page.tsx    # /automation → 자동화 규칙
│   ├── connectors/page.tsx    # /connectors → 외부 연동
│   ├── policies/
│   │   ├── page.tsx           # /policies → 정책 목록
│   │   └── [id]/page.tsx      # /policies/:id → 정책 상세
│   ├── analytics/page.tsx     # /analytics → 분석 대시보드
│   └── settings/page.tsx      # /settings → 설정
└── layout.tsx                 # Root (providers, fonts)
```

### 라우트별 상세

| 라우트 | 컴포넌트 타입 | 데이터 | 레이아웃 |
|--------|-------------|--------|---------|
| `/` | Server → Client 위임 | 이슈 통계, 최근 이슈, 팀 워크로드 | AppShell |
| `/issues` | Server → Client 위임 | 이슈 목록 (필터, 페이지네이션) | AppShell |
| `/issues/[id]` | Server → Client 위임 | 이슈 상세 + AI 분석 결과 + 댓글 | AppShell |
| `/projects` | Server → Client 위임 | 프로젝트 목록 + 동기화 상태 | AppShell |
| `/projects/[id]/settings` | Client | 프로젝트 설정 (LLM, 에이전트 선택) | AppShell |
| `/automation` | Client | 자동화 규칙 CRUD | AppShell |
| `/login` | Client | - | Auth (사이드바 없음) |

---

## 2. 디렉토리 구조

```
frontend/src/
├── app/                       # 라우팅 진입점만 (비즈니스 로직 금지)
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── layout.tsx
│   └── globals.css
│
├── features/                  # 기능별 모듈 (핵심)
│   ├── dashboard/
│   │   └── components/
│   │       ├── summary-cards.tsx
│   │       ├── recent-issues.tsx
│   │       ├── team-workload.tsx
│   │       ├── trend-chart.tsx
│   │       └── sla-status.tsx
│   ├── issues/
│   │   ├── components/
│   │   │   ├── issue-listing.tsx
│   │   │   ├── issue-detail.tsx
│   │   │   ├── issue-form.tsx
│   │   │   ├── ai-analysis-panel.tsx
│   │   │   └── issue-tables/
│   │   │       ├── columns.tsx
│   │   │       ├── cell-action.tsx
│   │   │       └── index.tsx
│   │   ├── hooks/
│   │   │   └── use-issues.ts
│   │   └── utils/
│   │       └── form-schema.ts
│   ├── projects/
│   │   └── components/
│   │       ├── project-listing.tsx
│   │       ├── project-card.tsx
│   │       └── project-settings.tsx
│   ├── automation/
│   │   └── components/
│   │       ├── rule-listing.tsx
│   │       ├── rule-form.tsx
│   │       └── rule-card.tsx
│   ├── connectors/
│   ├── policies/
│   ├── analytics/
│   └── settings/
│
├── components/
│   ├── ui/                    # shadcn/ui (수정 금지)
│   ├── layout/                # 앱 레이아웃
│   │   ├── app-shell.tsx
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── page-container.tsx
│   ├── common/                # 크로스-feature 컴포넌트
│   │   ├── status-badge.tsx
│   │   ├── priority-badge.tsx
│   │   └── platform-icon.tsx
│   └── forms/
│       └── form-input.tsx
│
├── hooks/                     # 공용 훅
│   ├── use-data-table.ts
│   └── use-sse.ts
│
├── lib/                       # 유틸리티
│   ├── api.ts
│   ├── utils.ts
│   └── parsers.ts
│
├── config/                    # 앱 설정
│   └── nav-config.ts
│
├── constants/                 # 상수 + Mock 데이터
│   └── mock-data.ts
│
└── types/                     # 공용 타입
    ├── api.ts
    ├── issue.ts
    └── user.ts
```

---

## 3. 컴포넌트 트리

### 대시보드 (/)
```
app/(dashboard)/page.tsx
└── DashboardPage (features/dashboard/)
    ├── SummaryCards          # 열림/진행중/해결됨/SLA위반 카운트
    ├── div.grid (2열)
    │   ├── RecentIssues      # 최근 이슈 목록 (소스 배지, 우선순위)
    │   └── TeamWorkload      # 팀원별 워크로드 바 차트
    ├── div.grid (2열)
    │   ├── TrendChart        # 이슈 트렌드 (Recharts)
    │   └── SlaStatus         # SLA 준수율 프로그레스바
    └── ProjectOverview       # 프로젝트별 이슈 분포 (선택적)
```

### 이슈 목록 (/issues)
```
app/(dashboard)/issues/page.tsx
└── IssueListing (features/issues/)
    ├── PageContainer (heading + breadcrumb)
    ├── Toolbar (필터, 검색, 소스 필터, 프로젝트 필터)
    └── IssueTable
        ├── columns.tsx (우선순위, 제목, 소스, 담당자, SLA, 상태)
        ├── cell-action.tsx (편집, 상태변경, 자동개발)
        └── DataTablePagination
```

### 이슈 상세 (/issues/[id])
```
app/(dashboard)/issues/[id]/page.tsx
└── IssueDetail (features/issues/)
    ├── IssueHeader (제목, 우선순위, 상태, 소스 배지)
    ├── Tabs
    │   ├── [상세] IssueDescription
    │   ├── [AI 분석] AiAnalysisPanel     ← 핵심 차별점
    │   │   ├── AffectedFiles            # 영향 파일 목록
    │   │   ├── RecentChanges            # 최근 변경 이력
    │   │   ├── SimilarIssues            # 유사 과거 이슈
    │   │   └── FixSuggestion            # 수정 제안
    │   ├── [코드] CodeContext
    │   ├── [히스토리] IssueTimeline
    │   └── [댓글] CommentList
    ├── AutoDevButton ("자동 개발 시작")
    └── AutoDevHistory (PR 연결 이력)
```

### 프로젝트 목록 (/projects)
```
app/(dashboard)/projects/page.tsx
└── ProjectListing (features/projects/)
    ├── PageContainer
    └── ProjectGrid
        └── ProjectCard (이름, Git URL, 모드, LLM, 동기화 상태, 이슈 수)
```

---

## 4. 공유 컴포넌트

### components/common/

| 컴포넌트 | 용도 | Props |
|----------|------|-------|
| `status-badge.tsx` | 이슈 상태 배지 (OPEN, IN_PROGRESS 등) | `status: IssueStatus` |
| `priority-badge.tsx` | 우선순위 배지 (CRITICAL~NONE) | `priority: IssuePriority` |
| `platform-icon.tsx` | 소스 플랫폼 아이콘+라벨 (Jira, GitHub 등) | `platform: Platform` |
| `sla-indicator.tsx` | SLA 잔여시간/위반 표시 | `deadline?: string, breach: boolean` |
| `sync-status.tsx` | 동기화 상태 (synced/syncing/error) | `status: SyncStatus` |

### components/layout/

| 컴포넌트 | 용도 |
|----------|------|
| `app-shell.tsx` | 사이드바 + 헤더 + 메인 컨텐츠 조합 |
| `header.tsx` | 상단 바 (검색, 알림, 프로필) |
| `sidebar.tsx` | 네비게이션 사이드바 (프로젝트 목록 포함) |
| `page-container.tsx` | 페이지 래퍼 (breadcrumb + heading + children) |

---

## 5. 상태 관리

| 상태 유형 | 도구 | 예시 |
|-----------|------|------|
| **URL 상태** | nuqs | 이슈 필터(소스, 상태, 우선순위), 페이지네이션, 검색어, 탭 |
| **서버 상태** | SWR (Phase 1) → TanStack Query (Phase 2+) | 이슈 목록, 대시보드 통계, 프로젝트 목록 |
| **UI 전역 상태** | Zustand (최소) | 사이드바 열림/닫힘, 선택된 프로젝트 |
| **폼 상태** | react-hook-form + zod | 이슈 생성/수정, 프로젝트 설정, 자동화 규칙 |

---

## 6. Mock → API 전환 전략

```
Phase 1 (목업):
  constants/mock-data.ts → 컴포넌트에서 직접 import

Phase 2 (API 연동):
  features/{feature}/hooks/use-{feature}.ts → SWR로 API fetch
  constants/mock-data.ts → 삭제
```

패턴:
```tsx
// Phase 1: Mock
import { MOCK_ISSUES } from '@/constants/mock-data';
export function useIssues() {
  return { data: MOCK_ISSUES, isLoading: false };
}

// Phase 2: API
export function useIssues(filters: IssueFilters) {
  return useSWR(['/api/v1/issues', filters], fetcher);
}
```

컴포넌트는 훅만 바라보므로, 훅 내부만 교체하면 전환 완료.

---

## 7. 네이밍 규칙 요약

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일 (컴포넌트) | kebab-case | `issue-form.tsx` |
| 파일 (훅) | camelCase, use 접두사 | `useIssues.ts` |
| export (컴포넌트) | PascalCase | `export function IssueForm()` |
| 디렉토리 | kebab-case | `issue-tables/` |
| 상수 | UPPER_SNAKE_CASE | `MOCK_ISSUES` |
| 타입 | PascalCase | `interface Issue` |
