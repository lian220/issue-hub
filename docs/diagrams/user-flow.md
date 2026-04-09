# IssueHub 사용자 플로우 (User Flow)

> MVP 기획서 기반 사용자 여정 플로우차트
> 최종 수정: 2026-04-09

## 전체 사용자 플로우

```mermaid
flowchart TD
    START([사용자 접속]) --> LOGIN{로그인 여부}
    LOGIN -->|미인증| SIGNUP[로그인]
    LOGIN -->|인증됨| FIRST{첫 로그인?}
    SIGNUP --> FIRST

    FIRST -->|Yes| ONBOARD
    FIRST -->|No| DASHBOARD

    subgraph ONBOARDING [온보딩 6단계]
        ONBOARD[온보딩 위자드 시작]
        ONBOARD --> OB1[1. 이슈 소스 선택\nJira / Notion / GitHub / GitLab]
        OB1 --> OB2[2. 연동 설정\nOAuth / API Key → n8n 웹훅 자동 등록]
        OB2 --> OB3[3. 첫 정책 등록\n샘플 템플릿 → 커스터마이징]
        OB3 --> OB4[4. 테스트 이슈 생성\nAI 분석 결과 확인]
        OB4 --> OB5[5. 코드 생성 엔진 선택\nOpenHands / LLM 직접]
        OB5 --> OB6[6. 알림 채널 연결\nSlack / Teams / Email]
    end

    OB6 --> DASHBOARD

    subgraph DASH [대시보드]
        DASHBOARD[대시보드 홈]
        DASHBOARD --> STATS[통계 카드\nTotal / In-Progress / Completed]
        DASHBOARD --> RECENT[최근 이슈 목록\nPriority + AI 분석 상태]
        DASHBOARD --> ACCURACY[정책 매칭 정확도 트렌드\n목표: 90%]
        DASHBOARD --> INSIGHT[AI Architectural Insight\n자동 인사이트 + 액션 제안]
    end

    STATS -->|클릭| ISSUE_LIST
    RECENT -->|행 클릭| ISSUE_DETAIL

    subgraph ISSUES [이슈 관리]
        ISSUE_LIST[이슈 목록\nDataTable + 필터 + 검색\nPriority / Status / Source / AI 상태]
        ISSUE_LIST -->|행 클릭| ISSUE_DETAIL[이슈 상세]
        ISSUE_LIST -->|+ 새 이슈| ISSUE_CREATE[이슈 생성 폼]
        ISSUE_CREATE --> ISSUE_LIST
    end

    subgraph AI_ANALYSIS [AI 분석 + 코드 생성]
        ISSUE_DETAIL --> AI_PANEL[AI 분석 패널\nMatched Policy + Confidence Score]
        AI_PANEL --> SOLUTION[Suggested Solution\n코드 인라인 포함]
        SOLUTION --> CODE_GEN{코드 생성 시작?}
        CODE_GEN -->|Yes| ENGINE{엔진 선택}
        ENGINE -->|OpenHands| OH[OpenHands PR 생성]
        ENGINE -->|LLM 직접| LLM[LLM 코드 생성 → PR]
        OH --> PR_CREATED[PR 생성 완료\nKafka 이벤트]
        LLM --> PR_CREATED
        CODE_GEN -->|No| MANUAL[수동 처리]
    end

    subgraph POLICY_FAIL [정책 매칭 실패]
        AI_PANEL --> MATCH{정책 매칭 성공?}
        MATCH -->|No| ALERT[관리자에게 정책 추가 알림]
        ALERT --> FALLBACK[LLM 일반 지식으로 방안 제시]
        FALLBACK --> MANUAL_RESOLVE[관리자 수동 처리]
        MANUAL_RESOLVE --> SUGGEST_POLICY[정책 역등록 제안\nAI가 정책 초안 생성]
        SUGGEST_POLICY --> ADMIN_APPROVE{관리자 승인?}
        ADMIN_APPROVE -->|Yes| NEW_POLICY[신규 정책 등록\npgvector 저장]
        ADMIN_APPROVE -->|No| DISCARD[폐기]
    end

    subgraph APPROVAL [승인 워크플로우]
        PR_CREATED --> APPROVAL_PAGE[승인 페이지\nAI Review Summary + Changed Files]
        APPROVAL_PAGE --> APPROVE{관리자 판단}
        APPROVE -->|승인| MERGE[PR 머지]
        APPROVE -->|거절| REJECT_REASON{거절 사유}
        REJECT_REASON -->|코드 수정| CODE_GEN
        REJECT_REASON -->|정책 수정| POLICY_EDIT[정책 수정 → 재분석]
        POLICY_EDIT --> AI_PANEL
    end

    subgraph POLICY_MGMT [정책 관리]
        DASHBOARD -->|사이드바| POLICY_LIST[정책 목록\n이름 / 카테고리 / 상태 / 매칭 수]
        POLICY_LIST --> POLICY_CREATE[정책 생성/편집\n텍스트 → 청킹 → 임베딩 → pgvector]
        POLICY_LIST --> POLICY_SUGGEST[역등록 제안 탭\nAI 제안 목록]
    end

    subgraph INTEGRATION [연동 설정]
        DASHBOARD -->|사이드바| INTEG_PAGE[연동 설정 페이지]
        INTEG_PAGE --> SOURCE[이슈 소스 설정\nJira / Notion / GitHub / GitLab]
        INTEG_PAGE --> CHANNEL[알림 채널 설정\nSlack / Teams / Email]
        INTEG_PAGE --> ENGINE_SET[코드 생성 엔진 선택\nOpenHands / LLM 직접]
    end

    subgraph MONITORING [모니터링]
        DASHBOARD -->|사이드바| MONITOR[모니터링 대시보드]
        MONITOR --> SLO[SLO 메트릭\np99 < 2s / 에러율 < 1%]
        MONITOR --> GRAFANA[Grafana 임베드\nPrometheus + Loki + Tempo]
        MONITOR --> ALERTS[최근 알림\nCritical / Warning]
    end

    style START fill:#e1f5fe
    style DASHBOARD fill:#fff3e0
    style ISSUE_DETAIL fill:#f3e5f5
    style AI_PANEL fill:#e8f5e9
    style PR_CREATED fill:#ffebee
    style APPROVAL_PAGE fill:#fce4ec
```

## Bounded Autonomy (자율/승인 경계)

| 상황 | AI 자율 수행 | 관리자 승인 필요 |
|------|-------------|----------------|
| 이슈 분석 + 정책 매칭 | ✅ | |
| 해결 방안 도출 | ✅ | |
| 코드 생성 (PR 생성) | ✅ | |
| PR 머지 | | ✅ 반드시 승인 |
| 정책 자동 수정/추가 | | ✅ 반드시 승인 |
| 외부 시스템 변경 | | ✅ 반드시 승인 |
