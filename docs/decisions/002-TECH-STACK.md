---
Status: Accepted
Date: 2026-03-21
---

# ADR-002: 기술 스택 선정

## Context (배경)

IssueHub는 사내 이슈 통합 및 자동화 플랫폼으로, Jira/GitHub/Slack 등 분산된 이슈 소스를 하나의 대시보드로 통합하고 규칙 기반 자동화와 RAG 기반 AI 기능을 제공한다.

초기 설계에서는 Kafka, Keycloak, pgvector 등을 Phase 1부터 도입하는 것으로 계획했으나, 전문가 패널 리뷰를 통해 **초기 단계의 인프라 복잡도를 낮추고 실제 필요 시점에 맞춰 점진적으로 도입**하는 방향으로 기술 스택을 재조정하게 되었다.

핵심 고려사항:
- 4-5명의 소규모 팀이 33주(약 8개월) 내에 Phase 1을 완성해야 함
- 초기에 불필요한 인프라 운영 부담을 줄여 핵심 비즈니스 로직 개발에 집중해야 함
- 향후 규모 확장 시 유연하게 기술을 교체할 수 있는 구조가 필요함

## Decision (결정)

### 기술 스택 재조정 (전문가 권고 반영)

| 기술 | 기존 계획 | 변경 사항 |
| --- | --- | --- |
| **Kafka** | Phase 1부터 이벤트 브로커로 사용 | Phase 1-2: Spring ApplicationEvent + @Async 사용. Phase 2 후반: Redis Streams 전환. Kafka는 대규모 확장 시에만 도입 |
| **Keycloak** | Phase 1부터 인증 서버로 사용 | Phase 1: Spring Security + 자체 JWT 인증. Keycloak은 SSO 요구가 있는 Phase 3에서 도입 |
| **pgvector** | Phase 1부터 PostgreSQL 확장 활성화 | Phase 1에서 제외. Phase 3 RAG 기능 도입 시에만 활성화 |
| **검색 엔진** | PostgreSQL FTS | OpenSearch (로컬 Docker) 사용. nori 플러그인으로 한국어 형태소 분석 지원 |

### 인프라 구성 (확정)

> 전문가 패널 리뷰 후 확정된 인프라 전략

| 서비스 | 위치 | 제공자 | 사유 |
| --- | --- | --- | --- |
| **PostgreSQL** | 원격 (클라우드) | Aiven 무료 플랜 (5 GB) | 원본 데이터 보존, 로컬 환경 충돌 방지 |
| **Redis** | 원격 (클라우드) | Upstash 무료 플랜 (256 MB) | 캐시/세션, 유실 방지 |
| **OpenSearch** | 로컬 Docker | 자체 운영 | 검색 인덱스용, 유실 시 PostgreSQL에서 재빌드 가능 |

### 백업 전략

| 항목 | 방법 |
| --- | --- |
| **PostgreSQL** | `pg_dump` + GitHub Actions 자동화 (일 1회) |
| **Redis** | Upstash 자체 관리 (캐시 데이터이므로 유실 허용) |
| **OpenSearch** | 백업 불필요 (PostgreSQL에서 인덱스 재생성 가능) |

**결과**: 원격 인프라는 **Aiven PostgreSQL + Upstash Redis**, 로컬 인프라는 **OpenSearch (Docker)** 로 구성한다.

## Consequences (결과)

### 긍정적 결과

- **인프라 복잡도 감소**: Phase 1에서 운영해야 할 외부 인프라가 PostgreSQL, Redis 2개로 최소화됨
- **비용 절감**: Aiven 무료 플랜과 Upstash 무료 플랜을 활용하여 초기 인프라 비용이 거의 없음
- **개발 집중**: Kafka/Keycloak 설정 및 운영 부담 없이 핵심 비즈니스 로직 개발에 집중 가능
- **점진적 확장**: 각 Phase에서 실제 필요가 검증된 시점에만 기술을 추가하므로 과잉 엔지니어링 방지
- **데이터 안전성**: 원본 데이터는 원격 클라우드에, 검색 인덱스는 로컬에 두어 유실 시 재빌드 가능한 구조

### 부정적 결과 및 제약

- **Phase 전환 시 마이그레이션 비용**: Spring ApplicationEvent에서 Redis Streams로, 자체 JWT에서 Keycloak으로의 전환 시 코드 변경 필요
- **무료 플랜 한계**: Aiven 5GB, Upstash 256MB 제한으로 데이터 증가 시 유료 전환 필요
- **한국어 검색 품질**: OpenSearch nori 플러그인의 형태소 분석 품질이 상용 서비스 대비 제한적일 수 있음
- **로컬 Docker 의존**: OpenSearch가 로컬 Docker에서 운영되므로 개발 환경 설정이 필요함

## PII 마스킹 전략

### Context
외부 플랫폼(Jira, GitHub)에서 웹훅으로 유입되는 데이터에 개인정보(PII)가 포함될 수 있다. 마스킹 시점과 방식에 대한 아키텍처 결정이 필요하다.

### Decision
- **마스킹 시점**: DB 저장 전 (in-flight) 마스킹을 원칙으로 한다
- **구현 위치**: `core-issue` 도메인 내 `PiiSanitizer` 포트 인터페이스 정의, 인바운드 어댑터에서 저장 전 호출
- **마스킹 대상**: 주민등록번호, 전화번호, 이메일 주소, 신용카드 번호 등 정규식 기반 탐지
- **원본 보존**: 마스킹된 원본은 별도 암호화 저장소에 보관하지 않음 (비가역 마스킹)
- **Phase 3 확장**: RAG AI 정책 위반 감지와 연계하여 실시간 PII 탐지 강화

### Consequences
- 장점: 데이터 유출 시에도 PII 노출 방지, 개인정보보호법(PIPA) 준수
- 단점: 마스킹된 데이터는 복원 불가, 외부 플랫폼 원본과 내용 차이 발생 가능
