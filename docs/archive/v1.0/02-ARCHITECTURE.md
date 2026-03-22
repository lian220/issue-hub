# IssueHub - 시스템 아키텍처

> 문서 버전: 1.1
> 최종 수정일: 2026-03-21
> 작성자: IssueHub 개발팀
> 상태: 전문가 패널 피드백 반영

---

## 1. 기술 스택

| 계층 | 기술 | 버전 | 용도 |
|------|------|------|------|
| **Backend** | Kotlin + Spring Boot | 3.x | REST API, 비즈니스 로직, 이벤트 처리 |
| **Frontend** | Next.js (App Router) | 14.x | 사용자 인터페이스, SSR/CSR |
| **Database** | PostgreSQL + pgvector | 16+ | 데이터 저장, 전문 검색, 벡터 유사도 검색 |
| **Cache** | Redis | 7.x | 세션 캐시, Pub/Sub, SSE 이벤트 분산 |
| **이벤트 처리** | Phase 1-2: Spring Event + @Async / Phase 2+: Redis Streams / 대규모: Kafka | - | 비동기 이벤트 처리, 커넥터 동기화 |
| **Auth** | Phase 1: Spring Security + JWT / Phase 3+: Keycloak (SSO 필요 시) | - | 인증, 사용자 관리 |
| **Search** | PostgreSQL FTS + GIN | - | 이슈/정책 전문 검색 |
| **Vector DB** | pgvector (PostgreSQL 확장) | 0.7+ | 임베딩 저장, 유사도 검색 |
| **Migration** | Flyway | 10.x | 데이터베이스 스키마 버전 관리 |
| **Container** | Docker, Docker Compose | - | 로컬 개발 및 배포 |

> **참고**: Phase 1 초기 인프라는 PostgreSQL + Redis 2개 서비스만으로 시작한다. Kafka, Keycloak 등은 필요 시점에 점진적으로 도입한다.

---

## 2. 시스템 아키텍처 다이어그램

```
┌──────────────────────────────────────────────────────────────────────┐
│                         클라이언트 계층                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  웹 브라우저   │  │  Slack Bot   │  │  Teams Bot   │  │ Discord Bot │ │
│  │  (Next.js)   │  │              │  │              │  │             │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬─────┘ │
└─────────┼──────────────────┼──────────────────┼─────────────────────┘
          │ HTTPS            │ HTTPS            │ HTTPS
          ▼                  ▼                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       API Gateway / Reverse Proxy                    │
│                          (Nginx / Traefik)                           │
└──────────┬──────────────────┬──────────────────┬─────────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        애플리케이션 계층                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    app-api (Spring Boot)                       │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │  │
│  │  │ Issue    │ │ Policy   │ │Automation│ │ Webhook          │ │  │
│  │  │ REST API │ │ REST API │ │ REST API │ │ Controllers      │ │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────────────┘ │  │
│  │       │             │            │             │               │  │
│  │  ┌────▼─────────────▼────────────▼─────────────▼────────────┐ │  │
│  │  │              Port / Adapter Layer                         │ │  │
│  │  │    (Inbound Ports → Use Cases → Outbound Ports)          │ │  │
│  │  └────┬─────────────┬────────────┬─────────────┬────────────┘ │  │
│  └───────┼─────────────┼────────────┼─────────────┼──────────────┘  │
│          │             │            │             │                  │
│  ┌───────▼─────────────▼────────────▼─────────────▼──────────────┐  │
│  │                   Core Domain Layer                            │  │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────┐ │  │
│  │  │ core-issue │ │core-policy │ │core-automation│ │core-     │ │  │
│  │  │            │ │            │ │               │ │connector │ │  │
│  │  └────────────┘ └────────────┘ └──────────────┘ └──────────┘ │  │
│  └───────┬─────────────┬────────────┬─────────────┬──────────────┘  │
│          │             │            │             │                  │
│  ┌───────▼─────────────▼────────────▼─────────────▼──────────────┐  │
│  │                Infrastructure Layer                            │  │
│  │  ┌──────────────┐ ┌──────────┐ ┌──────────────┐              │  │
│  │  │infra-        │ │infra-    │ │infra-webhook │              │  │
│  │  │persistence   │ │event     │ │              │              │  │
│  │  └──────┬───────┘ └────┬─────┘ └──────────────┘              │  │
│  └─────────┼──────────────┼──────────────────────────────────────┘  │
│            │              │                                         │
│  ┌─────────┼──────────────┼───────────────────────────────────┐    │
│  │         │  app-scheduler (Spring Boot)                      │    │
│  │         │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │    │
│  │         │  │ SLA      │ │ Sync     │ │ Policy Expiry    │  │    │
│  │         │  │ Checker  │ │ Poller   │ │ Checker          │  │    │
│  │         │  └──────────┘ └──────────┘ └──────────────────┘  │    │
│  └─────────┼──────────────┼───────────────────────────────────┘    │
└────────────┼──────────────┼────────────────────────────────────────┘
             │              │
             ▼              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     데이터 계층 (Phase 1)                              │
│  ┌──────────────┐  ┌──────────────┐                                  │
│  │ PostgreSQL   │  │    Redis     │  Phase 3+: Keycloak 추가          │
│  │              │  │  (Cache/     │  Phase 4+: Kafka 추가 (대규모 시)  │
│  │              │  │   Pub/Sub)   │                                   │
│  └──────────────┘  └──────────────┘                                  │
└──────────────────────────────────────────────────────────────────────┘

             ▲              ▲              ▲              ▲
             │              │              │              │
┌──────────────────────────────────────────────────────────────────────┐
│                      외부 서비스 계층                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  Jira    │  │  GitHub  │  │  Slack   │  │  Teams   │  │ Discord ││
│  │  Cloud   │  │  Cloud   │  │  API     │  │  Graph   │  │ API     ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. 백엔드/프론트엔드 분리 전략

### 3.1 분리 원칙

| 항목 | 백엔드 (Spring Boot) | 프론트엔드 (Next.js) |
|------|---------------------|---------------------|
| **역할** | 비즈니스 로직, 데이터 처리, 외부 연동 | 사용자 인터페이스, 상호작용 |
| **통신** | REST API 제공 (JSON) | REST API 소비 + SSE 수신 |
| **인증** | JWT 발급/검증 | JWT 저장/전송 (httpOnly cookie) |
| **배포** | 독립 컨테이너 (포트 8080) | 독립 컨테이너 (포트 3000) |
| **상태 관리** | Stateless (세션 없음) | 클라이언트 상태 (React Query) |

### 3.2 API 계약

- OpenAPI 3.0 명세 기반 API 계약 유지
- 프론트엔드는 `openapi-typescript-codegen`으로 타입 자동 생성
- 버전 관리: URI 기반 (`/api/v1/...`)

---

## 4. 모듈 구조

```
backend/
├── core-domain/           -- 순수 도메인 모델 (Spring 의존성 없음)
│   ├── model/             -- 도메인 엔티티 (Issue, Policy, User 등)
│   ├── event/             -- 도메인 이벤트 정의
│   └── exception/         -- 도메인 예외
│
├── core-issue/            -- 이슈 비즈니스 로직
│   ├── port/in/           -- Inbound 포트 (UseCase 인터페이스)
│   ├── port/out/          -- Outbound 포트 (Repository, EventPublisher)
│   ├── service/           -- UseCase 구현체
│   └── event/             -- 이슈 도메인 이벤트 핸들러
│
├── core-policy/           -- 정책 관리 로직
│   ├── port/in/           -- 정책 CRUD, 승인 워크플로우 UseCase
│   ├── port/out/          -- 정책 Repository, 알림 포트
│   ├── service/           -- 정책 서비스 구현
│   └── workflow/          -- 승인 워크플로우 상태 머신
│
├── core-automation/       -- 자동화 규칙 엔진
│   ├── engine/            -- 규칙 평가 엔진 (트리거/조건/액션)
│   ├── sla/               -- SLA 정책 평가, 에스컬레이션
│   ├── port/              -- 자동화 포트 정의
│   └── service/           -- 자동화 서비스 구현
│
├── core-connector/        -- 연동 커넥터 프레임워크
│   ├── framework/         -- 커넥터 추상화 (ConnectorAdapter 인터페이스)
│   ├── jira/              -- Jira 커넥터 구현
│   ├── github/            -- GitHub 커넥터 구현
│   ├── slack/             -- Slack 커넥터 구현
│   ├── teams/             -- Teams 커넥터 구현
│   ├── discord/           -- Discord 커넥터 구현
│   └── sync/              -- 동기화 엔진 (충돌 해결 포함)
│
├── infra-persistence/     -- JPA 엔티티, 레포지토리
│   ├── entity/            -- JPA @Entity 클래스
│   ├── repository/        -- Spring Data JPA Repository
│   ├── mapper/            -- 도메인 ↔ 엔티티 매퍼
│   └── migration/         -- Flyway 마이그레이션 SQL
│       └── db/migration/  -- V1__init.sql, V2__add_policies.sql ...
│
├── infra-event/           -- 이벤트 발행/구독 (Phase 1: Spring Event, Phase 2+: Redis Streams)
│   ├── publisher/         -- 이벤트 발행
│   ├── listener/          -- 이벤트 구독 및 처리
│   └── config/            -- 이벤트 설정
│
├── infra-webhook/         -- 웹훅 수신 컨트롤러
│   ├── controller/        -- Jira, GitHub, Slack, Teams, Discord 웹훅 엔드포인트
│   ├── verification/      -- HMAC 서명 검증
│   └── parser/            -- 플랫폼별 페이로드 파서
│
├── app-api/               -- REST API 서버 (Spring Boot 메인)
│   ├── controller/        -- REST 컨트롤러
│   ├── dto/               -- 요청/응답 DTO
│   ├── sse/               -- SSE 이벤트 스트림 관리
│   ├── security/          -- JWT 필터, 권한 설정
│   └── config/            -- 애플리케이션 설정
│
└── app-scheduler/         -- 스케줄 작업
    ├── sla/               -- SLA 위반 체크 스케줄러
    ├── sync/              -- 동기화 폴링 스케줄러
    └── policy/            -- 정책 만료 체크 스케줄러

frontend/
└── Next.js 14 App Router
    ├── app/               -- 라우트 구조
    │   ├── (auth)/        -- 인증 관련 페이지
    │   ├── dashboard/     -- 대시보드
    │   ├── issues/        -- 이슈 관리
    │   ├── policies/      -- 정책 관리
    │   ├── automation/    -- 자동화 규칙
    │   ├── connectors/    -- 연동 설정
    │   └── settings/      -- 시스템 설정
    ├── components/        -- 공통 UI 컴포넌트
    ├── lib/               -- API 클라이언트, 유틸리티
    ├── hooks/             -- 커스텀 React Hooks
    └── types/             -- TypeScript 타입 정의
```

---

## 5. 헥사고날 아키텍처 (포트/어댑터 패턴)

### 5.1 개요

IssueHub 백엔드는 헥사고날 아키텍처(Ports and Adapters)를 채택한다.
비즈니스 로직이 인프라 기술에 의존하지 않도록 분리하여, 테스트 용이성과 유연성을 확보한다.

```
                    ┌─────────────────────┐
                    │   Inbound Adapters  │
                    │  (REST Controller,  │
                    │   Webhook Handler,  │
                    │   Event Listener)   │
                    └────────┬────────────┘
                             │
                    ┌────────▼────────────┐
                    │   Inbound Ports     │
                    │  (UseCase 인터페이스) │
                    └────────┬────────────┘
                             │
                    ┌────────▼────────────┐
                    │   Application       │
                    │   Services          │
                    │  (UseCase 구현)      │
                    └────────┬────────────┘
                             │
                    ┌────────▼────────────┐
                    │   Domain Model      │
                    │  (순수 Kotlin 객체)   │
                    └────────┬────────────┘
                             │
                    ┌────────▼────────────┐
                    │   Outbound Ports    │
                    │  (Repository,       │
                    │   EventPublisher,   │
                    │   ExternalAPI)      │
                    └────────┬────────────┘
                             │
                    ┌────────▼────────────┐
                    │  Outbound Adapters  │
                    │  (JPA Repository,   │
                    │   Event Publisher,  │
                    │   REST Client)      │
                    └─────────────────────┘
```

### 5.2 계층별 규칙

| 계층 | 의존성 규칙 | 예시 |
|------|------------|------|
| **core-domain** | 외부 의존성 없음. 순수 Kotlin | `data class Issue(...)` |
| **core-*  모듈** | core-domain만 의존. Spring 의존성 없음 | `interface IssueRepository` |
| **infra-* 모듈** | core 포트 구현. Spring/JPA 의존 | `class JpaIssueRepository : IssueRepository` |
| **app-* 모듈** | 모든 모듈 의존. Spring Boot 진입점 | `@RestController class IssueController` |

### 5.3 의존성 방향

```
app-api ──→ core-issue ──→ core-domain
  │              │
  │              └──→ port/out/ (인터페이스)
  │                       ▲
  └──→ infra-persistence ─┘ (구현)
```

핵심 원칙: **의존성은 항상 안쪽(도메인 방향)으로 향한다.**

---

## 6. 데이터 흐름도

### 6.1 이슈 동기화 흐름 (Webhook 기반)

```
Jira/GitHub                IssueHub
    │                         │
    │  1. Webhook POST        │
    │ ──────────────────────► │
    │                    ┌────▼────────────┐
    │                    │ infra-webhook   │
    │                    │ (HMAC 검증)      │
    │                    └────┬────────────┘
    │                         │ 2. 검증 성공
    │                    ┌────▼────────────┐
    │                    │ Event Publisher │
    │                    │ (Spring Event   │
    │                    │  + @Async)      │
    │                    └────┬────────────┘
    │                         │ 3. 비동기 처리
    │                    ┌────▼────────────┐
    │                    │ Event Listener  │
    │                    │ (Connector      │
    │                    │  Service)       │
    │                    └────┬────────────┘
    │                         │ 4. 필드 매핑 및 정규화
    │                    ┌────▼────────────┐
    │                    │ Issue Service   │
    │                    │ (도메인 로직)     │
    │                    └────┬────────────┘
    │                         │ 5. 저장
    │                    ┌────▼────────────┐
    │                    │ PostgreSQL      │
    │                    │ (이슈 저장)      │
    │                    └────┬────────────┘
    │                         │ 6. 이벤트 발행
    │                    ┌────▼────────────┐
    │                    │ Redis Pub/Sub   │
    │                    └────┬────────────┘
    │                         │ 7. 실시간 푸시
    │                    ┌────▼────────────┐
    │                    │ SSE 브로드캐스트 │
    │                    │ → 웹 브라우저    │
    │                    └────────────────┘
```

### 6.2 자동화 실행 흐름

```
이벤트 소스                자동화 엔진
    │                         │
    │  1. 이벤트 발생          │
    │  (이슈 생성/변경 등)     │
    │ ──────────────────────► │
    │                    ┌────▼────────────┐
    │                    │ Spring Event    │
    │                    │ (ApplicationEvent│
    │                    │  + @Async)      │
    │                    └────┬────────────┘
    │                         │ 2. 규칙 평가
    │                    ┌────▼────────────┐
    │                    │ Rule Evaluator  │
    │                    │ - 트리거 매칭     │
    │                    │ - 조건 평가       │
    │                    └────┬────────────┘
    │                         │ 3. 매칭된 규칙 실행
    │                    ┌────▼────────────┐
    │                    │ Action Executor │
    │                    │ - 담당자 배정     │
    │                    │ - 라벨 추가      │
    │                    │ - 상태 변경      │
    │                    │ - 알림 발송      │
    │                    └────┬────────────┘
    │                         │ 4. 결과 처리
    │                    ┌────▼────────────┐
    │                    │ 알림 서비스      │
    │                    │ - Slack 메시지   │
    │                    │ - Teams 카드     │
    │                    │ - Discord Embed  │
    │                    │ - 이메일         │
    │                    └────────────────┘
```

### 6.3 정책 워크플로우

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  DRAFT   │───►│  REVIEW  │───►│ APPROVED │───►│ PUBLISHED│
│  (작성)   │    │  (검토)   │    │  (승인)   │    │  (게시)   │
└──────────┘    └────┬─────┘    └──────────┘    └────┬─────┘
                     │                                │
                     │ 반려                            │ 만료
                     ▼                                ▼
                ┌──────────┐                    ┌──────────┐
                │ REJECTED │                    │ EXPIRED  │
                │  (반려)   │                    │  (만료)   │
                └──────────┘                    └──────────┘

게시 후 흐름:
  PUBLISHED → 읽음 확인 추적
            → AI 임베딩 생성 (RAG용)
            → 위반 감지 시 이슈 자동 생성
            → 만료일 도래 시 갱신 알림
```

---

## 7. 실시간 아키텍처

### 7.1 SSE (Server-Sent Events) 기반 실시간 업데이트

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Service A    │     │  Service B    │     │  Service C    │
│ (이슈 변경)    │     │ (동기화 완료)  │     │ (자동화 실행)  │
└──────┬────────┘     └──────┬────────┘     └──────┬────────┘
       │                     │                     │
       └─────────┬───────────┘─────────────────────┘
                 │ PUBLISH
          ┌──────▼──────┐
          │ Redis       │
          │ Pub/Sub     │
          │ (channel:   │
          │  sse-events)│
          └──────┬──────┘
                 │ SUBSCRIBE
          ┌──────▼──────┐
          │ SSE         │
          │ Emitter     │
          │ (app-api)   │
          └──────┬──────┘
                 │ EventSource
       ┌─────────┴─────────────────┐
       │                           │
┌──────▼──────┐            ┌──────▼──────┐
│ Browser A   │            │ Browser B   │
│ (사용자 1)   │            │ (사용자 2)   │
└─────────────┘            └─────────────┘
```

### 7.2 SSE 이벤트 타입

| 이벤트 타입 | 페이로드 | 설명 |
|------------|----------|------|
| `issue.created` | Issue 요약 | 새 이슈 생성됨 |
| `issue.updated` | 변경 필드 목록 | 이슈 필드 변경됨 |
| `issue.status_changed` | 이전/이후 상태 | 이슈 상태 전이 |
| `issue.comment_added` | 댓글 요약 | 새 댓글 추가됨 |
| `sync.completed` | 커넥터, 동기화 건수 | 동기화 작업 완료 |
| `automation.executed` | 규칙, 실행 결과 | 자동화 규칙 실행됨 |
| `policy.published` | 정책 요약 | 정책 게시됨 |
| `sla.warning` | 이슈, 남은 시간 | SLA 위반 임박 |
| `sla.breached` | 이슈, 위반 상세 | SLA 위반됨 |

---

## 8. 보안 아키텍처

### 8.1 인증 흐름 (Phase 1: Spring Security + JWT)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Browser  │     │ Next.js  │     │ app-api  │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │ 1. 로그인 요청   │                │
     │ ──────────────►│                │
     │                │ 2. 로그인 API   │
     │                │  (email/pw)    │
     │                │ ──────────────►│
     │                │                │
     │                │ 3. JWT 발급    │
     │                │  (Access +     │
     │                │   Refresh)     │
     │                │ ◄──────────────│
     │                │                │
     │ 4. JWT를 cookie에 저장          │
     │ ◄──────────────│                │
     │                │                │
     │ 5. API 호출 (Authorization: Bearer JWT)
     │ ───────────────────────────────►│
     │                │                │
     │                │   6. JWT 검증  │
     │                │   (자체 검증)   │
     │                │                │
     │ 7. 응답                         │
     │ ◄───────────────────────────────│
```

> **Phase 3+ 전환**: SSO가 필요해지면 Keycloak를 도입하여 OAuth2/OIDC 기반 인증으로 전환한다. 이때 app-api의 JWT 검증 로직은 Keycloak 발급 토큰 검증으로 교체된다.

### 8.2 보안 구성 요소

| 구성 요소 | 기술 | 설명 |
|-----------|------|------|
| **사용자 인증** | Phase 1: Spring Security + JWT / Phase 3+: Keycloak | 자체 인증 → SSO 전환 |
| **API 인증** | JWT Bearer Token | Stateless API 인증, 역할 기반 인가 |
| **토큰 암호화** | AES-256-GCM | 외부 플랫폼 OAuth 토큰을 DB에 암호화 저장 |
| **웹훅 검증** | HMAC-SHA256 / Ed25519 | Jira, GitHub, Slack 웹훅 HMAC 검증, Discord Interaction Ed25519 서명 검증 |
| **데이터 전송** | TLS 1.2+ | 모든 외부 통신 암호화 |
| **CORS** | Origin 화이트리스트 | 허용된 프론트엔드 Origin만 API 접근 |
| **Rate Limiting** | Redis 기반 | 인증 사용자 분당 100회, 비인증 분당 20회 |

### 8.3 OAuth 토큰 관리

```
외부 플랫폼 OAuth 토큰 저장 흐름:

1. 사용자가 UI에서 Jira/GitHub OAuth 인증 완료
2. Callback으로 access_token, refresh_token 수신
3. AES-256-GCM으로 암호화
4. connector_configs.credentials (BYTEA) 컬럼에 저장
5. 사용 시 복호화 → API 호출 → 사용 후 메모리 즉시 폐기
6. 토큰 만료 시 refresh_token으로 자동 갱신
```

---

## 9. 배포 아키텍처

### 9.1 Docker Compose (개발/소규모 배포)

```yaml
# Phase 1 서비스 구성 (최소 인프라: 2개 외부 서비스)
services:
  - app-api        (Spring Boot, 포트 8080)
  - app-scheduler  (Spring Boot, 내부)
  - frontend       (Next.js, 포트 3000)
  - postgresql     (포트 5432)
  - redis          (포트 6379)

# Phase 3+ 추가 서비스
#  - keycloak       (포트 8180, SSO 필요 시)
# Phase 4+ 추가 서비스
#  - kafka          (포트 9092, 일 수만 건 이상 시)
#  - zookeeper      (포트 2181, Kafka 사용 시)
```

### 9.2 환경 분리

| 환경 | 용도 | 특징 |
|------|------|------|
| **local** | 로컬 개발 | Docker Compose, Hot Reload |
| **dev** | 개발 서버 | 공유 개발 환경, 테스트 데이터 |
| **staging** | 스테이징 | 운영과 동일 구성, 검증용 |
| **production** | 운영 | 고가용성, 모니터링, 백업 |

---

## 10. 단계별 인프라 진화

초기에는 최소한의 인프라로 시작하여, 실제 필요에 따라 점진적으로 확장한다.

### Phase 1: PostgreSQL + Redis (2개)

| 영역 | 기술 | 비고 |
|------|------|------|
| **이벤트** | Spring ApplicationEvent + @Async | 프로세스 내 비동기 처리 |
| **인증** | Spring Security + 자체 JWT | 별도 인프라 불필요 |
| **검색** | PostgreSQL LIKE + 기본 인덱스 | B-tree 인덱스 활용 |

### Phase 2: PostgreSQL + Redis (2개, 기능 확장)

| 영역 | 기술 | 비고 |
|------|------|------|
| **이벤트** | Redis Streams (이벤트 영속성 필요 시) | 이벤트 재처리, 컨슈머 그룹 지원 |
| **인증** | 그대로 (Spring Security + JWT) | 변경 없음 |
| **검색** | PostgreSQL FTS (GIN 인덱스) | 한국어 형태소 분석 포함 |

### Phase 3: PostgreSQL + Redis + Keycloak (3개)

| 영역 | 기술 | 비고 |
|------|------|------|
| **확장** | pgvector 확장 활성화 | RAG 기반 유사 이슈/정책 검색 |
| **인증** | Keycloak 도입 (SSO 필요 시) | OAuth2/OIDC, 소셜 로그인 |

### Phase 4+: 필요 시 Kafka 도입

| 조건 | 기술 | 비고 |
|------|------|------|
| 일 수만 건 이상 이벤트 | Apache Kafka | 대규모 비동기 처리, 이벤트 소싱 |

---

## 11. 모니터링 및 관찰성 (Phase 1부터)

관찰성은 Phase 1부터 기본 수준을 확보하고, 단계적으로 확장한다.

### Phase 1: 기본 관찰성

| 영역 | 기술 | 설명 |
|------|------|------|
| **구조화 로깅** | Logback + JSON encoder | JSON 형식 로그 출력, 파싱 용이 |
| **상관 ID** | MDC (Mapped Diagnostic Context) | 요청 단위 추적 ID 전파 |
| **헬스체크** | Spring Actuator | `/actuator/health`, `/actuator/info`, `/actuator/metrics` |

### Phase 2: 메트릭 수집 및 시각화

| 영역 | 기술 | 설명 |
|------|------|------|
| **메트릭** | Micrometer (Spring Boot 기본 포함) | JVM, API 응답 시간, 커스텀 비즈니스 메트릭 |
| **수집** | Prometheus | 메트릭 스크래핑 및 저장 |
| **시각화** | Grafana 대시보드 | API 성능, 에러율, SLA 현황 대시보드 |

### Phase 3: 분산 추적 및 알림

| 영역 | 기술 | 설명 |
|------|------|------|
| **분산 추적** | Micrometer Tracing | 서비스 간 요청 흐름 추적, 병목 식별 |
| **알림** | Alertmanager | SLA 위반, 에러율 임계치, 인프라 이상 알림 |

### Phase 4: 집중 로그 수집

| 영역 | 기술 | 설명 |
|------|------|------|
| **로그 집중** | Loki 또는 ELK | 전체 서비스 로그 통합 수집 및 검색 |

---

## 12. CI/CD 파이프라인

### Phase 1 (최소)

```
PR 생성
  └─► Lint + Build + Unit Test
       └─► Code Review
            └─► Merge (Main)
                 └─► Docker Image Build
                      └─► Dev 환경 자동 배포
```

### Phase 2 (확장)

```
PR 생성
  └─► Lint + Build + Unit Test
       └─► Integration Test (TestContainers)
            └─► Code Review
                 └─► Merge (Main)
                      └─► Docker Image Build
                           ├─► Dev 환경 자동 배포
                           └─► Staging 환경 자동 배포

+ OpenAPI 명세 자동 생성/검증 (PR 단계에서 스키마 변경 감지)
```

### Phase 4 (완성)

```
PR 생성
  └─► Lint + Build + Unit Test
       └─► Integration Test (TestContainers)
            └─► E2E 테스트 (Playwright)
                 └─► Code Review
                      └─► Merge (Main)
                           └─► Docker Image Build
                                └─► 부하 테스트 게이트
                                     ├─► Dev 환경 자동 배포
                                     ├─► Staging 환경 자동 배포
                                     └─► Production 배포 (수동 승인 → 자동 실행)
```

---

## 13. 보안 아키텍처 강화

### 13.1 감사 로그 보관

| 항목 | 정책 | 비고 |
|------|------|------|
| **온라인 보관** | 1년 | 즉시 조회 가능 (PostgreSQL) |
| **아카이브 보관** | 5년 | 규제 산업 대응, 콜드 스토리지 |

### 13.2 개인정보 보호

| 항목 | 설명 |
|------|------|
| **PII 자동 탐지** | 이슈 description 내 개인정보 패턴 자동 탐지 (이메일, 전화번호, 주민번호 등) |
| **마스킹 파이프라인** | 탐지된 PII를 저장 전 자동 마스킹 처리 |
| **감사 추적** | PII 접근 이력 별도 로깅 |

### 13.3 토큰 및 키 관리

| 항목 | 정책 | 비고 |
|------|------|------|
| **ENCRYPTION_KEY 로테이션** | 90일 주기 | 기존 데이터 재암호화 마이그레이션 포함 |
| **OAuth refresh_token** | 자동 갱신 | 만료 전 선제적 갱신 처리 |

### 13.4 세션 관리

| 항목 | 값 | 비고 |
|------|------|------|
| **Access Token 유효기간** | 30분 | 짧은 수명으로 탈취 위험 최소화 |
| **Refresh Token 유효기간** | 7일 | Access Token 재발급용 |
| **동시 로그인 제한** | 3기기 | 초과 시 가장 오래된 세션 만료 |

### 13.5 API Rate Limiting

| 대상 | 제한 | 비고 |
|------|------|------|
| **인증 사용자** | 분당 100회 | Redis 기반 슬라이딩 윈도우 |
| **비인증 사용자** | 분당 20회 | IP 기반 제한 |
