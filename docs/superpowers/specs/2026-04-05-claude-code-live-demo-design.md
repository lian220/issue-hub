# Claude Code 심화 기능 라이브 데모 발표 설계

> 하네스 엔지니어링의 3단계 점층(프롬프트 → CLAUDE.md → 하네스)을 보여주고
> 실제 Jira 티켓을 풀 하네스로 라이브 구현하는 발표

## 목차

- [메타 정보](#메타-정보)
- [참고 자료](#참고-자료)
- [기존 인프라](#기존-인프라)
- [핵심 프레임워크](#핵심-프레임워크-하네스-엔지니어링)
- [발표 구조](#발표-구조)
  - [Part 1. 도입 (4분)](#part-1-도입--하네스-엔지니어링이란-4분)
  - [Part 2. CLAUDE.md + Skill (5분)](#part-2-claudemd--skill--guide-사전-제어-5분)
  - [Part 3. Hook (4분)](#part-3-hook--sensor-자동-검증-4분)
  - [Part 4. SubAgent (4분)](#part-4-subagent--역할-분리-4분)
  - [Part 5. 풀 하네스 라이브 (10분)](#part-5-풀-하네스-라이브--lih-69-구현-10분)
  - [Part 6. 정리 (2분)](#part-6-정리-2분)
- [시간 배분 요약](#시간-배분-요약)
- [사전 준비 체크리스트](#사전-준비-체크리스트)

---

## 메타 정보

- **발표 시간**: 약 29분 (+ 1분 버퍼)
- **형식**: 3단계 점층 + Before/After 비교 + 풀 하네스 라이브 데모
- **비중**: Claude Code 기능 설명 50% + 실제 개발 50%
- **라이브 데모 티켓**: LIH-69 (프로젝트 목록 UI)
- **라이브 데모 범위**: 프로젝트 목록 페이지 — 확실하게 완성
- **청중**: 개발자 + 비개발자 혼합
- **핵심 메시지**: "AI가 실수했을 때 프롬프트를 고치지 마세요. 마구(harness)를 고치세요."

## 참고 자료

- Martin Fowler: [Harness engineering for coding agent users](https://martinfowler.com/articles/harness-engineering.html) — "Agent = Model + Harness"
- 하네스 엔지니어링: [AI 에이전트를 진짜로 통제하는 기술](https://raspy-roll-970.notion.site/AI-333f7725c9d98147957afad16db3b655)
- 영상: [메타 엔지니어의 클로드코드 완벽 가이드 [심화편]](https://www.youtube.com/watch?v=8H3NwQL-Aew)
- 치트시트: [Claude Code 고급 자동화 & 확장](https://raspy-roll-970.notion.site/Claude-Code-329f7725c9d98117bf53db9ad424f72d)
- 공식 문서: [Skills](https://code.claude.com/docs/ko/skills) / [Sub-Agents](https://code.claude.com/docs/ko/sub-agents) / [Hooks](https://code.claude.com/docs/ko/hooks)
- AI 규칙 위반: [AI Agent Forgets Its Rules Every 45 Minutes](https://dev.to/douglasrw/your-ai-agent-forgets-its-rules-every-45-minutes-heres-the-fix-151e)

## 기존 인프라

`.claude/` → claude-master 심볼릭 링크로 이미 구축됨:

| 카테고리 | 내용 |
|----------|------|
| **agents/** (20개) | code-reviewer, debugger, test-generator + expert-* 15명 패널 |
| **skills/** | expert-panel (병렬 리뷰), tdd-workflow, quality-gate 등 |
| **commands/** | dev-cycle (3단계 파이프라인), jira/ (start, commit, complete, create, test) |
| **settings.json** | Prettier Hook 등 |

---

## 핵심 프레임워크: 하네스 엔지니어링

> **Agent = Model + Harness** (Martin Fowler)
> 하네스 = 모델을 제외한 모든 것. Guide(사전 제어) + Sensor(사후 교정)의 전체 시스템.

### 3단계 점층 — 발표의 뼈대

```
1단계: 프롬프트만        → AI가 자기 판단으로 만듦. 매번 다름.
2단계: + CLAUDE.md       → 규칙은 따르지만, 절차는 즉흥적. 가끔 어김.
3단계: + 하네스 (풀셋)   → 시스템이 절차를 강제. 사람이 아니라 시스템이 품질 보장.
         ├── Skill      → Guide: 절차를 코드화
         ├── Hook       → Sensor: 자동 검증 (100% 강제)
         └── SubAgent   → 역할 분리: 쓰는 AI ≠ 검토하는 AI
```

> "되돌릴 수 있으면 프롬프트로 충분합니다. 되돌릴 수 없으면 하네스가 필요합니다."

---

## 발표 구조

### Part 1. 도입 — 하네스 엔지니어링이란 (4분)

**목표**: 프로젝트 소개 + 3단계 계단을 명시적으로 제시

1. **IssueHub 소개** (30초)
   - "AI 코드 분석 기반 이슈 관리 플랫폼"
   - 브라우저에서 대시보드 간단히 보여주기

2. **하네스 프레임워크** (2분)

   > "AI 에이전트를 거대한 짐말이라고 생각해보세요.
   > 아무리 힘이 세도 마구 없이는 밭을 갈 수 없습니다."

   | 축 | 핵심 | 비유 |
   |---|------|------|
   | Prompt Engineering | AI에게 말을 잘 거는 기술 | 주문을 정확하게 하기 |
   | Context Engineering | 필요한 정보를 적절히 제공 | 재료를 잘 골라주기 |
   | **Harness Engineering** | AI가 실수할 수 없는 환경 | **말에게 마구를 씌우기** |

   > "되돌릴 수 있으면 프롬프트로 충분합니다. 되돌릴 수 없으면 하네스가 필요합니다."
   > - DB: DROP TABLE 한 번이면 복구 불가
   > - 코드 가이드라인: 아키텍처 위반이 쌓이면 기술 부채가 복리로 증가
   > - 보안: API 키 노출은 한 번이면 사고

3. **3단계 계단 — 오늘의 로드맵** (1분)

   > "오늘은 3단계로 마구를 한 겹씩 씌워가겠습니다."

   ```
   1단계: 프롬프트만         → Part 2 Before
   2단계: + CLAUDE.md + Skill → Part 2 After
   3단계: + Hook + SubAgent   → Part 3, 4
   풀 하네스: 전부 조합       → Part 5 라이브
   ```

4. **CLAUDE.md 보여주기** (30초)
   - "이것이 첫 번째 마구입니다. AI가 읽는 런타임 설정 파일"

---

### Part 2. CLAUDE.md + Skill — Guide(사전 제어) (5분)

**3단계 위치**: 1단계(프롬프트만) → **2단계(+CLAUDE.md+Skill)**

#### Before — 프롬프트만 (1분30초)

> "프롬프트만으로 시키면 어떻게 되는지 보겠습니다."

> **💬 프롬프트**:
> ```
> 프로젝트 목록 페이지 만들어줘
> ```

실행 잠깐 보여주고 멈춤 (Ctrl+C). **과정**을 짚기:

→ **"보세요, Jira도 안 보고, 기존 패턴도 참고 안 하고, 검증도 없이 바로 코드 작성을 시작합니다."**
→ **"프롬프트는 절차가 없습니다. 사람이 매번 잘 써야 합니다."**

#### After — CLAUDE.md + Skill (3분30초)

1. **이미 축적된 Skill 라이브러리 보여주기** (1분30초):
   - `.claude/commands/jira/` 디렉토리 열기 → start, commit, complete, create, test
   - `.claude/commands/dev-cycle.md` 열기 → "3단계 풀 파이프라인이 파일 하나에"
   - "이것들은 팀에서 축적된 Skill입니다. 새 팀원이 와도 같은 절차를 밟습니다."

2. **Skill 파일 구조 설명** (1분):
   - `dev-cycle.md` 핵심 3줄만 짚기:
     - `$ARGUMENTS` → "티켓 번호가 여기 들어갑니다"
     - Jira 조회 → 설계 → TDD → 리뷰 → PR → "이 절차가 코드화되어 있습니다"
     - `@code-reviewer`, `@debugger` → "SubAgent도 절차 안에 포함"

3. **Skill 확장 데모** (1분):
   - "새 Skill을 만들어보겠습니다" → jira-implement SKILL.md 스니펫 붙여넣기
   - 핵심 차이점: 기존 패턴 참고 경로 + 자체 검증 체크리스트
   - "이 Skill이 있으면 자연어로 'LIH-69 구현해줘'만 해도 절차가 강제됩니다"

> **💬 After 프롬프트** (Part 5에서 실행):
> ```
> LIH-69 티켓 구현해줘
> ```

**Skill 파일 내용** (스니펫으로 붙여넣기):

```yaml
---
name: jira-implement
description: "Jira 티켓 번호를 받아 이슈 상세를 읽고 구현을 시작합니다.
  '티켓 구현', 'Jira 이슈 작업' 요청 시 트리거."
disable-model-invocation: true
argument-hint: "[LIH-번호]"
---

## 목적
Jira 티켓의 요구사항을 읽고, CLAUDE.md 규칙에 따라 코드를 구현합니다.

## 절차
1. Jira MCP로 $ARGUMENTS 티켓 상세 조회
2. 티켓 제목과 설명에서 구현 요구사항 추출
3. `feat/$ARGUMENTS-{짧은설명}` 브랜치 생성 (이미 있으면 스킵)
4. CLAUDE.md의 Frontend Rules에 따라 구현:
   - `app/(dashboard)/{기능}/page.tsx`: 라우팅 진입점만 (반드시 생성)
   - `features/{기능}/components/`: 비즈니스 컴포넌트
   - `features/{기능}/hooks/`: 커스텀 훅 (kebab-case 파일명)
5. 기존 패턴 참고:
   - `features/issues/components/issue-listing.tsx` → 조합 컴포넌트 구조
   - `features/issues/hooks/use-issues.ts` → 훅 추상화 패턴
   - `features/issues/components/issue-tables/columns.tsx` → ColumnDef 팩토리
   - `constants/mock-data.ts`의 기존 Mock 데이터 활용
6. 커밋 메시지: `feat(frontend): {설명} [$ARGUMENTS]`

## 자체 검증
- [ ] CLAUDE.md 네이밍 컨벤션 준수 (kebab-case 파일, PascalCase 컴포넌트)
- [ ] features/ 디렉토리 구조 올바른지 (components/, hooks/)
- [ ] app/(dashboard)/{기능}/page.tsx 진입점 생성됐는지
- [ ] 기존 DataTable, Badge 등 shadcn/ui 컴포넌트 재사용
```

---

### Part 2→3 브릿지 — CLAUDE.md에 규칙을 적어도 AI가 어기는 이유

> "CLAUDE.md와 Skill로 Guide를 만들었습니다. 근데 이것만으로 충분할까요?"

| 이유 | 설명 |
|------|------|
| **확률적 제안일 뿐** | "하지 마"라고 써도 확률이 낮아지는 것일 뿐, 0% 보장 안 됨 |
| **컨텍스트 압축** | 대화가 길어지면 CLAUDE.md 내용이 압축되면서 규칙이 사라짐 |
| **Lost in the Middle** | LLM은 프롬프트 처음/끝은 기억하지만 중간은 잊음 |
| **토큰 예산 초과** | 시스템 프롬프트 + 대화 히스토리가 쌓이면 규칙이 밀려남 |

> "AI가 45분마다 규칙을 잊는다는 연구 결과도 있습니다.
> CLAUDE.md는 교범입니다. 읽지만 100% 따르진 않습니다.
> **그래서 Sensor가 필요합니다. 시스템이 강제하는 검증 — Hook입니다.**"

---

### Part 3. Hook — Sensor(자동 검증) (4분)

**3단계 위치**: 2단계(CLAUDE.md+Skill) → **3단계 시작(+Hook)**

#### Before (1분)

> **💬 프롬프트**:
> ```
> projects 폴더에 hello 컴포넌트 하나 만들어줘
> ```

> **주의**: settings.json에 Prettier Hook이 이미 있어서 포맷팅은 잡힘.
> Before의 포인트는 "Prettier는 잡지만 ESLint가 없으면 코드 품질 이슈를 못 잡는다"는 것.

→ **"포맷은 잡혔지만 ESLint 없이는 코드 품질 문제를 놓칩니다."**
→ **"매번 '린트 돌려줘'라고 할 건가요?"**

#### After (3분)

1. **개념 설명** (30초):
   > "Hook은 이벤트가 발생하면 자동으로 셸 스크립트를 실행합니다.
   > 프롬프트와 달리 **100% 실행이 보장**됩니다."

2. **라이브로 Hook 추가** (1분30초):
   - `.claude/settings.json` 열기 → PostToolUse Hook + Notification Hook 추가

3. **같은 요청 다시 실행** (1분):

> **💬 프롬프트**:
> ```
> hello.tsx 다시 만들어줘
> ```

→ ESLint가 자동으로 돌아가는 것 확인
→ **"AI가 기억하든 말든, 시스템이 강제합니다. 이게 Sensor입니다."**

**Hook 설정 내용** (settings.json에 추가):

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

### Part 4. SubAgent — 역할 분리 (4분)

**3단계 위치**: 3단계 계속(+SubAgent) — 쓰는 AI ≠ 검토하는 AI

#### Before (1분)

> **💬 프롬프트**:
> ```
> 방금 만든 hello 컴포넌트 리뷰 좀 해줘
> ```

→ 리뷰 결과가 메인 대화에 수십 줄 쌓이는 것을 보여줌
→ **"리뷰가 메인 대화에 쌓입니다. 세션이 길어지면 AI가 느려짐 — 컨텍스트 오염."**
→ **"같은 사람이 쓰고 검토하면 실수를 못 잡듯이, AI도 역할을 나눠야 합니다."**

#### After (3분)

1. **개념 설명** (30초):
   > "SubAgent는 독립 공간에서 일하는 전문 도우미입니다.
   > 결과는 요약만 메인으로 돌아옵니다."

2. **이미 만든 에이전트 보여주기** (1분):
   - `.claude/agents/` 열기 → 20개 파일 목록
   - `code-reviewer.md` 구조 설명 (name, description, tools, model)
   - Expert Panel 5개 패널 간단히 소개

3. **실행 데모** (1분30초):

> **💬 프롬프트**:
> ```
> @code-reviewer hello.tsx 리뷰해줘
> ```

→ 별도 컨텍스트에서 실행 → 메인에는 요약만
→ **"Before에서 메인 대화가 오염됐던 것과 비교해보세요."**
→ **"이제 마구가 3겹입니다 — CLAUDE.md(규칙) + Hook(검증) + SubAgent(분리)."**

---

### Part 5. 풀 하네스 라이브 — LIH-69 구현 (10분)

**3단계 위치**: 풀 하네스 = CLAUDE.md + Skill + Hook + SubAgent 전부 조합

> **전환 멘트**:
> "지금까지 Guide와 Sensor를 한 겹씩 쌓았습니다.
> 이제 전부 조합해서 실제 Jira 티켓을 구현하겠습니다."

#### Step 1. dev-cycle 구조 설명 (1분30초)

`.claude/commands/dev-cycle.md` 열어서 보여주기:

```
/dev-cycle LIH-69 → 이것이 풀 하네스

1단계: Jira 시작 + 아키텍처 설계    (Skill + SubAgent)
2단계: TDD 구현                     (CLAUDE.md 규칙 적용)
3단계: 검증 + 완료                  (SubAgent 리뷰 + Hook 자동 검증)
```

→ **"dev-cycle이 절차를 강제하고, Hook이 품질을 강제합니다. 이 조합이 풀 하네스."**

#### Step 2. 라이브 실행 (8분30초)

> "시간 관계상 `/dev-cycle` 대신 `/jira-implement`로 코드 생성에 집중합니다."

**2-1. Jira 티켓 확인 (30초)**
- Jira에서 LIH-69 보여주기
- 현재 `/projects` 라우트 없음 확인

**2-2. Skill 실행 — 코드 생성 (3분)**

> **💬 프롬프트**:
> ```
> LIH-69 티켓 구현해줘
> ```

→ jira-implement Skill 자동 트리거 → Jira MCP 조회 → 브랜치 생성 → 코드 생성
→ 생성 중 설명: "CLAUDE.md 규칙 자동 준수, 기존 패턴 참고"

**2-3. Hook 자동 동작 확인 (자동)**
→ 파일 생성될 때마다 ESLint 자동 실행
→ **"아까 만든 Hook이 작동합니다"**

**2-4. 피드백 루프 시연 (2분)**
→ 코드에 에러/린트 오류가 있으면:
  - Hook이 잡음 → Claude가 자동 수정 → 다시 Hook → 통과
  - **"이것이 피드백 루프입니다. 실패 → 수정 → 검증이 자동으로 돌아갑니다."**
→ 에러가 없으면:
  - **"Hook이 통과시켰다는 건 품질이 보장됐다는 뜻입니다"**

**2-5. SubAgent 리뷰 (2분)**

> **💬 프롬프트**:
> ```
> @code-reviewer 방금 생성된 프로젝트 목록 코드를 리뷰해줘
> ```

→ 별도 컨텍스트에서 리뷰 → 요약만 메인으로

> **💬 보너스 프롬프트** (시간 여유 있으면):
> ```
> /expert-panel --panels "frontend" "프로젝트 목록 페이지"
> ```

**2-6. 결과 확인 (1분)**
- 브라우저에서 `/projects` 접속
- 프로젝트 목록 테이블 렌더링 확인
- Notification Hook → macOS 알림

---

### Part 6. 정리 (2분)

**3단계 회고**:

```
1단계: 프롬프트만     → 매번 다른 결과. 규칙 없음.
2단계: +CLAUDE.md+Skill → 규칙과 절차가 생김. 하지만 AI가 어길 수 있음.
3단계: +Hook+SubAgent  → 시스템이 강제. 어기면 자동으로 잡힘.
```

**하네스 = Guide + Sensor 전체 시스템**:

| 구성요소 | 축 | Claude Code | 핵심 |
|---------|-----|-------------|------|
| 컨텍스트 | Guide | **CLAUDE.md + Skill** | 실행 전에 방향을 잡아줌 |
| 자동 검증 | Sensor | **Hook** | 실행 후 자동 검증 (100% 강제) |
| 역할 분리 | Guide+Sensor | **SubAgent** | 쓰는 AI와 검토하는 AI를 분리 |
| 피드백 루프 | Sensor | **/dev-cycle** | 검증 실패 → 자동 수정 루프 |

**마무리 멘트**:

> "AI가 실수했을 때 프롬프트를 고치지 마세요. 마구를 고치세요.
> 그 실패가 구조적으로 반복 불가능하도록 시스템을 바꾸는 것 —
> 그게 하네스 엔지니어링이고, 오늘 보여드린 것들입니다.
>
> 인간은 조종한다(steer). 에이전트는 실행한다(execute)."

**CTA (다음 액션)**:

```
오늘부터 시작하는 3단계:
1. CLAUDE.md 작성 — AI에게 프로젝트 규칙 알려주기
2. Hook 하나 추가 — 린트 자동화부터
3. SubAgent 하나 만들기 — 코드 리뷰어부터
```

| 대상 | 다음 액션 |
|------|----------|
| 개발자 | claude-master 레포 포크해서 내 프로젝트에 적용 |
| PM/비개발자 | 하네스 치트시트 읽고 팀 도입 검토 |
| 모두 | 오늘 발표 자료 + 참고 링크 (QR코드) |

---

## 시간 배분 요약

| 파트 | 내용 | 시간 |
|------|------|------|
| Part 1 | 도입 + 3단계 계단 제시 | 4분 |
| Part 2 | CLAUDE.md + Skill (Guide) | 5분 |
| 브릿지 | "AI가 규칙을 어기는 이유" | (Part 3 도입 30초에 포함) |
| Part 3 | Hook (Sensor) | 4분 |
| Part 4 | SubAgent (역할 분리) | 4분 |
| Part 5 | 풀 하네스 라이브 | 10분 |
| Part 6 | 정리 + CTA | 2분 |
| **합계** | | **29분 (+1분 버퍼)** |

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
- [ ] `demo/LIH-69-fallback` 폴백 브랜치 사전 생성 완료
- [ ] `scripts/demo-reset.sh` 실행하여 깨끗한 상태 확인
- [ ] `useIssueDetail.ts` → `use-issue-detail.ts` rename 완료

### 라이브에서 만들 파일

1. `.claude/skills/jira-implement/SKILL.md` — Part 2에서 스니펫 붙여넣기
2. `.claude/settings.json` Hook 추가 — Part 3에서 라이브 수정

### 보여줄 기존 파일

1. `CLAUDE.md` — Part 1
2. `.claude/commands/dev-cycle.md` — Part 2 + Part 5
3. `.claude/commands/jira/start.md` — Part 2 (축적된 Skill 예시)
4. `.claude/agents/code-reviewer.md` — Part 4
5. `.claude/skills/expert-panel/SKILL.md` — Part 4 (시간 여유 시)

### 폴백

```bash
# 라이브 코드 생성 4분 초과 시:
git checkout demo/LIH-69-fallback
# "시간 관계상 미리 준비한 결과를 보여드리겠습니다"
```

```bash
# 리셋 스크립트 (예행 연습 후 복구):
#!/bin/bash
git checkout main
git branch -D feat/LIH-69-* 2>/dev/null
rm -rf frontend/src/features/projects/ 2>/dev/null
rm -f frontend/src/app/\(dashboard\)/projects/page.tsx 2>/dev/null
echo "✅ 데모 상태 리셋 완료"
```

### MCP 장애 시 LIH-69 오프라인 폴백

```
티켓: LIH-69
제목: 프로젝트 목록/생성/설정 UI + API 연동
핵심 요구사항:
- /projects 라우트에 프로젝트 목록 페이지 생성
- DataTable + 필터 툴바 (기존 issue-listing 패턴 참고)
- features/projects/ 디렉토리 구조 생성
- Mock 데이터 활용 (constants/mock-data.ts의 MOCK_PROJECTS)
```

### 리스크 대응

| 리스크 | 대응 |
|--------|------|
| Part 2 Before에서 AI가 의외로 잘 만듦 | "결과가 괜찮아도 절차가 없었죠? Jira 안 봤고, 검증도 없었습니다" → 과정을 짚기 |
| 코드 생성이 오래 걸림 (>4분) | 폴백 브랜치로 즉시 전환 |
| 생성된 코드에 에러 | "이것이 피드백 루프입니다" → 자동 수정 시연 |
| Hook이 동작 안 함 | settings.json 확인. 사전 검증된 백업 파일로 교체 |
| SubAgent 리뷰 시간 초과 | 생략하고 브라우저 결과 확인으로 점프 |
| MCP 연결 끊김 | 위 오프라인 폴백 내용 읽어주고 진행 |
