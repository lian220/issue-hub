---
Status: Accepted
Date: 2026-04-17
---

# 008: 자율 코딩 에이전트 선정 (OpenHands)

## Context

IssueHub는 이슈 → 자동 코드 생성 → PR 흐름을 제공한다. 이를 위해 "자율 코딩 에이전트(Autonomous SWE Agent)"가 필요하다. 직접 구현 vs 외부 엔진 위임을 판단하기 위해 현재 시장의 주요 후보군을 조사했다.

에이전트의 역할 범위는 다음과 같이 명확히 분리한다.

| 레이어 | 담당 | 구현 방식 |
|--------|------|-----------|
| 코드 인덱싱/검색 | IssueHub 내부 | 직접 구현 (bare clone + tree-sitter + pgvector) |
| 자동 코딩 실행 | 외부 에이전트 | 본 ADR에서 선정 |

## Decision

**OpenHands (구 OpenDevin)를 기본 자율 코딩 에이전트로 채택**한다. IssueHub는 OpenHands를 REST API 및 MCP로 호출하고, 결과(diff, 실행 로그)를 수신하는 오케스트레이터 역할만 수행한다.

## 후보군 조사

### 오픈소스 (자체호스팅 가능)

| 툴 | 특징 | 라이선스 | 샌드박스 |
|----|------|----------|----------|
| **OpenHands** | ACI(Agent-Computer Interface), REST API + MCP, Docker 실행 환경 | MIT | Docker |
| **SWE-agent** (Princeton) | SWE-bench 원조, ACI 설계 연구 기반 | MIT | Docker |
| **Aider** | 터미널 페어 프로그래밍, git 자동 커밋, repo-map 생성 | Apache-2.0 | 로컬 |
| **Cline** (구 Claude Dev) | VSCode 확장, 파일 편집 + 터미널 | Apache-2.0 | 로컬 |
| **Roo Code** | Cline 포크, 멀티모드(Architect/Code/Ask) | Apache-2.0 | 로컬 |
| **Continue.dev** | IDE 확장 + 에이전트 모드 | Apache-2.0 | 로컬 |
| **MetaGPT** | 멀티 에이전트(PM/Architect/Engineer 역할 분담) | MIT | 로컬 |
| **GPT Engineer / gpt-pilot** | 프로젝트 생성형, 초기 세대 | MIT | 로컬 |
| **Bolt.diy** | WebContainer 기반 풀스택 생성 | MIT | 브라우저 |

### 상용 / SaaS

| 툴 | 특징 | 자체호스팅 |
|----|------|-----------|
| **Devin** (Cognition) | 최초 상용 자율 SWE | ❌ |
| **Cursor Composer** | IDE 통합, 멀티파일 편집 | ❌ |
| **GitHub Copilot Workspace** | 이슈 → 계획 → diff 승인 플로우 | ❌ |
| **Sweep AI** | GitHub 이슈 댓글 트리거 → PR | ❌ (SaaS) / 부분 OSS |
| **Replit Agent** | 풀스택 생성 + 배포 | ❌ |
| **Factory.ai (Droids)** | 엔터프라이즈 자율 개발 | ❌ |
| **Codegen.com** | 대규모 리팩터링 특화 | ❌ |
| **Amazon Q Developer** | AWS 통합 | ❌ |
| **Poolside / Magic.dev** | 자체 모델 학습 코딩 에이전트 | ❌ |

### 벤치마크 기준

SWE-bench Verified 리더보드(https://www.swebench.com/)를 주요 평가 기준으로 삼는다. OpenHands, SWE-agent, Devin, Amazon Q 등이 상위권에서 경쟁 중이다.

## 선정 기준 및 비교

| 기준 | OpenHands | SWE-agent | Aider | Devin | Copilot Workspace |
|------|-----------|-----------|-------|-------|-------------------|
| 오픈소스 | ✅ MIT | ✅ MIT | ✅ Apache-2.0 | ❌ | ❌ |
| 자체호스팅 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 샌드박스 격리 | ✅ Docker | ✅ Docker | ❌ 로컬 | ✅ 클라우드 | ✅ 클라우드 |
| REST API | ✅ | 부분 | ❌ CLI | ✅ | ✅ |
| MCP 지원 | ✅ | ❌ | ❌ | ❌ | ❌ |
| LLM 교체 가능 | ✅ 멀티 프로바이더 | ✅ | ✅ | ❌ | ❌ |
| 벤치마크 순위 | 상위 | 상위 | 중위 | 상위 | 중위 |

## Rationale

OpenHands를 선택한 4가지 이유.

1. **API 통합성**: REST API + MCP를 모두 지원하여 IssueHub에서 호출 계약이 명확하다. SWE-agent는 주로 CLI 중심이고, Aider는 터미널 인터랙티브에 최적화되어 있어 서버 연동이 번거롭다.
2. **샌드박스 격리**: Docker 기반 격리 실행 환경을 기본 제공한다. 로컬 파일 시스템을 직접 건드리지 않아 멀티 테넌트/SaaS 시나리오에 적합하다.
3. **LLM 추상화**: Ollama / Claude / OpenAI / Gemini 등 멀티 프로바이더를 전환 가능. ADR-004(LLM 벤더 교체 전략)와 일관된다.
4. **라이선스**: MIT로 상용 배포 포함 자유롭게 활용 가능.

## Consequences

### Positive

- IssueHub는 "실행 엔진"을 직접 유지보수하지 않아도 된다. 모델/벤치마크 발전을 외부 프로젝트가 흡수한다.
- OpenHands 기본 Docker 이미지를 재사용하여 온보딩 시간이 단축된다.
- MCP 지원으로 IssueHub 내부 도구(유사 이슈 검색, 정책 Q&A 등)를 에이전트 툴로 노출할 수 있다.

### Negative

- OpenHands 버전 릴리스 주기에 IssueHub 호환성이 종속된다. 메이저 API 변경 시 어댑터 수정이 필요하다.
- 실행 시 Docker-in-Docker 또는 별도 Docker 소켓 접근이 필요하다. 보안/운영 복잡도가 증가한다.
- SWE-bench 1위 툴은 시기별로 바뀐다. 분기별 재평가가 필요하다.

### Mitigation

- `infra-coding-agent/` 어댑터 모듈로 감싸 OpenHands 교체 가능성을 확보한다(포트/어댑터 패턴).
- Docker 소켓 접근 권한은 별도 런너 노드로 분리하고, 네트워크 정책으로 격리한다.
- 분기별 SWE-bench 리더보드 리뷰 → 필요 시 SWE-agent 또는 신규 상위 툴로 교체 검토한다.

## 재평가 트리거

다음 상황 발생 시 본 ADR을 재검토한다.

- OpenHands 프로젝트 유지보수 중단 또는 라이선스 변경
- SWE-bench Verified에서 자체호스팅 가능한 타 오픈소스가 OpenHands 대비 20%p 이상 앞섬
- IssueHub가 SaaS-only 모드로 전환 결정 → Devin, Copilot Workspace 등 상용 API 재검토

## References

- [OpenHands GitHub](https://github.com/All-Hands-AI/OpenHands)
- [SWE-bench Leaderboard](https://www.swebench.com/)
- ADR-004: LLM 추상화 및 벤더 교체 전략
- docs/engineering/ARCHITECTURE.md §Code Intelligence
