# IssueHub MVP 화면 설계서

> Stitch 프로토타입 기반 (Google Stitch, "Forge Logic" 디자인 시스템)
> 참조: [Stitch 프로젝트](https://stitch.withgoogle.com/projects/12991689494621040728)

---

## 1. 디자인 시스템

### 컬러 팔레트

| 역할 | 컬러 | 용도 |
|------|------|------|
| Primary | `#3B82F6` (Blue) | 버튼, 활성 상태, 링크, 강조 |
| Secondary | `#6177A5` | 보조 텍스트, 비활성 상태 |
| Tertiary | `#D16900` (Orange) | 경고, 주의 상태 |
| Neutral / Sidebar | `#1E293B` (Dark) | 사이드바 배경, 헤더 |
| Background | `#FFFFFF` | 콘텐츠 영역 배경 |
| Surface | `#F8FAFC` | 카드, 테이블 배경 |
| Error | `#EF4444` | 에러, Critical 뱃지 |
| Success | `#22C55E` | 성공, Completed 뱃지 |

### 타이포그래피

| 용도 | 폰트 | 크기 |
|------|------|------|
| Headline | Manrope (Bold) | 24-32px |
| Subtitle | Manrope (SemiBold) | 18-20px |
| Body | Inter (Regular) | 14-16px |
| Label | Inter (Medium) | 12-13px |
| Caption | Inter (Regular) | 11-12px |

### 공통 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| PriorityBadge | `HIGH` (빨강), `MEDIUM` (주황), `LOW` (초록) |
| StatusBadge | `Open` (파랑), `In Progress` (노랑), `Triaged` (보라), `Completed` (초록) |
| SourceBadge | `Jira`, `GitHub`, `Notion`, `GitLab` — 아이콘 + 텍스트 |
| ConfidenceScore | 원형 프로그레스바 + 퍼센트 수치 |
| ActionButton | Primary (파랑 배경), Secondary (아웃라인), Destructive (빨강) |

---

## 2. 레이아웃 구조

### AppShell (전체 레이아웃)

```
┌────────────────────────────────────────────────────┐
│ [Sidebar 220px]  │  [Header 64px]                  │
│                  │──────────────────────────────────│
│  IssueHub 로고    │  [Search]     [알림] [AI] [프로필]│
│  ─────────────   │──────────────────────────────────│
│  Dashboard       │                                  │
│  Issues          │  [Content Area]                  │
│  Policies        │                                  │
│  Approvals       │  페이지별 콘텐츠                   │
│  Integrations    │                                  │
│  Monitoring      │                                  │
│  Settings        │                                  │
│                  │                                  │
└────────────────────────────────────────────────────┘
```

- **사이드바**: 고정 220px, 다크 배경(`#1E293B`), 활성 메뉴 블루 하이라이트
- **헤더**: 글로벌 검색, 알림, AI Insights 버튼, 프로필
- **콘텐츠**: 흰색 배경, 좌우 패딩 24px

---

## 3. 화면별 설계

### 3-1. 대시보드 (Dashboard Overview)

**경로**: `/`

```
┌─────────────────────────────────────────────────────┐
│  Enterprise Intelligence                             │
│  Global project health and issue synchronization     │
│                          [Export Report] [Create New] │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ TOTAL    │  │ IN-PROG  │  │ COMPLETED│          │
│  │ 2,540    │  │ 48       │  │ 2,492    │          │
│  │ +12% ↑   │  │ Active   │  │ 98.1%    │          │
│  └──────────┘  └──────────┘  └──────────┘          │
├──────────────────────────────┬──────────────────────┤
│  Recent High-Priority Issues │ POLICY ACCURACY TREND│
│  ────────────────────────── │                      │
│  Issue Title | Priority |   │     96.4%            │
│              | Status   |   │     (원형 차트)       │
│              | AI Anal. |   │                      │
│  ─────────────────────────  │ ARCHITECTURAL INSIGHT│
│  Cloud Latency Spike...     │ "Recent latency..."  │
│  API Gateway Auth Fail...   │ [Apply] [Ignore]     │
│  Data Loss - Internal...    │                      │
└──────────────────────────────┴──────────────────────┘
```

**구성 요소:**
- 통계 카드 3개 (Total Issues, In-Progress, Completed) — 증감 트렌드 포함
- 최근 이슈 테이블 (Priority, Status, AI Analysis 상태 컬럼)
- Policy Accuracy Trend 차트 (원형, 퍼센트 표시)
- Architectural Insight 패널 (AI 인사이트 요약 + 액션 버튼)

**데이터 소스:** 이슈 집계 API + 정책 매칭 통계 API

---

### 3-2. 이슈 목록 (Issue Listing)

**경로**: `/issues`

```
┌─────────────────────────────────────────────────────┐
│  Issues                          [Filter] [+ New]    │
├─────────────────────────────────────────────────────┤
│  [검색] [Priority ▼] [Status ▼] [Source ▼] [AI ▼]   │
├─────────────────────────────────────────────────────┤
│  Title          │ Priority│ Status  │ Source │ AI    │
│  ───────────────┼─────────┼─────────┼────────┼────  │
│  Login 500 err  │ HIGH    │ Open    │ Jira   │ 92%  │
│  API timeout    │ MEDIUM  │ Triaged │ GitHub │ 85%  │
│  Data sync fail │ HIGH    │ In Prog │ Notion │ 진행중│
│  ...            │         │         │        │      │
├─────────────────────────────────────────────────────┤
│  < 1 2 3 ... 15 >                      20건/페이지   │
└─────────────────────────────────────────────────────┘
```

**구성 요소:**
- 검색바 + 필터 (Priority, Status, Source, AI 분석 상태)
- Tanstack Table 기반 데이터 테이블
- URL 기반 페이지네이션/필터링 (`nuqs`)
- AI 분석 상태 컬럼: 신뢰도 퍼센트 or "분석중" / "대기" / "실패"

**파일 구조:**
```
features/issues/
├── components/
│   ├── issue-listing.tsx          # 페이지 컴포넌트
│   └── issue-tables/
│       ├── columns.tsx            # 컬럼 정의
│       ├── cell-action.tsx        # 행 액션
│       ├── options.tsx            # 필터 옵션
│       └── index.tsx              # 테이블 조합
```

---

### 3-3. 이슈 상세 + AI 분석 (Issue Detail)

**경로**: `/issues/[id]`

```
┌─────────────────────────────────────────────────────┐
│  Issues > ISSUE-4829                                 │
├────────────────────────────┬────────────────────────┤
│  [HIGH PRIORITY] [IN PROG] │  ✨ Precision Analysis │
│  📋 Source: Jira            │     [LIVE INSIGHT]     │
│                            │                        │
│  Optimize Database Query   │  MATCHED POLICY        │
│  for User Logs             │  ✅ Performance Opt v2.1│
│                            │  Infrastructure Stds    │
│  DESCRIPTION               │                        │
│  The current query...      │  CONFIDENCE SCORE      │
│  (이슈 설명 전문)           │     94% (원형 게이지)   │
│                            │                        │
│  Assignee: Sarah Jenkins   │  SUGGESTED SOLUTION    │
│  Created: Oct 24, 2023     │  Implement a composite │
│  Component: Backend/Audit  │  index on user_id...   │
│                            │                        │
│  ┌─────────┐┌────────────┐│  [<> Start Code Gen]   │
│  │Affected ││Performance ││                        │
│  │Query    ││Impact      ││  LINKED RESOURCES      │
│  │SELECT * ││Avg: 4.2s   ││  📄 DB Migration Guide │
│  │FROM...  ││320% exceed ││  🔗 Grafana Dashboard  │
│  └─────────┘└────────────┘│                        │
└────────────────────────────┴────────────────────────┘
```

**2컬럼 레이아웃:**
- **좌측 (60%)**: 이슈 정보
  - 뱃지 영역 (Priority, Status, Source)
  - 제목 + 설명
  - 메타 정보 (Assignee, Created, Component)
  - 코드 블록 (Affected Query) + 성능 임팩트 카드
- **우측 (40%)**: AI 분석 패널 (고정 사이드바)
  - "Precision Analysis" 헤더 + Live Insight 뱃지
  - Matched Policy (정책명 + 카테고리)
  - Confidence Score (원형 프로그레스 + 퍼센트)
  - Suggested Solution (코드 인라인 포함)
  - "Start Code Generation" CTA 버튼
  - Linked Resources 목록

**정책 매칭 실패 시:**
- Confidence Score 영역에 "정책 없음" 경고 표시
- "정책 추가 제안" 버튼 노출
- Suggested Solution은 "LLM 일반 지식 기반" 라벨 표시

**파일 구조:**
```
features/issues/
├── components/
│   ├── issue-detail.tsx           # 상세 페이지 컴포넌트
│   ├── issue-info-panel.tsx       # 좌측 이슈 정보
│   ├── ai-analysis-panel.tsx      # 우측 AI 분석 패널
│   ├── confidence-gauge.tsx       # 신뢰도 원형 게이지
│   └── code-block.tsx             # 코드 블록 컴포넌트
```

---

### 3-4. 정책 관리 (Policy Management)

**경로**: `/policies`

```
┌─────────────────────────────────────────────────────┐
│  Policy Management              [+ Create Policy]    │
├─────────────────────────────────────────────────────┤
│  [검색] [Category ▼] [Status ▼]                      │
├─────────────────────────────────────────────────────┤
│  Policy Name       │ Category    │ Status │ Matches │
│  ──────────────────┼─────────────┼────────┼──────── │
│  Performance Opt   │ Infra       │ Active │ 142     │
│  Security Standard │ Security    │ Active │ 89      │
│  Data Retention    │ Compliance  │ Draft  │ 0       │
│  Redis HA Policy   │ Infra       │ Active │ 56      │
├─────────────────────────────────────────────────────┤
│  < 1 2 3 >                                           │
└─────────────────────────────────────────────────────┘
```

**정책 생성/편집 모달:**
```
┌─────────────────────────────────────┐
│  Create New Policy            [X]   │
├─────────────────────────────────────┤
│  Policy Name: [____________]        │
│  Category:    [Select ▼     ]       │
│  Description:                       │
│  [                              ]   │
│  [    정책 내용 텍스트 에디터     ]   │
│  [                              ]   │
│                                     │
│  ℹ️ 저장 시 자동으로 벡터 임베딩     │
│     생성 + pgvector 저장             │
│                                     │
│         [Cancel] [Save Policy]      │
└─────────────────────────────────────┘
```

**정책 역등록 제안 탭:**
```
┌─────────────────────────────────────────────────────┐
│  [Active Policies] [Pending Suggestions (3)]         │
├─────────────────────────────────────────────────────┤
│  🤖 AI가 제안하는 신규 정책                           │
│                                                      │
│  "Redis 연결 실패 대응 정책"                          │
│  근거: ISSUE-4830 수동 처리 기반                      │
│  [AI 초안 보기] [승인 → 정책 등록] [거절]              │
└─────────────────────────────────────────────────────┘
```

**파일 구조:**
```
features/policies/
├── components/
│   ├── policy-listing.tsx         # 목록 페이지
│   ├── policy-form.tsx            # 생성/편집 폼
│   ├── policy-suggestion.tsx      # 역등록 제안 카드
│   └── policy-tables/
│       ├── columns.tsx
│       ├── cell-action.tsx
│       └── index.tsx
```

---

### 3-5. 승인 워크플로우 (Approval Workflow)

**경로**: `/approvals`

```
┌─────────────────────────────────────────────────────┐
│  Approval Workflow                [All] [Pending]    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ PR #127: Optimize user_logs query index      │    │
│  │ ISSUE-4829 · OpenHands · 15분 전 생성         │    │
│  │                                              │    │
│  │ 🤖 AI Review Summary                         │    │
│  │ "Adds composite index on (user_id, timestamp)│    │
│  │  Estimated performance improvement: 320%     │    │
│  │  Policy compliance: Performance Opt v2.1 ✅" │    │
│  │                                              │    │
│  │ Changed Files: 3  │ +42 / -8 lines           │    │
│  │                                              │    │
│  │ [View PR on GitHub]                          │    │
│  │                                              │    │
│  │ Feedback (optional):                         │    │
│  │ [_______________________________________]    │    │
│  │                                              │    │
│  │         [❌ Reject]        [✅ Approve]       │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ PR #126: Fix Redis connection pool settings   │    │
│  │ ...                                          │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**거절 시 피드백 플로우:**
```
[Reject 클릭] → 거절 사유 선택 모달:
  ○ 코드 수정 필요 → 피드백 입력 → 코드 재생성
  ○ 정책 수정 필요 → 정책 편집 페이지로 이동 → 재분석
```

**파일 구조:**
```
features/approvals/
├── components/
│   ├── approval-listing.tsx       # 목록 페이지
│   ├── approval-card.tsx          # PR 승인 카드
│   ├── ai-review-summary.tsx      # AI 리뷰 요약
│   └── reject-feedback-modal.tsx  # 거절 피드백 모달
```

---

### 3-6. 연동 설정 (Integrations)

**경로**: `/integrations`

```
┌─────────────────────────────────────────────────────┐
│  Integrations                                        │
├──────────────────────────┬──────────────────────────┤
│  이슈 소스                │  알림 채널               │
│  ────────────────────    │  ────────────────────    │
│  ┌────┐ Jira      [✅]  │  ┌────┐ Slack     [✅]  │
│  └────┘ Connected       │  └────┘ #alerts-*       │
│                          │                          │
│  ┌────┐ Notion    [설정] │  ┌────┐ Teams     [설정] │
│  └────┘ Not connected   │  └────┘ Not connected   │
│                          │                          │
│  ┌────┐ GitHub    [설정] │  ┌────┐ Email     [설정] │
│  └────┘ Not connected   │  └────┘ Not connected   │
│                          │                          │
│  ┌────┐ GitLab    [설정] │                          │
│  └────┘ Not connected   │                          │
├──────────────────────────┴──────────────────────────┤
│  코드 생성 엔진                                      │
│  ────────────────────                                │
│  ○ OpenHands (권장)     ● LLM 직접 호출              │
│  [OpenHands 상태: Running ✅]  [테스트 연결]          │
└─────────────────────────────────────────────────────┘
```

**파일 구조:**
```
features/integrations/
├── components/
│   ├── integration-listing.tsx    # 연동 설정 페이지
│   ├── source-card.tsx            # 이슈 소스 카드
│   ├── channel-card.tsx           # 알림 채널 카드
│   └── engine-selector.tsx        # 코드 생성 엔진 선택
```

---

### 3-7. 모니터링 (Monitoring)

**경로**: `/monitoring`

```
┌─────────────────────────────────────────────────────┐
│  Monitoring                    [Time: Last 24h ▼]    │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │ API p99  │ │ Error    │ │ Pipeline │ │ LLM    ││
│  │ 1.2s     │ │ 0.3%    │ │ 12 active│ │ 2.1s   ││
│  │ < 2s ✅  │ │ < 1% ✅  │ │          │ │ avg    ││
│  └──────────┘ └──────────┘ └──────────┘ └────────┘│
├─────────────────────────────────────────────────────┤
│  [Grafana 대시보드 임베드 iframe]                     │
│                                                      │
│  또는 자체 차트:                                      │
│  - 파이프라인 처리량 (이슈→분석→코드생성→PR)           │
│  - 정책 매칭 정확도 추이                              │
│  - LLM 호출 시간/비용                                │
│  - Kafka consumer lag                                │
├─────────────────────────────────────────────────────┤
│  Recent Alerts                                       │
│  🔴 [Critical] Kafka consumer lag > 1000 (2분 전)    │
│  🟡 [Warning] LLM response time > 5s (15분 전)      │
└─────────────────────────────────────────────────────┘
```

**파일 구조:**
```
features/monitoring/
├── components/
│   ├── monitoring-dashboard.tsx   # 모니터링 페이지
│   ├── metric-card.tsx            # SLO 메트릭 카드
│   ├── grafana-embed.tsx          # Grafana iframe 임베드
│   └── alert-list.tsx             # 최근 알림 목록
```

---

### 3-8. 온보딩 (Onboarding Wizard)

**경로**: `/onboarding` (첫 사용 시 자동 리다이렉트)

```
Step 1/6: 이슈 소스 선택
┌─────────────────────────────────────────────────────┐
│         어떤 이슈 트래커를 사용하고 계신가요?           │
│                                                      │
│    ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  │
│    │  Jira  │  │ Notion │  │ GitHub │  │ GitLab │  │
│    │   ✅   │  │        │  │        │  │        │  │
│    └────────┘  └────────┘  └────────┘  └────────┘  │
│                                                      │
│                              [Skip] [Next →]         │
└─────────────────────────────────────────────────────┘

Step 2/6: 연동 설정 (OAuth/API Key)
Step 3/6: 첫 정책 등록 (샘플 템플릿 제공)
Step 4/6: 테스트 이슈 생성 → AI 분석 결과 확인
Step 5/6: 코드 생성 엔진 선택 (OpenHands / LLM)
Step 6/6: 알림 채널 연결 (Slack/Teams/Email)
```

**파일 구조:**
```
features/onboarding/
├── components/
│   ├── onboarding-wizard.tsx      # 위자드 컨테이너
│   ├── step-source-select.tsx     # Step 1
│   ├── step-connection.tsx        # Step 2
│   ├── step-first-policy.tsx      # Step 3
│   ├── step-test-issue.tsx        # Step 4
│   ├── step-engine-select.tsx     # Step 5
│   └── step-notification.tsx      # Step 6
```

---

### 3-9. 설정 (Settings)

**경로**: `/settings`

- 일반 설정 (프로젝트명, 타임존)
- LLM 설정 (Ollama URL, Claude API Key, 모델 선택)
- 코드 생성 설정 (OpenHands URL, 타임아웃)
- 알림 설정 (Slack webhook, 이메일)
- 사용자 관리 (MVP에서는 기본만)

---

## 4. 라우팅 구조

```
app/(auth)/
├── login/page.tsx

app/(dashboard)/
├── page.tsx                    # / → Dashboard
├── issues/
│   ├── page.tsx                # /issues → 이슈 목록
│   └── [id]/page.tsx           # /issues/:id → 이슈 상세
├── policies/
│   ├── page.tsx                # /policies → 정책 관리
│   └── [id]/page.tsx           # /policies/:id → 정책 상세
├── approvals/
│   └── page.tsx                # /approvals → 승인 워크플로우
├── integrations/
│   └── page.tsx                # /integrations → 연동 설정
├── monitoring/
│   └── page.tsx                # /monitoring → 모니터링
├── settings/
│   └── page.tsx                # /settings → 설정
├── onboarding/
│   └── page.tsx                # /onboarding → 온보딩 위자드
└── layout.tsx                  # AppShell (사이드바 + 헤더)
```

---

## 5. 반응형 전략

| 브레이크포인트 | 동작 |
|--------------|------|
| Desktop (1280px+) | 사이드바 고정 + 2컬럼 레이아웃 |
| Tablet (768-1279px) | 사이드바 접이식 (아이콘만) + 1컬럼 |
| Mobile (< 768px) | 사이드바 숨김 (햄버거 메뉴) + 스택 레이아웃 |

---

## 6. 참조

- Stitch 프로토타입: https://stitch.withgoogle.com/projects/12991689494621040728
- 참조 프로젝트: [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)
- 디자인 시스템: shadcn/ui + Tailwind CSS (Stitch "Forge Logic" 컬러 적용)
