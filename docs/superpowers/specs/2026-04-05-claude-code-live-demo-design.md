# Claude Code 심화 기능 라이브 데모 발표 설계

> 하네스 엔지니어링 프레임워크로 Skills, Sub-Agent, Hooks, /dev-cycle을 설명하고
> 실제 Jira 티켓을 라이브로 구현하는 발표

## 목차

- [메타 정보](#메타-정보)
- [참고 자료](#참고-자료)
- [기존 인프라](#기존-인프라-claude-master-심볼릭-링크)
- [핵심 프레임워크: 하네스 엔지니어링](#핵심-프레임워크-하네스-엔지니어링)
- [발표 구조](#발표-구조)
  - [Part 1. 도입 — 하네스 엔지니어링이란 (4분)](#part-1-도입--하네스-엔지니어링이란-4분)
  - [Part 2. 기둥 1 — Skill: 컨텍스트 파일 (4분)](#part-2-기둥-1--skill-컨텍스트-파일-4분)
  - [Part 3. 기둥 2 — Hook: CI/CD 게이트 (4분)](#part-3-기둥-2--hook-cicd-게이트-4분)
  - [Part 4. 기둥 3 — SubAgent: 도구 경계 (5분)](#part-4-기둥-3--subagent-도구-경계--역할-분리-5분)
  - [Part 5. 기둥 4 — /dev-cycle: 피드백 루프 (11분)](#part-5-기둥-4--dev-cycle-피드백-루프--풀-파이프라인-라이브-11분)
  - [Part 6. 정리 (2분)](#part-6-정리-2분)
- [시간 배분 요약](#시간-배분-요약)
- [사전 준비 체크리스트](#사전-준비-체크리스트)

---

## 메타 정보

- **발표 시간**: 약 30분
- **형식**: 하네스 엔지니어링 프레임워크 + Before/After 비교 + 풀 파이프라인 라이브 데모
- **비중**: Claude Code 기능 설명 50% + 실제 개발 50%
- **라이브 데모 티켓**: LIH-69 (프로젝트 목록 UI)
- **라이브 데모 범위**: 프로젝트 목록 페이지 — 확실하게 완성
- **청중**: 개발자 + 비개발자 혼합
- **핵심 메시지**: "AI가 실수했을 때 프롬프트를 고치지 마세요. 마구(harness)를 고치세요."

## 참고 자료

- 영상: [메타 엔지니어의 클로드코드 완벽 가이드 [심화편]](https://www.youtube.com/watch?v=8H3NwQL-Aew) by 실밸개발자
- 치트시트: [Claude Code 고급 자동화 & 확장](https://raspy-roll-970.notion.site/Claude-Code-329f7725c9d98117bf53db9ad424f72d)
- 하네스 엔지니어링: [AI 에이전트를 진짜로 통제하는 기술](https://raspy-roll-970.notion.site/AI-333f7725c9d98147957afad16db3b655)
- Martin Fowler: [Harness engineering for coding agent users](https://martinfowler.com/articles/harness-engineering.html) — "Agent = Model + Harness" 정의
- 공식 문서: [Skills](https://code.claude.com/docs/ko/skills) / [Sub-Agents](https://code.claude.com/docs/ko/sub-agents) / [Hooks](https://code.claude.com/docs/ko/hooks)

## 기존 인프라 (claude-master 심볼릭 링크)

이미 구축되어 있는 것들 — 발표에서 활용:

```
.claude/ → /Users/imdoyeong/workSpaces/claude-master/
├── agents/                    # 20개 에이전트
│   ├── code-reviewer.md       # 시니어 코드 리뷰어
│   ├── debugger.md            # 디버깅 전문가
│   ├── test-generator.md      # 테스트 자동 생성
│   ├── expert-security.md     # 15년차 AppSec
│   ├── expert-frontend-architect.md  # 12년차 FE 아키텍트
│   ├── expert-ui-ux-designer.md     # 15년차 UX
│   └── ... (15개 전문가 패널)
├── skills/
│   ├── expert-panel/          # 전문가 패널 병렬 리뷰
│   ├── tdd-workflow/          # TDD 사이클
│   ├── quality-gate/          # 품질 게이트
│   └── ...
├── commands/
│   ├── dev-cycle.md           # 3단계 개발 파이프라인
│   └── jira/                  # Jira 커맨드 모음
│       ├── start.md           # 티켓 시작 + 브랜치 생성
│       ├── commit.md          # 커밋 + Jira 업데이트
│       ├── complete.md        # PR 생성 + 완료 처리
│       ├── create.md          # 티켓 생성
│       └── test.md            # 통합 테스트
└── settings.json              # Hook 설정
```

---

## 핵심 프레임워크: 하네스 엔지니어링

> **Agent = Model + Harness** (Martin Fowler)
> 하네스 = 모델을 제외한 모든 것. 특정 도구 하나가 아니라 **Guide + Sensor의 전체 시스템**.

### 하네스의 2축

| 축 | 역할 | 타이밍 |
|---|------|--------|
| **Guide (피드포워드)** | AI가 행동하기 **전에** 방향을 잡아줌 | 사전 제어 |
| **Sensor (피드백)** | AI가 행동한 **후에** 자가 수정 | 사후 교정 |

### 4기둥 — Guide와 Sensor의 구성요소

발표 전체를 관통하는 뼈대. 4기둥 전부가 하네스의 구성요소이며, 이것들을 엮은 전체가 마구(harness):

| 하네스 기둥 | 축 | Claude Code 구현 | 발표 파트 |
|------------|-----|-----------------|----------|
| **기둥 1: 컨텍스트 파일** | Guide | CLAUDE.md + Skills | Part 2 |
| **기둥 2: CI/CD 게이트** | Sensor | Hooks (100% 실행 보장) | Part 3 |
| **기둥 3: 도구 경계** | Guide + Sensor | SubAgent + Expert Panel | Part 4 |
| **기둥 4: 피드백 루프** | Sensor | /dev-cycle (계획→실행→검증→수정) | Part 5 |

```
하네스 = Guide(사전 제어) + Sensor(사후 교정)의 전체 시스템

  Guide (실행 전):  CLAUDE.md, Skill, SubAgent 역할 정의
  Sensor (실행 후): Hook, 테스트, @code-reviewer, /dev-cycle 루프
```

> "말을 아무리 잘 훈련시켜도, 마구 없이는 밭을 갈 수 없습니다."
> 마구는 부품 하나가 아닙니다. 가죽끈, 고삐, 안장을 엮은 **전체 시스템**이 마구입니다.

---

## 발표 구조

### Part 1. 도입 — 하네스 엔지니어링이란 (4분)

**목표**: 프로젝트 소개 + 하네스 프레임워크로 발표 전체 로드맵 제시

**액션**:

1. IssueHub 소개 (30초)
   - "AI 코드 분석 기반 이슈 관리 플랫폼"
   - 브라우저에서 대시보드, 이슈 목록 간단히 보여주기

2. 하네스 엔지니어링 프레임워크 소개 (2분)

   > "AI 에이전트를 거대한 짐말이라고 생각해보세요.
   > 아무리 힘이 세도 마구 없이는 밭을 갈 수 없습니다.
   > 오늘 보여드릴 것은 이 마구의 부품들입니다."

   AI 활용 4가지 축 소개:

   | 축 | 핵심 | 비유 |
   |---|------|------|
   | Prompt Engineering | AI에게 말을 잘 거는 기술 | 주문을 정확하게 하기 |
   | Context Engineering | 필요한 정보를 적절히 제공 | 재료를 잘 골라주기 |
   | **Harness Engineering** | AI가 실수할 수 없는 환경 | **말에게 마구를 씌우기** |
   | Agentic Engineering | AI 에이전트를 설계/조율 | 말을 교배하고 훈련시키기 |

   > "되돌릴 수 있으면 프롬프트로 충분합니다. 되돌릴 수 없으면 하네스가 필요합니다."
   >
   > - DB: DROP TABLE 한 번이면 복구 불가
   > - 코드 가이드라인: 아키텍처 위반이 쌓이면 기술 부채가 복리로 증가
   > - 보안: API 키 노출은 한 번이면 사고
   >
   > "프롬프트는 부탁입니다. 하네스는 강제입니다.
   > 오늘은 이 마구를 Claude Code에서 어떻게 만드는지 보여드리겠습니다."

3. 발표 로드맵 (30초)
   > "4가지 기둥을 하나씩 Before/After로 보여드리고,
   > 마지막에 실제 Jira 티켓을 이것들로 처음부터 끝까지 구현하겠습니다."

4. CLAUDE.md 간단히 보여주기 (30초)
   - "이것이 첫 번째 마구입니다. AI가 읽는 런타임 설정 파일"

---

### Part 2. 기둥 1 — Skill: 컨텍스트 파일 (4분)

**하네스 기둥**: AI에게 주는 업무 매뉴얼. 프롬프트는 한 번의 부탁, Skill은 재사용 가능한 시스템.

#### Before (1분)

Claude Code에서 직접 타이핑:

```
LIH-69 Jira 티켓 읽어서 프로젝트 목록 페이지 만들어줘.
shadcn/ui 테이블 쓰고, features/projects/에 만들고,
CLAUDE.md에 정의된 네이밍 컨벤션 따르고,
issue-listing 패턴 참고해서 만들어줘...
```

→ **"이걸 매번 치시겠습니까? 프롬프트는 한 번의 부탁입니다. Skill은 시스템입니다."**

> **💬 Before 프롬프트**:
> ```
> LIH-69 Jira 티켓 읽어서 프로젝트 목록 페이지 만들어줘. shadcn/ui 테이블 쓰고, features/projects/에 만들고, CLAUDE.md에 정의된 네이밍 컨벤션 따르고, issue-listing 패턴 참고해서 만들어줘...
> ```

#### After (3분)

1. **이미 만들어둔 것 보여주기** (1분):
   - `.claude/commands/jira/start.md` 열기 → "Jira 티켓 시작하는 Skill"
   - `.claude/commands/dev-cycle.md` 열기 → "3단계 풀 파이프라인이 파일 하나에"
   - `/jira:start LIH-69` 한 줄 vs 위의 긴 프롬프트 비교

2. **라이브로 새 Skill 만들기** (2분):
   - `.claude/skills/jira-implement/` 디렉토리 생성
   - **사전 준비한 스니펫을 붙여넣기** (30줄을 라이브 타이핑하면 2분 초과)
   - 붙여넣은 후 핵심 라인 3개만 짚어서 설명:
     - `name: jira-implement` → "이게 `/jira-implement`가 됩니다"
     - `$ARGUMENTS` → "여기에 티켓 번호가 들어갑니다"
     - `description` → "이 설명으로 AI가 자동 트리거 여부를 판단합니다"
   - "한 번 만들면 `/jira-implement LIH-69` 한 줄로 끝"

> **💬 After 프롬프트**:
> ```
> /jira-implement LIH-69
> ```

**Skill 파일 내용** (라이브에서 작성):

```yaml
---
name: jira-implement
description: "Jira 티켓 번호를 받아 이슈 상세를 읽고 구현을 시작합니다. '티켓 구현', 'Jira 이슈 작업' 요청 시 트리거."
disable-model-invocation: true
argument-hint: "[LIH-번호]"
---

## 목적
Jira 티켓의 요구사항을 읽고, CLAUDE.md 규칙에 따라 코드를 구현합니다.

## 절차
1. Jira MCP로 $ARGUMENTS 티켓 상세 조회
2. 티켓 제목과 설명에서 구현 요구사항 추출
3. `feat/$ARGUMENTS-{짧은설명}` 브랜치 생성
4. CLAUDE.md의 Frontend Rules에 따라 구현:
   - app/: 라우팅 진입점만
   - features/{기능}/components/: 비즈니스 컴포넌트
   - features/{기능}/hooks/: 커스텀 훅
5. 기존 패턴 참고 (issue-listing, dashboard 등)
6. 커밋 메시지에 Jira 티켓 번호 포함

## 자체 검증
- [ ] CLAUDE.md 네이밍 컨벤션 준수
- [ ] features/ 디렉토리 구조 올바른지
- [ ] app/ 에는 진입점만 있는지
```

---

### Part 3. 기둥 2 — Hook: CI/CD 게이트 (4분)

**하네스 기둥**: 프롬프트는 부탁이고, Hook은 물리적 차단. 100% 실행 보장.

#### Before (1분)

실제 시연으로 보여주기:

> **주의**: settings.json에 Prettier Hook이 이미 있으므로 포맷팅은 잡힘.
> Before의 포인트는 "Prettier는 있지만 ESLint는 없다" — 코드 품질 이슈는 못 잡는 것을 보여줌.

1. Claude Code에 요청:
   ```
   frontend/src/features/projects/components/hello.tsx에 간단한 컴포넌트 하나 만들어줘. any 타입 써도 되고, 미사용 import 있어도 괜찮아
   ```
2. 파일이 생성됨 — Prettier가 포맷은 잡지만 **`any` 타입, 미사용 import, 규칙 위반은 그대로**
3. 화면에 보여주며:
   → **"포맷팅은 잡혔지만, 코드 품질 문제는 여전합니다. `any` 타입, 미사용 import... ESLint 없이는 못 잡습니다."**
   → **"하네스의 두 번째 기둥은 '규칙을 시스템이 강제하는 것'입니다. Hook이 바로 그겁니다."**

> **💬 Before 프롬프트**:
> ```
> frontend/src/features/projects/components/hello.tsx에 간단한 컴포넌트 하나 만들어줘. any 타입 써도 되고 미사용 import 있어도 괜찮아
> ```

#### After (3분)

> **💬 After 프롬프트** (Hook 추가 후 같은 요청):
> ```
> hello.tsx 다시 만들어줘
> ```
> → 이번에는 자동으로 ESLint가 돌아가는 것 확인

1. **개념 설명** (30초):
   > "Hook은 이벤트가 발생하면 자동으로 셸 스크립트를 실행합니다.
   > AI가 파일을 수정하면 자동 린트, 작업이 끝나면 자동 알림.
   > 프롬프트와 달리 100% 실행이 보장됩니다."

2. **이미 있는 settings.json 보여주기** (30초):
   - `.claude/settings.json` 열기 → 현재 Hook 설정 확인

3. **라이브로 Hook 추가** (2분):
   - PostToolUse Hook — Edit/Write 후 자동 eslint
   - Notification Hook — 작업 완료 시 macOS 알림 + 소리

**Hook 설정 내용** (라이브에서 추가):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "cd frontend && npx eslint --fix --no-error-on-unmatched-pattern 'src/**/*.{ts,tsx}' 2>/dev/null || true"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "terminal-notifier -title 'Claude Code' -message '확인이 필요합니다' && afplay /System/Library/Sounds/Ping.aiff &"
          }
        ]
      }
    ]
  }
}
```

---

### Part 4. 기둥 3 — SubAgent: 도구 경계 + 역할 분리 (5분)

**하네스 기둥**: 쓰는 AI와 검토하는 AI를 분리. 같은 사람이 쓰고 검토하면 실수를 못 잡듯이, AI도 역할을 나눠야 품질이 올라감.

#### Before (1분)

실제 시연으로 보여주기:

1. Claude Code 메인 대화에서 직접 요청:
   ```
   방금 만든 hello.tsx 코드 리뷰해줘. 보안, 성능, 가독성 다 체크하고...
   ```
2. 리뷰 결과가 메인 대화에 수십 줄 쌓이는 것을 보여줌
3. 화면에 보여주며:
   → **"리뷰 결과가 메인 대화에 쌓입니다. 세션이 길어질수록 AI가 느려지는 이유 — 컨텍스트 오염입니다."**
   → **"같은 사람이 쓰고 검토하면 실수를 못 잡듯이, AI도 역할을 나눠야 합니다."**

> **💬 Before 프롬프트**:
> ```
> 방금 만든 hello.tsx 코드 리뷰해줘. 보안, 성능, 가독성 다 체크하고
> ```

#### After (4분)

> **💬 After 프롬프트**:
> ```
> @code-reviewer hello.tsx 리뷰해줘
> ```

1. **개념 설명** (30초):
   > "Sub-Agent는 독립 공간에서 일하는 전문 도우미입니다.
   > 결과는 요약만 메인으로 돌아옵니다.
   > 여러 전문가를 동시에 병렬로 띄울 수도 있습니다."

2. **이미 만든 에이전트 20개 보여주기** (1분):
   - `.claude/agents/` 디렉토리 열기 → 20개 파일 목록
   - `code-reviewer.md` 열어서 구조 설명 (name, description, tools, model + 시스템 프롬프트)
   - "코드 리뷰어, 디버거, 테스트 생성기, 그리고 15명의 전문가 패널"

3. **Expert Panel 보여주기** (1분30초):
   - `.claude/skills/expert-panel/SKILL.md` 열기
   - "주제를 입력하면 자동으로 적합한 전문가 3-5명을 선정해서 병렬 리뷰"

   ```
   /expert-panel "프로젝트 목록 페이지 리뷰"
   → 프론트엔드 아키텍트 + UX 디자이너 + 접근성 전문가가 동시에 리뷰
   → 통합 리포트: Critical / Warning / Good / Trend Insights
   ```

   - 5개 패널 구성 보여주기:

   | 패널 | 전문가 |
   |------|--------|
   | ui | UX 디자이너, 비주얼 디자이너, IA 전문가 |
   | frontend | FE 아키텍트, 성능 전문가, 접근성 전문가 |
   | backend | BE 아키텍트, 보안 전문가, DB 성능 |
   | infra | DevOps, 클라우드 아키텍트, SRE |
   | business | 전략, 마케팅, PM |

4. **기존 에이전트 실행 데모** (1분):
   - `@code-reviewer hello.tsx 리뷰해줘` 실행
   - 별도 컨텍스트에서 실행되는 것 확인 → 메인에는 요약만 돌아옴
   - "Before에서 메인 대화가 오염됐던 것과 비교해보세요"

---

### Part 5. 기둥 4 — /dev-cycle: 피드백 루프 + 풀 파이프라인 라이브 (11분)

**하네스 기둥**: 계획 → 실행 → 검증 → 수정 루프. 테스트를 통과하기 전까지 AI는 이 루프를 빠져나갈 수 없음.

> **전환 멘트**: "지금까지 Guide와 Sensor 요소들을 개별로 보여드렸습니다.
> 마지막 기둥은 이것들을 하나의 루프로 엮는 피드백 루프입니다.
> AI가 코드를 작성하면 자동으로 테스트를 돌리고, 실패하면 에러를 AI에게 다시 던져서 수정하게 합니다.
> 이걸 `/dev-cycle`이라는 3단계 파이프라인으로 만들어뒀습니다."

#### Step 1. /dev-cycle 구조 설명 (2분)

`.claude/commands/dev-cycle.md` 열어서 3단계 보여주기:

```
/dev-cycle LIH-69

1단계: 준비 + 설계
  ├── Jira 티켓 시작 (상태 "진행 중", 브랜치 생성)
  ├── AC(수락 조건) 추출
  └── 아키텍처 설계 → 사용자 확인

2단계: TDD 구현
  ├── Red: 실패하는 테스트 작성
  ├── Green: 최소 코드로 통과
  ├── Refactor: 구조 개선
  └── 레이어별 반복 → 사용자 확인

3단계: 검증 + 완료
  ├── @code-reviewer 코드 리뷰
  ├── Critical 이슈 → @debugger 자동 수정
  ├── 최종 테스트 통과 확인
  └── PR 생성 + Jira 완료 처리
```

→ **"각 단계에서 사용자 확인을 받고, 검증 실패하면 자동으로 수정 루프에 들어갑니다. 하네스의 심장부입니다."**

#### Step 2. 라이브 실행 — LIH-69 (9분)

> "시간 관계상 오늘은 프론트엔드 UI만 구현하겠습니다.
> `/dev-cycle` 대신 `/jira-implement`로 코드 생성에 집중합니다."

**2-1. Jira 티켓 확인 (1분)**
- Jira에서 LIH-69 보여주기
- 현재 `/projects` 라우트 없음 확인

**2-2. Skill 실행 — 코드 생성 (3분)**

> **💬 프롬프트**:
> ```
> /jira-implement LIH-69
> ```

- Jira MCP 티켓 조회 → 브랜치 생성 → 코드 생성
- 생성 중 설명:
  - "CLAUDE.md의 features/ 구조 자동 준수"
  - "기존 issue-listing 패턴 참고"
  - "파일명 kebab-case, 컴포넌트 PascalCase"

**2-3. Hook 동작 확인 (자동)**
- 파일 생성될 때마다 자동 린트 돌아가는 것 확인
- "아까 만든 Hook이 작동합니다"

**2-4. SubAgent 리뷰 (3분)**

코드 생성 완료 후:

> **💬 프롬프트**:
> ```
> @code-reviewer 방금 생성된 프로젝트 목록 코드를 리뷰해줘
> ```

- 별도 컨텍스트에서 실행 → 요약만 메인으로
- 시간 여유 있으면:

> **💬 보너스 프롬프트**:
> ```
> /expert-panel --panels "frontend" "프로젝트 목록 페이지"
> ```

→ FE 아키텍트 + 성능 전문가 + 접근성 전문가 3명 병렬 리뷰

**2-5. 결과 확인 (2분)**
- 브라우저에서 `/projects` 접속
- 프로젝트 목록 테이블 렌더링 확인
- Notification Hook → macOS 알림

---

### Part 6. 정리 (2분)

**하네스 = Guide + Sensor 전체 시스템**:

| 마구 부품 | 축 | Claude Code | 핵심 |
|----------|-----|-------------|------|
| 컨텍스트 파일 | Guide | **CLAUDE.md + Skill** | 실행 전에 방향을 잡아줌 |
| CI/CD 게이트 | Sensor | **Hook** | 실행 후 자동 검증 (100% 강제) |
| 도구 경계 | Guide+Sensor | **SubAgent + Expert Panel** | 쓰는 AI와 검토하는 AI를 분리 |
| 피드백 루프 | Sensor | **/dev-cycle** | 검증 실패 → 자동 수정 루프 |

**마무리 멘트**:

> "AI가 실수했을 때 프롬프트를 고치지 마세요. 마구를 고치세요.
> 그 실패가 구조적으로 반복 불가능하도록 시스템을 바꾸는 것 —
> 그게 하네스 엔지니어링이고, 오늘 보여드린 것들입니다.
>
> 인간은 조종한다(steer). 에이전트는 실행한다(execute)."

**CTA (다음 액션)** — QR코드 또는 링크 슬라이드:

| 대상 | 다음 액션 |
|------|----------|
| 개발자 | claude-master 레포 포크해서 내 프로젝트에 적용 |
| PM/비개발자 | 하네스 치트시트 읽고 팀 도입 검토 |
| 모두 | 오늘 발표 자료 + 참고 링크 |

```
오늘부터 시작하는 3단계:
1. CLAUDE.md 작성 — AI에게 프로젝트 규칙 알려주기
2. Hook 하나 추가 — 린트 자동화부터
3. SubAgent 하나 만들기 — 코드 리뷰어부터
```

---

## 시간 배분 요약

| 파트 | 내용 | 시간 |
|------|------|------|
| Part 1 | 도입 + 하네스 프레임워크 | 4분 |
| Part 2 | 기둥 1: Skill B/A | 4분 |
| Part 3 | 기둥 2: Hook B/A | 4분 |
| Part 4 | 기둥 3: SubAgent + Expert Panel B/A | 5분 |
| Part 5 | 기둥 4: /dev-cycle 설명 + 라이브 실행 | 11분 |
| Part 6 | 정리 | 2분 |
| **합계** | | **30분** |

---

## 사전 준비 체크리스트

### 환경

- [ ] `frontend/` dev 서버 실행 상태 (`npm run dev`)
- [ ] Jira LIH-69 티켓 브라우저 탭 열어두기
- [ ] Claude Code 세션 깨끗한 상태에서 시작
- [ ] Atlassian MCP 연결 확인
- [ ] terminal-notifier 설치 확인 (`brew install terminal-notifier`)
- [ ] 에디터 폰트 크기 발표용으로 키우기
- [ ] claude-master 심볼릭 링크 정상 확인
- [ ] `demo/LIH-69-fallback` 폴백 브랜치 사전 생성 완료 확인
- [ ] `scripts/demo-reset.sh` 실행하여 깨끗한 상태 확인
- [ ] `useIssueDetail.ts` → `use-issue-detail.ts` rename 완료 확인

### 라이브에서 만들 파일

1. `.claude/skills/jira-implement/SKILL.md` — Part 2에서 생성
2. `.claude/settings.json` Hook 추가 — Part 3에서 수정
3. SubAgent 1개 — Part 4에서 `/agents`로 생성

### 보여줄 기존 파일 (열어두기)

1. `CLAUDE.md` — Part 1에서 보여주기
2. `.claude/commands/dev-cycle.md` — Part 5에서 구조 설명
3. `.claude/commands/jira/start.md` — Part 2에서 Skill 예시
4. `.claude/agents/code-reviewer.md` — Part 4에서 구조 설명
5. `.claude/skills/expert-panel/SKILL.md` — Part 4에서 병렬 리뷰 설명

### 라이브 데모 폴백 — 미리 생성된 결과 준비

라이브 코드 생성이 **4분 초과** 시, 미리 준비된 브랜치로 즉시 전환:

```bash
# 발표 전: 폴백 브랜치 미리 준비
git checkout -b demo/LIH-69-fallback
# (사전에 프로젝트 목록 페이지를 완성해두고 커밋)
git checkout main

# 라이브 중 4분 초과 시:
git checkout demo/LIH-69-fallback
# "시간 관계상 미리 준비한 결과를 보여드리겠습니다"
```

### 발표 전 리셋 스크립트

발표 직전 또는 예행 연습 후 깨끗한 상태로 복구:

```bash
#!/bin/bash
# scripts/demo-reset.sh
git checkout main
git branch -D feat/LIH-69-* 2>/dev/null
rm -rf frontend/src/features/projects/ 2>/dev/null
rm -f frontend/src/app/\(dashboard\)/projects/page.tsx 2>/dev/null
echo "✅ 데모 상태 리셋 완료"
```

### 훅 네이밍 불일치 사전 정리

발표 전 반드시 확인:
- `features/issues/hooks/useIssueDetail.ts` → `use-issue-detail.ts`로 rename
- 또는 CLAUDE.md 훅 네이밍 규칙을 kebab-case로 명시 통일
- Claude가 혼동하지 않도록 일관성 확보

### 리스크 대응

| 리스크 | 대응 |
|--------|------|
| Skill 파일 작성 중 오타 | 이 문서의 내용을 참고하며 작성 |
| 코드 생성이 오래 걸림 (>4분) | **4분 초과 시 폴백 브랜치(`demo/LIH-69-fallback`)로 즉시 전환** |
| 생성된 코드에 에러 | "이게 바로 피드백 루프가 필요한 이유" → 하네스 기둥 4 연결 |
| Hook이 동작 안 함 | settings.json 오타 확인. "라이브의 묘미" |
| Expert Panel 시간 초과 | @code-reviewer 한 명만 실행하고 넘어감 |
| 시간 초과 (28분 넘어감) | Part 5의 SubAgent 리뷰를 생략하고 바로 브라우저 확인 |
| MCP 연결 끊김 | 아래 LIH-69 요약을 읽어주고 진행 |

### MCP 장애 시 LIH-69 티켓 내용 (오프라인 폴백)

```
티켓: LIH-69
제목: 프로젝트 목록/생성/설정 UI + API 연동
부모: LIH-36 (P2-2. 프로젝트 CRUD)
상태: 해야 할 일
우선순위: Medium

핵심 요구사항:
- /projects 라우트에 프로젝트 목록 페이지 생성
- DataTable + 필터 툴바 (기존 issue-listing 패턴 참고)
- features/projects/ 디렉토리 구조 생성
- Mock 데이터 활용 (constants/mock-data.ts의 MOCK_PROJECTS)
```
