# Claude Code 라이브 데모 — 운영 가이드

> 발표 스크립트: `2026-04-05-claude-code-live-demo-design.md`

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
2. `.claude/settings.json` Hook 추가 — Part 4에서 라이브 수정

### 보여줄 기존 파일

1. `CLAUDE.md` — Part 1
2. `.claude/commands/dev-cycle.md` — Part 2 + Part 5
3. `.claude/commands/jira/start.md` — Part 2 (축적된 Skill 예시)
4. `.claude/agents/code-reviewer.md` — Part 3
5. `.claude/skills/expert-panel/SKILL.md` — Part 3 (시간 여유 시)

---

## Claude Code 기능 구성

`.claude/` → claude-master 심볼릭 링크로 이미 구축됨:

| 카테고리 | 내용 |
|----------|------|
| **agents/** (20개) | code-reviewer, debugger, test-generator + expert-* 15명 패널 |
| **skills/** | expert-panel (병렬 리뷰), tdd-workflow, quality-gate 등 |
| **commands/** | dev-cycle (3단계 파이프라인), jira/ (start, commit, complete, create, test) |
| **settings.json** | Prettier Hook 등 |

---

## 폴백

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
echo "데모 상태 리셋 완료"
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

---

## 리스크 대응

| 리스크 | 대응 |
|--------|------|
| Part 2 Before에서 AI가 의외로 잘 만듦 | "결과가 괜찮아도 절차가 없었죠? Jira 안 봤고, 검증도 없었습니다" → 과정을 짚기 |
| 코드 생성이 오래 걸림 (>4분) | 폴백 브랜치로 즉시 전환 |
| 생성된 코드에 에러 | "이것이 피드백 루프입니다" → 자동 수정 시연 |
| Hook이 동작 안 함 | settings.json 확인. 사전 검증된 백업 파일로 교체 |
| SubAgent 리뷰 시간 초과 | 생략하고 브라우저 결과 확인으로 점프 |
| MCP 연결 끊김 | 위 오프라인 폴백 내용 읽어주고 진행 |
