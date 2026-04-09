# Claude Code 심화 기능 라이브 데모 발표 설계

> 하네스 엔지니어링의 3단계 점층(프롬프트 → CLAUDE.md → 하네스)을 보여주고
> 실제 Jira 티켓을 풀 하네스로 라이브 구현하는 발표

## 목차

- [Part 1. 도입](#part-1-도입--하네스-엔지니어링이란)
- [Part 2. CLAUDE.md + Skill](#part-2-claudemd--skill--guide사전-제어)
- [Part 3. SubAgent](#part-3-subagent--역할-분리)
- [Part 4. Hook](#part-4-hook--sensor자동-검증)
- [Part 5. 풀 하네스 라이브](#part-5-풀-하네스-라이브--lih-69-구현)
- [Part 6. 정리](#part-6-정리)
- [참고 자료](#참고-자료)

---

### Part 1. 도입 — 하네스 엔지니어링이란

**목표**: 핵심 메시지 선언 + 프로젝트 소개 + 3단계 계단 제시


> **핵심 메시지 (오프닝)**:
> "AI가 실수했을 때 프롬프트를 고치지 마세요. 마구(harness)를 고치세요.
> 오늘은 이 한 문장을 29분 동안 증명하겠습니다."

1. **IssueHub 소개**
   - "AI 코드 분석 기반 이슈 관리 플랫폼"
   - 브라우저에서 대시보드 간단히 보여주기

2. **하네스 프레임워크**

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

3. **3단계 계단 — 오늘의 로드맵**

   > "오늘은 3단계로 마구를 한 겹씩 씌워가겠습니다."

   ```
   1단계: 프롬프트만         → Part 2 Before
   2단계: + CLAUDE.md + Skill → Part 2 After
   3단계: + SubAgent + Hook   → Part 3, 4
   풀 하네스: 전부 조합       → Part 5 라이브
   ```

4. **CLAUDE.md 보여주기**
   - "이것이 첫 번째 마구입니다. AI가 읽는 런타임 설정 파일"

---

### Part 2. CLAUDE.md + Skill — Guide(사전 제어)

**3단계 위치**: 1단계(프롬프트만) → **2단계(+CLAUDE.md+Skill)**

#### Before — 프롬프트만

> "프롬프트만으로 시키면 어떻게 되는지 보겠습니다."

> **💬 프롬프트**:
> ```
> 프로젝트 목록 페이지 만들어줘
> ```

실행 잠깐 보여주고 멈춤 (Ctrl+C). **과정**을 짚기:

→ **"보세요, Jira도 안 보고, 기존 패턴도 참고 안 하고, 검증도 없이 바로 코드 작성을 시작합니다."**
→ **"프롬프트는 절차가 없습니다. 사람이 매번 잘 써야 합니다."**

#### After — CLAUDE.md + Skill

1. **이미 축적된 Skill 라이브러리 보여주기**:
   - `.claude/commands/jira/` 디렉토리 열기 → start, commit, complete, create, test
   - `.claude/commands/dev-cycle.md` 열기 → "3단계 풀 파이프라인이 파일 하나에"
   - "이것들은 팀에서 축적된 Skill입니다. 새 팀원이 와도 같은 절차를 밟습니다."

2. **Skill 파일 구조 설명**:
   - `dev-cycle.md` 핵심 3줄만 짚기:
     - `$ARGUMENTS` → "티켓 번호가 여기 들어갑니다"
     - Jira 조회 → 설계 → TDD → 리뷰 → PR → "이 절차가 코드화되어 있습니다"
     - `@code-reviewer`, `@debugger` → "SubAgent도 절차 안에 포함"

3. **Skill 확장 데모**:

> **💬 프롬프트**:
> ```text
> Jira 티켓 번호를 받아서 구현하는 스킬을 만들어줘.
> 티켓 조회하고, 브랜치 만들고, CLAUDE.md 규칙대로 코드 작성하고,
> 기존 issues 패턴 참고해서 만들어.
> 단계별로 진행할 때마다 나한테 확인받고 넘어가.
> ```

   → 생성된 Skill 파일 열어서 구조 설명
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

### Part 3. SubAgent — 역할 분리

**3단계 위치**: 2단계(CLAUDE.md+Skill) → **3단계 시작(+SubAgent)** — 쓰는 AI ≠ 검토하는 AI

#### Before

> **💬 프롬프트**:
> ```
> projects 폴더에 hello 컴포넌트 하나 만들어줘. 다 만들면 리뷰도 해줘
> ```

→ 리뷰 결과가 메인 대화에 수십 줄 쌓이는 것을 보여줌
→ **"리뷰가 메인 대화에 쌓입니다. 세션이 길어지면 AI가 느려짐 — 컨텍스트 오염."**
→ **"같은 사람이 쓰고 검토하면 실수를 못 잡듯이, AI도 역할을 나눠야 합니다."**

#### After

1. **개념 설명**:
   > "SubAgent는 독립 공간에서 일하는 전문 도우미입니다.
   > 결과는 요약만 메인으로 돌아옵니다."

2. **이미 만든 에이전트 보여주기**:
   - `.claude/agents/` 열기 → 20개 파일 목록
   - `code-reviewer.md` 구조 설명 (name, description, tools, model)
   - Expert Panel 5개 패널 간단히 소개

3. **실행 데모**:

> **💬 프롬프트**:
> ```
> @code-reviewer hello.tsx 리뷰해줘
> ```

→ 별도 컨텍스트에서 실행 → 메인에는 요약만
→ **"Before에서 메인 대화가 오염됐던 것과 비교해보세요."**

---

### Part 3→4 브릿지 — CLAUDE.md에 규칙을 적어도 AI가 어기는 이유

> "CLAUDE.md + Skill로 Guide를 만들고, SubAgent로 역할도 분리했습니다. 근데 이것만으로 충분할까요?"

| 이유 | 설명 | 왜 발생하나 |
|------|------|------------|
| **확률적 생성** | "하지 마"라고 써도 확률이 낮아지는 것일 뿐, 0% 보장 안 됨 | LLM은 다음 토큰을 확률 분포에서 샘플링. 규칙 엔진이 아님 |
| **컨텍스트 압축** | 대화가 길어지면 CLAUDE.md 내용이 압축되면서 규칙이 사라짐 | 이전 메시지 자동 요약 시 세부 규칙("kebab-case" 등)이 누락 |
| **Lost in the Middle** | LLM은 프롬프트 처음/끝은 기억하지만 중간은 잊음 | CLAUDE.md가 시스템 프롬프트 중간에 위치, 대화가 길수록 묻힘 |
| **토큰 경쟁** | 시스템 프롬프트 + 대화 히스토리가 쌓이면 규칙이 밀려남 | 도구 결과가 수천 줄 쌓이면 CLAUDE.md의 상대적 비중 감소 |

> "AI가 45분마다 규칙을 잊는다는 연구 결과도 있습니다.
> CLAUDE.md는 교범이고, SubAgent도 결국 AI입니다. 읽지만 100% 따르진 않습니다.
> **그래서 Sensor가 필요합니다. AI가 아닌 시스템이 강제하는 검증 — Hook입니다.**"

---

### Part 4. Hook — Sensor(자동 검증)

**3단계 위치**: 3단계 계속(+Hook) — 시스템이 100% 강제

#### Before

> "방금 만든 hello 컴포넌트, 포맷은 잡혀 있죠? settings.json에 Prettier Hook이 이미 있으니까요."
> "하지만 ESLint가 없으면 코드 품질 이슈는 놓칩니다."

→ **"포맷은 잡혔지만 ESLint 없이는 코드 품질 문제를 놓칩니다."**
→ **"매번 '린트 돌려줘'라고 할 건가요?"**

#### After

1. **개념 설명**:
   > "Hook은 이벤트가 발생하면 자동으로 셸 스크립트를 실행합니다.
   > 프롬프트와 달리 **100% 실행이 보장**됩니다."

2. **라이브로 Hook 추가**:
   - `.claude/settings.json` 열기 → PostToolUse Hook + Notification Hook 추가

3. **같은 요청 다시 실행**:

> **💬 프롬프트**:
> ```
> hello.tsx 다시 만들어줘
> ```

→ ESLint가 자동으로 돌아가는 것 확인
→ **"AI가 기억하든 말든, 시스템이 강제합니다. 이게 Sensor입니다."**
→ **"이제 마구가 3겹입니다 — CLAUDE.md(규칙) + SubAgent(분리) + Hook(강제)."**

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

### Part 5. 풀 하네스 라이브 — LIH-69 구현

**3단계 위치**: 풀 하네스 = CLAUDE.md + Skill + SubAgent + Hook 전부 조합

> **전환 멘트**:
> "지금까지 Guide와 Sensor를 한 겹씩 쌓았습니다.
> 이제 전부 조합해서 실제 Jira 티켓을 구현하겠습니다."

#### Step 1. dev-cycle 구조 설명

`.claude/commands/dev-cycle.md` 열어서 보여주기:

```
/dev-cycle LIH-69 → 이것이 풀 하네스

1단계: Jira 시작 + 아키텍처 설계    (Skill + SubAgent)
2단계: TDD 구현                     (CLAUDE.md 규칙 적용)
3단계: 검증 + 완료                  (SubAgent 리뷰 + Hook 자동 검증)
```

→ **"dev-cycle이 절차를 강제하고, Hook이 품질을 강제합니다. 이 조합이 풀 하네스."**

#### Step 2. 라이브 실행

> "시간 관계상 `/dev-cycle` 대신 `/jira-implement`로 코드 생성에 집중합니다."

**2-1. Jira 티켓 확인**
- Jira에서 LIH-69 보여주기
- 현재 `/projects` 라우트 없음 확인

**2-2. Skill 실행 — 코드 생성**

> **💬 프롬프트**:
> ```
> LIH-69 티켓 구현해줘
> ```

→ jira-implement Skill 자동 트리거 → Jira MCP 조회 → 브랜치 생성 → 코드 생성
→ 생성 중 설명: "CLAUDE.md 규칙 자동 준수, 기존 패턴 참고"

**2-3. Hook 자동 동작 확인**
→ 파일 생성될 때마다 ESLint 자동 실행
→ **"아까 만든 Hook이 작동합니다"**

**2-4. 피드백 루프 시연**
→ 코드에 에러/린트 오류가 있으면:
  - Hook이 잡음 → Claude가 자동 수정 → 다시 Hook → 통과
  - **"이것이 피드백 루프입니다. 실패 → 수정 → 검증이 자동으로 돌아갑니다."**
→ 에러가 없으면:
  - **"Hook이 통과시켰다는 건 품질이 보장됐다는 뜻입니다"**

**2-5. SubAgent 리뷰**

> **💬 프롬프트**:
> ```
> @code-reviewer 방금 생성된 프로젝트 목록 코드를 리뷰해줘
> ```

→ 별도 컨텍스트에서 리뷰 → 요약만 메인으로

> **💬 보너스 프롬프트** (시간 여유 있으면):
> ```
> /expert-panel --panels "frontend" "프로젝트 목록 페이지"
> ```

**2-6. 결과 확인**
- 브라우저에서 `/projects` 접속
- 프로젝트 목록 테이블 렌더링 확인
- Notification Hook → macOS 알림

---

### Part 6. 정리

**3단계 회고**:

```
1단계: 프롬프트만     → 매번 다른 결과. 규칙 없음.
2단계: +CLAUDE.md+Skill → 규칙과 절차가 생김. 하지만 AI가 어길 수 있음.
3단계: +SubAgent+Hook  → 역할 분리 + 시스템 강제. 어기면 자동으로 잡힘.
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

## 참고 자료

- Martin Fowler: [Harness engineering for coding agent users](https://martinfowler.com/articles/harness-engineering.html) — "Agent = Model + Harness"
- 하네스 엔지니어링: [AI 에이전트를 진짜로 통제하는 기술](https://raspy-roll-970.notion.site/AI-333f7725c9d98147957afad16db3b655)
- 영상: [메타 엔지니어의 클로드코드 완벽 가이드 [심화편]](https://www.youtube.com/watch?v=8H3NwQL-Aew)
- 치트시트: [Claude Code 고급 자동화 & 확장](https://raspy-roll-970.notion.site/Claude-Code-329f7725c9d98117bf53db9ad424f72d)
- 공식 문서: [Skills](https://code.claude.com/docs/ko/skills) / [Sub-Agents](https://code.claude.com/docs/ko/sub-agents) / [Hooks](https://code.claude.com/docs/ko/hooks)
- AI 규칙 위반: [AI Agent Forgets Its Rules Every 45 Minutes](https://dev.to/douglasrw/your-ai-agent-forgets-its-rules-every-45-minutes-heres-the-fix-151e)