# Claude Code 심화 기능 라이브 데모 발표 설계

> IssueHub 프로젝트에서 Skills, Sub-Agent, Hooks를 Before/After 비교 후 풀 파이프라인 라이브 데모

## 메타 정보

- **발표 시간**: 약 29분
- **형식**: Before/After 비교 + 풀 파이프라인 라이브 데모
- **비중**: Claude Code 기능 설명 50% + 실제 개발 50%
- **라이브 데모 티켓**: LIH-69 (프로젝트 목록/생성/설정 UI + API 연동)
- **라이브 데모 범위**: 프로젝트 목록 페이지 (테이블 + 카드 뷰) — 확실하게 완성
- **청중**: 개발자 + 비개발자 혼합
- **핵심 메시지**: Skills + Sub-Agent + Hooks 조합으로 1인 개발자가 팀급 생산성

## 참고 자료

- 영상: [메타 엔지니어의 클로드코드 완벽 가이드 [심화편]](https://www.youtube.com/watch?v=8H3NwQL-Aew) by 실밸개발자
- 치트시트: [Claude Code 고급 자동화 & 확장](https://raspy-roll-970.notion.site/Claude-Code-329f7725c9d98117bf53db9ad424f72d)
- 공식 문서: [Skills](https://code.claude.com/docs/ko/skills) / [Sub-Agents](https://code.claude.com/docs/ko/sub-agents) / [Hooks](https://code.claude.com/docs/ko/hooks)

---

## 발표 구조

### Part 1. 도입 (3분)

**목표**: 프로젝트 소개 + 오늘 발표 로드맵 안내

**액션**:
1. IssueHub 프로젝트 소개 — "AI 코드 분석 기반 이슈 관리 플랫폼"
2. 브라우저에서 현재 화면 간단히 보여주기 (대시보드, 이슈 목록)
3. CLAUDE.md 파일 열어서 한마디 설명 — "AI에게 프로젝트 아키텍처 규칙을 알려주는 파일"
4. 발표 로드맵 안내:
   > "오늘은 Claude Code의 3가지 심화 기능을 Before/After로 소개하고,
   > 마지막에 실제 Jira 티켓 하나를 이것들로 처음부터 끝까지 구현하겠습니다"

**보여줄 화면**:
- 브라우저: IssueHub 대시보드
- 에디터: CLAUDE.md 파일

---

### Part 2. Skill — Before & After (4분)

**목표**: "반복 프롬프트를 재사용 가능한 파일로" 라는 개념을 비포/애프터로 체감

#### Before (1분)

Claude Code 터미널에서 직접 타이핑:

```
LIH-69 Jira 티켓 읽어서 프로젝트 목록 페이지 만들어줘.
shadcn/ui 테이블 쓰고, features/projects/에 만들고,
CLAUDE.md에 정의된 네이밍 컨벤션 따르고,
issue-listing 패턴 참고해서 만들어줘...
```

→ **"매번 이렇게 긴 프롬프트를 치고, Jira 번호 복붙하고, 규칙을 일일이 설명해야 합니다"**

#### After (3분)

1. **개념 설명** (30초):
   > "Skill은 이 반복 프롬프트를 SKILL.md 파일에 한 번 저장해두면,
   > `/skill-name` 한 줄로 호출할 수 있는 기능입니다"

2. **라이브 Skill 파일 생성** (2분):
   - `.claude/skills/jira-implement/SKILL.md` 파일을 라이브로 작성
   - frontmatter (name, description) + 절차 단계 보여주기
   - `$ARGUMENTS` 변수 설명 — "티켓 번호가 여기 들어갑니다"

3. **실행 맛보기** (30초):
   - `/jira-implement LIH-69` 입력만 보여주고 → "이 한 줄이면 됩니다. 실행은 마지막 파트에서"
   - 아직 실행하지 않고 넘어감

**Skill 파일 내용** (라이브에서 작성할 것):

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
   - app/ 디렉토리: 라우팅 진입점만
   - features/{기능}/components/: 비즈니스 컴포넌트
   - features/{기능}/hooks/: 커스텀 훅
5. 기존 패턴 참고 (issue-listing, dashboard 등)
6. 커밋 메시지에 Jira 티켓 번호 포함

## 자체 검증
- [ ] CLAUDE.md 네이밍 컨벤션 준수 (kebab-case 파일, PascalCase 컴포넌트)
- [ ] features/ 디렉토리 구조 올바른지
- [ ] app/ 에는 진입점만 있는지
```

---

### Part 3. SubAgent — Before & After (4분)

**목표**: "독립 컨텍스트에서 전문 작업을 위임" 개념을 체감

#### Before (1분)

Claude Code에서 코드 리뷰 시뮬레이션:

```
방금 만든 코드 리뷰해줘.
보안 체크하고, 성능 이슈 확인하고, 가독성도 봐줘.
CLAUDE.md 규칙 따르는지도 확인해줘...
```

→ **"리뷰 결과가 메인 대화에 수백 줄 쌓입니다. 긴 세션에서 AI가 점점 느려지는 이유가 이겁니다. 컨텍스트 오염이죠."**

#### After (3분)

1. **개념 설명** (30초):
   > "Sub-Agent는 별도 작업 공간을 가진 전문 도우미입니다.
   > 리뷰 결과는 Sub-Agent 쪽에만 남고, 메인에는 요약만 돌아옵니다.
   > 여러 개를 동시에 띄울 수도 있습니다 — 병렬 실행."

2. **라이브 SubAgent 생성** (2분):
   - `/agents` 입력 → Create new agent → Project level 선택
   - Generate with Claude → "코드 품질, 보안, CLAUDE.md 규칙 준수를 검토하는 리뷰어" 입력
   - 도구 선택: Read-only tools
   - 모델: Sonnet
   - 저장 → `.claude/agents/code-reviewer.md` 생성된 것 확인

3. **호출 방법 안내** (30초):
   - `@code-reviewer` 입력 → "이렇게 부르면 됩니다. 마지막 파트에서 실행합니다"

---

### Part 4. Hook — Before & After (4분)

**목표**: "100% 실행 보장되는 자동화" 개념을 체감

#### Before (1분)

두 가지 상황 보여주기:

1. "코드 작성 후 `npm run lint` 까먹은 적 있죠?"
2. Claude Code에 "린트 꼭 돌려줘"라고 프롬프트 → **"그래도 AI가 가끔 빼먹습니다. 프롬프트는 '부탁'이니까요"**

→ **"Hook은 부탁이 아니라 강제입니다. 100% 실행이 보장됩니다."**

#### After (3분)

1. **개념 설명** (30초):
   > "Hook은 이벤트가 발생하면 자동으로 셸 스크립트를 실행합니다.
   > 도구 호출 전(PreToolUse), 후(PostToolUse), 알림(Notification) 등의 타이밍에 걸 수 있습니다."

2. **라이브 Hook 설정** (2분):
   - `.claude/settings.json` 열기
   - PostToolUse Hook 추가 — Edit/Write 도구 실행 후 자동 lint
   - Notification Hook 추가 — 작업 완료 시 macOS 알림

3. **정리** (30초):
   > "이제 파일이 수정될 때마다 자동으로 린트가 돌고, 작업이 끝나면 알림이 옵니다.
   > 마지막 파트에서 실제로 작동하는 걸 보겠습니다."

**Hook 설정 내용** (라이브에서 작성할 것):

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

### Part 5. 풀 파이프라인 라이브 — LIH-69 구현 (12분)

**목표**: Part 2-4에서 만든 Skill + SubAgent + Hook을 실제로 실행해서 Jira 티켓 하나를 구현

> **전환 멘트**: "지금까지 3가지 도구를 만들었습니다. 이제 이것들을 한꺼번에 사용해서,
> 실제 Jira 티켓 하나를 처음부터 끝까지 구현하겠습니다."

#### Step 1. Jira 티켓 확인 (1분)

- Jira에서 LIH-69 티켓 화면을 보여줌
- "프로젝트 목록/생성/설정 UI — 이 티켓을 구현하겠습니다"
- 현재 `/projects` 라우트가 없다는 것 확인

#### Step 2. Skill 실행 — 코드 생성 (4분)

```
/jira-implement LIH-69
```

- Jira MCP가 티켓 상세를 조회하는 것 보여주기
- 브랜치 생성되는 것 확인
- 코드가 생성되는 동안 설명:
  - "CLAUDE.md에 정의된 features/ 디렉토리 구조를 자동으로 따릅니다"
  - "issue-listing 패턴을 참고해서 DataTable, Toolbar 구성"
  - "파일명은 kebab-case, 컴포넌트는 PascalCase — 규칙 자동 준수"

#### Step 3. Hook 동작 확인 (코드 생성 중에 자연스럽게)

- 파일이 생성/수정될 때 PostToolUse Hook이 자동으로 린트 돌아가는 것 확인
- "보셨나요? 파일 저장 때마다 eslint가 자동으로 돌아갑니다. 아까 만든 Hook이 작동하는 겁니다"

#### Step 4. SubAgent 리뷰 (3분)

코드 생성 완료 후:

```
@code-reviewer 방금 생성된 프로젝트 목록 코드를 리뷰해줘
```

- Sub-Agent가 별도 컨텍스트에서 실행되는 것 보여주기
- "메인 대화에는 요약만 돌아옵니다. 상세 리뷰는 Sub-Agent 쪽에"
- 리뷰 결과 확인 → 이슈가 있으면 "이런 피드백을 자동으로 받을 수 있습니다"

#### Step 5. 결과 확인 (2분)

- `npm run dev` (이미 돌고 있다면 생략)
- 브라우저에서 `/projects` 접속
- 프로젝트 목록 테이블이 렌더링되는 것 확인
- "Jira 티켓 하나를 Skill 한 줄로 구현하고, Hook이 품질을 지키고, Sub-Agent가 리뷰했습니다"

#### Step 6. 완료 알림 (자동)

- Notification Hook → macOS 알림 + 소리
- "작업 끝나면 알림도 자동입니다"

---

### Part 6. 정리 (2분)

**한 줄 요약**:

| 기능 | 한 줄 요약 | 핵심 |
|------|-----------|------|
| **Skill** | 반복 프롬프트를 파일로 → `/skill-name` 한 줄 호출 | 재사용성 |
| **SubAgent** | 독립 컨텍스트의 전문 도우미 → 병렬 실행 가능 | 격리 + 전문화 |
| **Hook** | 이벤트 기반 자동 실행 → 100% 보장 | 강제 자동화 |

**마무리 멘트**:
> "Skill로 작업을 자동화하고, Sub-Agent로 품질을 검증하고, Hook으로 규칙을 강제합니다.
> 이 3가지를 조합하면 1인 개발자가 팀급 생산성을 낼 수 있습니다."

---

## 사전 준비 체크리스트

### 환경

- [ ] `frontend/` dev 서버 실행 상태 (`npm run dev`)
- [ ] Jira LIH-69 티켓 브라우저 탭 열어두기
- [ ] Claude Code 세션 깨끗한 상태에서 시작
- [ ] Atlassian MCP 연결 확인
- [ ] terminal-notifier 설치 확인 (`brew install terminal-notifier`)
- [ ] 에디터 폰트 크기 발표용으로 키우기

### 라이브에서 만들 파일 (3개)

1. `.claude/skills/jira-implement/SKILL.md` — Part 2에서 생성
2. `.claude/agents/code-reviewer.md` — Part 3에서 `/agents`로 생성
3. `.claude/settings.json` — Part 4에서 Hook 추가

### 리스크 대응

| 리스크 | 대응 |
|--------|------|
| Skill 파일 작성 중 오타 | 미리 내용을 docs/presentation/ 에 치트시트로 준비해두고 참고 |
| 코드 생성이 오래 걸림 (>3분) | 생성 중에 CLAUDE.md 규칙 적용 설명하며 시간 활용 |
| 생성된 코드에 에러 | "이게 바로 Sub-Agent 리뷰가 필요한 이유입니다" 로 자연스럽게 연결 |
| Hook이 동작 안 함 | settings.json 오타 확인. 최악의 경우 "설정 파일 하나 고치면 됩니다" |
| 시간 초과 (25분 넘어감) | Part 5의 Sub-Agent 리뷰를 생략하고 바로 브라우저 확인으로 점프 |
| MCP 연결 끊김 | 수동으로 Jira 티켓 내용 읽어주고 진행 |

---

## 생성될 파일 구조

```
.claude/
├── skills/
│   └── jira-implement/
│       └── SKILL.md              ← Part 2 라이브 생성
├── agents/
│   └── code-reviewer.md          ← Part 3 /agents로 생성
└── settings.json                 ← Part 4 Hook 추가

docs/presentation/
├── claude-code-advanced-guide.md ← 이미 생성됨 (참고용)
└── (이 설계 문서)
```
