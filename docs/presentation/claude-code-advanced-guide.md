# Claude Code 심화 기능 활용 발표 자료

> IssueHub 프로젝트에서 Skills, Sub-Agent, Hooks를 실제 개발에 어떻게 적용하는지 라이브 데모

---

## 발표 개요

- **주제**: Claude Code 심화 기능(Skills, Sub-Agent, Hooks)을 실제 프로젝트 개발에 적용하기
- **프로젝트**: IssueHub — AI 코드 분석 기반 이슈 관리 플랫폼
- **핵심 메시지**: Skills + Sub-Agent + Hooks + Jira MCP 조합으로 1인 개발자가 팀급 생산성
- **참고 영상**: [메타 엔지니어의 클로드코드 완벽 가이드 [심화편]](https://www.youtube.com/watch?v=8H3NwQL-Aew) by 실밸개발자
- **참고 치트시트**: [Claude Code 고급 자동화 & 확장 치트시트](https://raspy-roll-970.notion.site/Claude-Code-329f7725c9d98117bf53db9ad424f72d)

---

## 1. Skills — AI에게 주는 업무 매뉴얼

### 개념

반복되는 프롬프트를 `SKILL.md` 파일에 정의하여 AI에게 업무 매뉴얼처럼 전달하는 기능.
한 번 만들면 **자동 트리거** 또는 `/skill-name`으로 호출.

### 프롬프트 vs Skills

| 구분 | 프롬프트 | Skills |
|------|---------|--------|
| 입력 | 매번 입력 | 한 번 만들면 끝 |
| 결과 품질 | 들쭉날쭉 | 일관성 보장 |
| 공유 | 어려움 | Git 커밋으로 팀 공유 |

### 2단계 로딩 방식 (컨텍스트 효율성)

```
1단계: 스킬 이름 + description만 로드 (항상, ~50-100바이트)
2단계: 실제 호출 시 SKILL.md 본문 + 참고 파일 전체 로드
```

→ 안 쓸 때는 거의 공간 차지 안 함 (CLAUDE.md, MCP, Sub-Agent 대비 장점)

### SKILL.md 구조

```yaml
---
name: skill-name
description: "언제 트리거할지 설명. 사용자가 쓸 법한 표현 3개 이상 포함"
disable-model-invocation: true  # 수동 호출만 원할 때
allowed-tools: Read Grep Glob   # 도구 제한
context: fork                   # Sub-Agent에서 실행
---

## 목적
...

## 절차
1. ...
2. ...

## 자체 검증 체크리스트
- [ ] ...
```

### 저장 위치

| 위치 | 경로 | 적용 대상 |
|------|------|----------|
| Personal | `~/.claude/skills/<name>/SKILL.md` | 내 모든 프로젝트 |
| Project | `.claude/skills/<name>/SKILL.md` | 이 프로젝트만 (Git 공유) |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | 플러그인 활성화된 곳 |

---

## 2. Sub-Agent — 독립 컨텍스트의 전문 도우미

### 개념

메인 Claude 안에서 별도 작업 공간을 가진 도우미를 하나 더 띄우는 것.
각 Sub-Agent는 자기만의 지시사항, 도구, 권한을 갖고 있으며, 결과는 요약만 메인으로 돌아옴.

### 핵심 장점

- **병렬 처리** — 여러 작업을 동시에 실행해 전체 소요 시간 단축
- **컨텍스트 보호** — 메인 에이전트의 컨텍스트를 오염시키지 않음
- **전문화** — 각 Sub-Agent에 전문 역할 부여
- **재사용** — 한 번 만든 에이전트를 여러 워크플로우에서 활용

### 내장 Sub-Agent 5종

| Sub-Agent | 모델 | 권한 | 용도 |
|-----------|------|------|------|
| Explore | Haiku (빠름) | 읽기전용 | 코드 탐색, 파일 검색 |
| Plan | 상속 | 읽기전용 | 계획 수립 연구 |
| General-purpose | 상속 | 모든 도구 | 복잡한 다단계 작업 |
| Bash | 상속 | Bash만 | 터미널 명령 실행 |
| Claude Code Guide | Haiku | 읽기전용 | CC 기능 질문 |

### 커스텀 에이전트 파일 구조

```yaml
# .claude/agents/code-reviewer.md
---
name: code-reviewer
description: "코드 리뷰 전문가. 품질, 보안, 모범 사례를 검토."
tools: Read, Grep, Glob, Bash
model: sonnet
---

호출되면:
1. git diff로 최근 변경 확인
2. 수정된 파일에 집중하여 리뷰

피드백 우선순위:
- 크리티컬 (반드시 수정)
- 경고 (수정 권장)
- 제안 (개선 고려)
```

### Sub-Agent vs 메인 대화 판단 기준

| 판단 질문 | Yes → | No → |
|----------|-------|------|
| 작업이 독립적인가? | Sub-Agent (결과만 받기) | 메인 대화 (왔다갔다 필요) |
| 컨텍스트 오염 우려? | Sub-Agent (대량 출력 격리) | 메인 대화 (가벼우면 불필요) |
| 도구 제한 필요? | Sub-Agent (읽기전용 등) | 메인 대화 |

---

## 3. Hooks — 자동화 엔진 (100% 실행 보장)

### 개념

Claude Code의 자동화 엔진. 이벤트 발생 → matcher 조건 검사 → 액션 자동 실행.

> **핵심**: 프롬프트는 AI 판단에 의존하지만, **Hook은 100% 실행이 보장**됨

### 이벤트 타입

| 이벤트 | 타이밍 | 설명 |
|--------|--------|------|
| PreToolUse | 도구 호출 직전 | 입력값 검증, 승인/차단/수정 |
| PostToolUse | 도구 실행 직후 | 결과 검증, 후처리 (린트, 포맷팅) |
| Notification | 사용자 응답 대기 시 | 알림 전송, 로깅 |
| Stop | 에이전트 턴 종료 시 | 최종 정리, 보고서 생성 |

### Hook JSON 구조

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "terminal-notifier -title 'Claude Code' -message '알림이 있습니다' && afplay /System/Library/Sounds/Ping.aiff &"
          }
        ]
      }
    ]
  }
}
```

---

## 4. CLAUDE.md vs Skills vs MCP vs Sub-Agent 비교

| 비교 항목 | CLAUDE.md | Skills | MCP 도구 | Sub-Agent |
|-----------|-----------|--------|---------|-----------|
| 평소 공간 | 전체 내용 매번 | 설명만 (~50-100B) | 전체 설명 매번 | 에이전트 설명 매번 |
| 안 쓸 때 부담 | 항상 있음 | **거의 없음** | 항상 있음 | 항상 있음 |
| 언제 쓰면 좋은가 | 핵심 규칙 | 반복 작업 | 외부 서비스 연동 | 대량 탐색/분석 |

---

## 5. 고급 팁

### Git Worktree 병렬 작업

```bash
# Claude Code 네이티브 지원 (추천)
claude -w feature-auth

# Sub-Agent에서 격리
isolation: worktree  # 에이전트 설정에 추가
```

→ 한 줄이면 워크트리 생성 → 브랜치 체크아웃 → 세션 시작까지 자동

### 멀티 인스턴스 운영

터미널 탭 여러 개를 열고 각 탭에서 다른 Claude 인스턴스를 돌리기:
- 탭 1: "Feature-Auth" — 인증 기능 개발
- 탭 2: "Bug-Fix" — 버그 수정
- 탭 3: "Refactor" — 리팩토링

### MCP 대신 로컬 Bash 스크립트

간단한 작업이라면 MCP보다 로컬 bash 스크립트가 훨씬 가볍다:
```bash
#!/bin/bash
# scripts/check-db.sh
psql -h localhost -U dev -d mydb -c "SELECT count(*) FROM users;"
```
→ Claude에게 "check-db.sh 실행해"라고 하면 끝. MCP 연결 불필요.

---

## 6. 라이브 데모 시나리오

### 사용할 Jira 티켓

현재 IssueHub 프로젝트의 "해야 할 일" 상태 티켓 중 라이브 데모에 적합한 것들:

| 티켓 | 제목 | 적합 이유 |
|------|------|----------|
| **LIH-4** | 폼/테스트 라이브러리 설치 (react-hook-form, vitest, msw) | 설치 + 설정 작업이라 빠르게 데모 가능. Skill로 자동화하기 좋음 |
| **LIH-5** | API 공통 인프라 (ApiResponse, GlobalExceptionHandler, 프로파일) | 백엔드 코드 생성 데모. Hexagonal 아키텍처 규칙 자동 적용 보여주기 |
| **LIH-60** | Response DTO + ApiResponse 래퍼 적용 | LIH-5의 하위작업. 좁은 범위라 라이브에 딱 맞음 |
| **LIH-59** | IssueController GET/POST 최소 구현 | REST API 코드 생성 데모. CLAUDE.md 규칙 따르는지 보여주기 |
| **LIH-61** | 시드 데이터: 테스트용 이슈 3~5건 | 빠르게 끝나는 작업. Hook으로 자동 검증 데모와 결합 |

### 추천 라이브 데모 흐름

> **LIH-5 (API 공통 인프라)** 를 메인 데모 티켓으로 추천
> 이유: 백엔드 코드 생성이라 Hexagonal 아키텍처 규칙 적용이 눈에 보이고,
> Sub-Agent로 병렬 작업(코드 생성 + 리뷰)을 보여줄 수 있음

```
데모 흐름 (예상 15-20분):

1. [Skill] /jira-implement LIH-5
   → Jira MCP로 티켓 조회 → 요구사항 파악 → 브랜치 생성

2. [CLAUDE.md] 자동으로 Hexagonal Architecture 규칙 적용
   → ApiResponse, GlobalExceptionHandler 코드 생성
   → CLAUDE.md에 정의된 패키지 네이밍, 에러 처리 패턴 자동 준수

3. [Sub-Agent 병렬] 코드 생성 완료 후
   → @code-reviewer: 코드 품질 검토
   → @test-generator: 단위 테스트 생성

4. [Hook] PostToolUse로 자동 린트
   → 파일 저장 시 자동으로 ktlint/eslint 실행

5. [Skill] /jira-update LIH-5
   → Jira 티켓 상태를 "진행 중"으로 자동 전환 + 커밋 링크 첨부
```

---

## 7. 통합 파이프라인 (영상의 8단계 → IssueHub 버전)

| 순서 | 기능 | IssueHub 적용 |
|------|------|-------------|
| 1 | Jira MCP | 티켓 상세 조회 (Atlassian MCP) |
| 2 | CLAUDE.md | Hexagonal Architecture 규칙 자동 적용 |
| 3 | Skill | `/jira-implement` — 티켓 기반 구현 자동화 |
| 4 | Sub-Agent 병렬 | code-reviewer + test-generator 동시 실행 |
| 5 | 로컬 Bash | `./gradlew test` + `npm run lint` |
| 6 | Hook | PostToolUse 자동 린트 + Notification 완료 알림 |
| 7 | Sub-Agent | code-reviewer 전체 변경사항 품질 검증 |
| 8 | Skill | `/jira-update` — Jira 상태 전환 + 커밋 링크 |

---

## 참고 자료

- [Claude Code Skills 공식 문서](https://code.claude.com/docs/ko/skills)
- [Claude Code Sub-Agents 공식 문서](https://code.claude.com/docs/ko/sub-agents)
- [Claude Code Hooks 공식 문서](https://code.claude.com/docs/ko/hooks)
- [영상: 메타 엔지니어의 클로드코드 완벽 가이드 [심화편]](https://www.youtube.com/watch?v=8H3NwQL-Aew)
- [Notion 치트시트: Claude Code 고급 자동화 & 확장](https://raspy-roll-970.notion.site/Claude-Code-329f7725c9d98117bf53db9ad424f72d)
- [Hyperithm - Claude Code 심화 활용법](https://tech.hyperithm.com/claude_code_guides_2)
