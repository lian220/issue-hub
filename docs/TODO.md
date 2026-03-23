# IssueHub 개발 TODO List

> 최종 수정일: 2026-03-23

---

## 목업 Phase (프론트만, 목업 데이터)

- [ ] **1. 통합 대시보드 UI** — 메인 화면. 사이드바 네비게이션 + 이슈 현황 위젯 + SLA 상태 + 팀 워크로드 + 최근 이슈 목록
- [ ] **2. 이슈 상세 + AI 분석 화면** — AI 코드 분석 결과(영향 파일, 최근 변경, 유사 이슈, 수정 제안) + 자동 개발 시작 버튼 + PR 연결 이력
- [ ] **3. 이슈 목록 화면** — 프로젝트별 이슈 리스트. 소스 표시, 우선순위, SLA 잔여시간, AI 분석 미리보기, 필터/검색

## 백엔드 + 프론트 동시 (실제 API 연동)

- [ ] **4. 프로젝트 관리** — Git 레포 등록/설정 API + UI. 코드 분석 모드, LLM, 코딩 에이전트 선택
- [ ] **5. 자동화 규칙 설정** — 트리거-조건-액션 규칙 CRUD + SLA 정책 + 에스컬레이션 + Dry-run
- [ ] **6. 자동 개발 추적 대시보드** — 코딩 에이전트 작업 현황 + 티켓→PR 연결

## 백엔드 인프라

- [ ] **7. DB 스키마** — organizations, projects, code_chunks, symbol_index, file_dependencies, coding_tasks + 기존 테이블에 org_id FK
- [ ] **8. 이슈 CRUD API + Jira 단방향 동기화** — REST API + Jira 폴링 + JWT 인증 + RBAC
- [ ] **9. Git bare clone + fetch 인프라** — 프로젝트 등록 시 clone, 주기적 fetch, 디스크 관리
- [ ] **10. 코드 인덱싱 파이프라인** — CodeIntelPort + LocalCodeIntelAdapter. 코드 청킹, 임베딩, pgvector 저장, 심볼 인덱스, 티켓 보강
- [ ] **11. Ollama + LLM 연동** — OllamaLlmAdapter + Claude API 폴백. 프로젝트별 LLM 선택. Docker Compose에 Ollama 추가
- [ ] **12. 외부 연동 확장** — GitHub 양방향 동기화, Notion 커넥터, Slack 알림 + Slash Commands
- [ ] **13. 코딩 에이전트 연동** — CodingAgentPort + OpenHandsAdapter. PR 생성 위임 + 결과 추적

## 의존성

```
#1 대시보드 ──→ #2 이슈 상세 ──→ #3 이슈 목록
                                      (목업 Phase 완료)

#7 DB 스키마 ──┬→ #8 이슈 CRUD ──→ #12 외부 연동
               ├→ #9 Git clone ──┐
               └→ #11 Ollama ────┼→ #10 코드 인덱싱 ──→ #13 코딩 에이전트
                                 │
#1~3 목업 완료 ──→ #4 프로젝트 관리 ──→ #5 자동화 ──→ #6 자동 개발 추적
```
