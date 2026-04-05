# IssueHub 사용자 플로우 (User Flow)

> Phase 0~4 전체 사용자 여정을 섹션별로 분리

---

## 1. 인증 + 온보딩

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 40, 'rankSpacing': 60, 'padding': 20}}}%%
flowchart LR
    START([사용자 접속])
    START --> LOGIN{로그인 여부}
    LOGIN -->|미인증| SIGNUP[회원가입 / 로그인]
    LOGIN -->|인증됨| DASHBOARD([대시보드])

    SIGNUP --> FIRST{첫 로그인?}
    FIRST -->|No| DASHBOARD
    FIRST -->|Yes| ORG[조직 설정]
    ORG --> PROJ[프로젝트 등록]
    PROJ --> INVITE[팀원 초대]
    INVITE --> POLICY[필수 정책 확인]
    POLICY --> DASHBOARD

    style START fill:#e1f5fe,stroke:#0288d1
    style DASHBOARD fill:#fff3e0,stroke:#f57c00
```

---

## 2. 대시보드

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 40, 'rankSpacing': 60, 'padding': 20}}}%%
flowchart LR
    DASHBOARD([대시보드 홈])

    DASHBOARD --> SUMMARY[요약 카드]
    DASHBOARD --> RECENT[최근 이슈 목록]
    DASHBOARD --> WORKLOAD[팀 워크로드 차트]
    DASHBOARD --> SLA[SLA 현황]

    SUMMARY -->|클릭| ISSUE_LIST([이슈 목록])
    RECENT -->|행 클릭| ISSUE_DETAIL([이슈 상세])
    SLA -->|위반 클릭| ISSUE_DETAIL

    style DASHBOARD fill:#fff3e0,stroke:#f57c00
    style ISSUE_LIST fill:#e8eaf6,stroke:#3f51b5
    style ISSUE_DETAIL fill:#f3e5f5,stroke:#9c27b0
```

---

## 3. 이슈 관리

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 40, 'rankSpacing': 60, 'padding': 20}}}%%
flowchart TD
    LIST([이슈 목록])

    LIST -->|행 클릭| DETAIL[이슈 상세]
    LIST -->|새 이슈| CREATE[이슈 생성 폼]
    CREATE --> LIST

    DETAIL --> EDIT[이슈 수정]
    DETAIL --> STATUS[상태 변경]
    DETAIL --> ASSIGN[담당자 변경]
    DETAIL --> AI([AI 분석 탭])

    style LIST fill:#e8eaf6,stroke:#3f51b5
    style DETAIL fill:#f3e5f5,stroke:#9c27b0
    style AI fill:#e8f5e9,stroke:#4caf50
```

---

## 4. AI 코드 분석 (Phase 3)

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 40, 'rankSpacing': 60, 'padding': 20}}}%%
flowchart TD
    AI([AI 분석 탭])

    AI --> FILES[영향 파일 목록]
    AI --> HISTORY[최근 변경 이력]
    AI --> SIMILAR[유사 과거 이슈]
    AI --> FIX[AI 수정 제안]

    FILES -->|파일 클릭| CODE[코드 하이라이트 뷰]

    style AI fill:#e8f5e9,stroke:#4caf50
```

---

## 5. 자동 개발 (Phase 3)

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 40, 'rankSpacing': 60, 'padding': 20}}}%%
flowchart LR
    AI([AI 분석 탭]) --> BTN[자동 개발 시작]
    BTN --> CONFIRM{확인?}
    CONFIRM -->|취소| AI
    CONFIRM -->|확인| AGENT[OpenHands 실행]
    AGENT --> PROGRESS[진행 상태]
    PROGRESS --> PR[PR 생성 완료]
    PR --> REVIEW[PR 리뷰]

    style AI fill:#e8f5e9,stroke:#4caf50
    style BTN fill:#ffebee,stroke:#e53935
```

---

## 6. 프로젝트 관리 (Phase 1)

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 40, 'rankSpacing': 60, 'padding': 20}}}%%
flowchart LR
    SIDEBAR([사이드바]) --> LIST[프로젝트 목록]
    LIST --> CREATE[프로젝트 생성]
    LIST --> SETTINGS[프로젝트 설정]
    LIST --> SWITCH[프로젝트 전환]

    style SIDEBAR fill:#fff3e0,stroke:#f57c00
```

---

## 7. 커넥터 설정 (Phase 2)

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 40, 'rankSpacing': 60, 'padding': 20}}}%%
flowchart LR
    SIDEBAR([사이드바]) --> LIST[커넥터 관리]
    LIST --> ADD[새 커넥터 추가]
    ADD --> OAUTH[OAuth 인증]
    OAUTH --> SELECT[동기화 프로젝트 선택]
    SELECT --> MAPPING[필드 매핑 설정]
    MAPPING --> STATUS[동기화 상태 확인]

    style SIDEBAR fill:#fff3e0,stroke:#f57c00
```

---

## 8. 자동화 규칙 (Phase 2+)

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 40, 'rankSpacing': 60, 'padding': 20}}}%%
flowchart LR
    SIDEBAR([사이드바]) --> LIST[규칙 목록]
    LIST --> CREATE[새 규칙]
    CREATE --> TRIGGER[1. 트리거]
    TRIGGER --> COND[2. 조건]
    COND --> ACTION[3. 액션]
    ACTION --> DRY[Dry-Run 테스트]
    DRY --> ACTIVE[규칙 활성화]

    style SIDEBAR fill:#fff3e0,stroke:#f57c00
```

---

## Phase별 기능 범위

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '20px', 'fontFamily': 'arial'}, 'flowchart': {'nodeSpacing': 30, 'rankSpacing': 50, 'padding': 15}}}%%
flowchart LR
    subgraph P0 [Phase 0: 기반]
        P0_1[스켈레톤 정리]
        P0_2[API 공통]
        P0_3[DB 마이그레이션]
        P0_4[개발 인프라]
        P0_5[UI 인프라]
    end

    subgraph P1 [Phase 1: 인증 + CRUD]
        P1_1[JWT 인증]
        P1_2[로그인 UI]
        P1_3[프로젝트 CRUD]
        P1_4[이슈 CRUD]
        P1_5[프론트 실데이터]
    end

    subgraph P2 [Phase 2: 연동 + 대시보드]
        P2_1[Jira 동기화]
        P2_2[커넥터 UI]
        P2_3[차트 + 트렌드]
        P2_4[프로젝트 스위처]
    end

    subgraph P3 [Phase 3: AI 코드 분석]
        P3_1[Git bare clone]
        P3_2[Ollama + LLM]
        P3_3[코드 인덱싱]
        P3_4[티켓 품질 분석]
        P3_5[AI 분석 UI]
    end

    subgraph P4 [Phase 4: 안정화]
        P4_1[테스트 보강]
        P4_2[모니터링]
        P4_3[배포 + 피드백]
    end

    P0 --> P1 --> P2 --> P3 --> P4
```
