# IssueHub Documentation

> IssueHub는 이슈 통합/자동화/정책 관리 플랫폼입니다.

## 빠른 시작

| 목적 | 문서 |
|------|------|
| 프로젝트가 뭔지 알고 싶다 | [제품 요구사항 (PRD)](product/PRD.md) |
| 사용자 흐름을 이해하고 싶다 | [사용자 시나리오](product/USER-FLOWS.md) |
| 시스템 구조를 파악하고 싶다 | [시스템 아키텍처](engineering/ARCHITECTURE.md) |
| API를 연동하고 싶다 | [API 명세](engineering/API-SPEC.md) |

## 제품 (Product)

비즈니스 관점의 문서입니다. **"무엇을(What)"** 만드는지 정의합니다.

- [PRD - 제품 요구사항](product/PRD.md): 프로젝트 개요, 기능 요구사항
- [사용자 페르소나](product/USER-PERSONAS.md): 대상 사용자 정의, 역할별 권한
- [사용자 시나리오](product/USER-FLOWS.md): 페르소나별 화면 흐름 (7개 케이스)
- [유스케이스 명세](product/FLOWS-AND-USECASES.md): 상세 유스케이스 정의 (31개 UC, 기본/대안 플로우)
- [비기능 요구사항 + KPI](product/REQUIREMENTS-NONFUNCTIONAL.md): 성능, 보안 요구사항, 성공 지표
- [로드맵](product/ROADMAP.md): Phase 1~4 구현 계획

## 엔지니어링 (Engineering)

기술 관점의 문서입니다. **"어떻게(How)"** 만드는지 설명합니다.

- [시스템 아키텍처](engineering/ARCHITECTURE.md): 기술 스택, 모듈 구조, 배포
- [데이터베이스 설계](engineering/DATABASE.md): ER 다이어그램, 스키마, 인덱스
- [API 명세](engineering/API-SPEC.md): REST API 엔드포인트 상세
- [외부 연동 가이드](engineering/INTEGRATION.md): Jira, GitHub, Slack, Teams, Discord
- [보안 아키텍처](engineering/SECURITY.md): 취약점 분석, OWASP 대응, 보안 로드맵
- [프론트엔드 아키텍처 명세서](engineering/FRONTEND-SPEC.md): 프론트엔드 아키텍처 명세서
- [백엔드 아키텍처 명세서](engineering/BACKEND-SPEC.md): 백엔드 아키텍처 명세서

## 기타

- [MVP 개발 TODO](TODO.md): MVP 개발 TODO
- [AI 코드 분석 플랫폼 설계서](superpowers/specs/2026-03-22-issuehub-ai-code-platform-design.md): AI 코드 분석 플랫폼 설계서

## 의사결정 기록 (Decisions)

주요 기술/전략 결정의 **"왜(Why)"** 를 기록합니다.

- [001: Build vs Buy 분석](decisions/001-BUILD-VS-BUY.md)
- [002: 기술 스택 선정](decisions/002-TECH-STACK.md)
- [003: 인프라 전략](decisions/003-INFRA-STRATEGY.md)
- [004: LLM 추상화 및 벤더 교체 전략](decisions/004-LLM-STRATEGY.md)
- [005: Airflow 도입 전략](decisions/005-AIRFLOW-ADOPTION.md)
- [006: k3d (로컬 Kubernetes) 도입 전략](decisions/006-K3D-ADOPTION.md)

## 아카이브 (Archive)

재편 전 원본 문서를 보관합니다.

- [v1.0 원본 문서](archive/v1.0/): 문서 구조 재편 이전 원본
