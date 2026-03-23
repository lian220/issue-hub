# IssueHub 백엔드 아키텍처 명세서

> 문서 버전: 1.0
> 작성일: 2026-03-23
> 기술 스택: Kotlin + Spring Boot 3.x + Hexagonal Architecture + Gradle Multi-module

---

## 1. 모듈 의존성 그래프

```
app-api ──────┬──→ core-issue ──→ core-domain
              ├──→ core-policy ──→ core-domain
              ├──→ core-automation ──→ core-domain
              ├──→ core-connector ──→ core-domain
              ├──→ core-ai ──→ core-domain
              ├──→ infra-persistence ──→ core-* (outbound port 구현)
              ├──→ infra-webhook ──→ core-connector
              ├──→ infra-llm ──→ core-ai
              └──→ infra-kafka (Phase 2+)

app-scheduler ┬──→ core-automation
              ├──→ core-connector
              └──→ infra-persistence
```

### 의존성 규칙

| 모듈 계층 | 의존 가능 | 의존 금지 |
|-----------|----------|----------|
| `core-domain` | 없음 (순수 Kotlin) | Spring, JPA, 모든 외부 라이브러리 |
| `core-*` | `core-domain`, 다른 `core-*` | `infra-*`, `app-*` |
| `infra-*` | `core-*`, `core-domain` | 다른 `infra-*`, `app-*` |
| `app-*` | `core-*`, `infra-*` | - |

### Gradle 의존성 scope

```kotlin
// core-issue/build.gradle.kts
dependencies {
    api(project(":core-domain"))           // domain 모델을 외부에 노출
    implementation(project(":core-ai"))     // AI 포트 내부 사용
}

// infra-persistence/build.gradle.kts
dependencies {
    implementation(project(":core-issue"))  // port 구현
    implementation(project(":core-policy"))
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
}

// app-api/build.gradle.kts
dependencies {
    implementation(project(":core-issue"))
    implementation(project(":infra-persistence"))
    implementation(project(":infra-llm"))
    implementation("org.springframework.boot:spring-boot-starter-web")
}
```

---

## 2. 패키지 구조

### core-domain (순수 도메인)

```
com.issuehub.domain
├── model/
│   ├── Issue.kt              # data class Issue(id, title, status, priority, source, ...)
│   ├── Project.kt            # data class Project(id, name, gitUrl, codeIntelMode, ...)
│   ├── Organization.kt       # data class Organization(id, slug, name, plan)
│   ├── User.kt               # data class User(id, name, email, role)
│   ├── Team.kt               # data class Team(id, name, orgId)
│   ├── Policy.kt
│   └── AutomationRule.kt
├── enums/
│   ├── IssueStatus.kt        # enum: OPEN, IN_PROGRESS, RESOLVED, CLOSED, BLOCKED, PENDING
│   ├── IssuePriority.kt      # enum: CRITICAL, HIGH, MEDIUM, LOW, NONE
│   ├── Platform.kt           # enum: JIRA, GITHUB, GITLAB, SLACK, TEAMS, MANUAL
│   ├── CodeIntelMode.kt      # enum: LOCAL, AGENT, API
│   └── LlmProvider.kt        # enum: OLLAMA, CLAUDE, GEMINI
├── vo/                        # Value Objects
│   ├── IssueId.kt            # @JvmInline value class IssueId(val value: UUID)
│   ├── ProjectId.kt
│   └── OrganizationId.kt
└── exception/
    └── DomainException.kt     # sealed class (EntityNotFound, BusinessRuleViolation, ValidationFailed)
```

**규칙**: Spring 어노테이션 금지. 외부 라이브러리 의존 금지. 순수 Kotlin만.

### core-issue

```
com.issuehub.issue
├── port/
│   ├── inbound/
│   │   ├── CreateIssueUseCase.kt       # interface + CreateIssueCommand data class
│   │   ├── UpdateIssueUseCase.kt
│   │   ├── SearchIssueUseCase.kt       # + SearchIssueQuery data class
│   │   ├── GetIssueUseCase.kt
│   │   └── DeleteIssueUseCase.kt
│   └── outbound/
│       ├── LoadIssuePort.kt            # findById, findAll, search
│       ├── SaveIssuePort.kt            # save, delete
│       └── IssueEventPort.kt           # publishEvent
├── service/
│   └── IssueService.kt                # UseCase 구현체 (@Service)
└── event/
    ├── IssueCreatedEvent.kt
    ├── IssueUpdatedEvent.kt
    └── IssueDeletedEvent.kt
```

### core-ai

```
com.issuehub.ai
├── port/
│   ├── inbound/
│   │   ├── AnalyzeTicketUseCase.kt     # 티켓 품질 분석
│   │   ├── SearchSimilarIssueUseCase.kt
│   │   └── ClassifyIssueUseCase.kt
│   └── outbound/
│       ├── LlmPort.kt                  # generate(), classify()
│       ├── EmbeddingPort.kt            # embed(), embedBatch(), dimensions()
│       ├── CodeIntelPort.kt            # analyzeForTicket(), searchCode()
│       └── CodingAgentPort.kt          # createPullRequest(), getTaskStatus()
└── service/
    ├── TicketEnrichmentService.kt
    ├── SimilarIssueService.kt
    └── IssueClassificationService.kt
```

### infra-persistence

```
com.issuehub.persistence
├── adapter/
│   ├── IssuePersistenceAdapter.kt      # LoadIssuePort + SaveIssuePort 구현
│   ├── ProjectPersistenceAdapter.kt
│   ├── OrganizationPersistenceAdapter.kt
│   └── UserPersistenceAdapter.kt
├── entity/
│   ├── IssueJpaEntity.kt              # @Entity (DB 전용, 도메인 로직 금지)
│   ├── ProjectJpaEntity.kt
│   ├── OrganizationJpaEntity.kt
│   └── UserJpaEntity.kt
├── repository/
│   ├── IssueJpaRepository.kt          # Spring Data JPA Repository
│   ├── ProjectJpaRepository.kt
│   └── OrganizationJpaRepository.kt
└── config/
    └── JpaConfig.kt
```

### infra-llm

```
com.issuehub.llm
├── adapter/
│   ├── OllamaLlmAdapter.kt            # LlmPort 구현
│   ├── ClaudeApiLlmAdapter.kt
│   ├── GeminiApiLlmAdapter.kt
│   ├── OllamaEmbeddingAdapter.kt      # EmbeddingPort 구현
│   └── OpenAiEmbeddingAdapter.kt
└── config/
    └── LlmConfig.kt                   # provider 선택 로직
```

### app-api

```
com.issuehub.api
├── controller/
│   ├── IssueController.kt
│   ├── ProjectController.kt
│   ├── DashboardController.kt
│   ├── AutomationController.kt
│   └── ConnectorController.kt
├── dto/
│   ├── request/
│   │   ├── CreateIssueRequest.kt
│   │   └── UpdateIssueRequest.kt
│   └── response/
│       ├── ApiResponse.kt              # 공용 응답 래퍼
│       ├── IssueResponse.kt
│       └── PageResponse.kt
├── config/
│   ├── SecurityConfig.kt
│   ├── CorsConfig.kt
│   └── WebConfig.kt
└── advice/
    └── GlobalExceptionHandler.kt       # @RestControllerAdvice
```

---

## 3. API 설계 (Phase 1)

### 이슈 API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/issues` | 이슈 목록 (필터, 페이지네이션) |
| GET | `/api/v1/issues/{id}` | 이슈 상세 |
| POST | `/api/v1/issues` | 이슈 생성 |
| PATCH | `/api/v1/issues/{id}` | 이슈 수정 |
| DELETE | `/api/v1/issues/{id}` | 이슈 삭제 |
| GET | `/api/v1/issues/{id}/comments` | 댓글 목록 |
| POST | `/api/v1/issues/{id}/comments` | 댓글 작성 |

### 프로젝트 API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/projects` | 프로젝트 목록 |
| POST | `/api/v1/projects` | 프로젝트 생성 (Git URL 등록) |
| GET | `/api/v1/projects/{id}` | 프로젝트 상세 |
| PATCH | `/api/v1/projects/{id}` | 프로젝트 설정 수정 |
| POST | `/api/v1/projects/{id}/sync` | 수동 동기화 트리거 |

### 대시보드 API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/dashboard/stats` | 이슈 통계 (열림/진행/해결/SLA위반) |
| GET | `/api/v1/dashboard/recent-issues` | 최근 이슈 |
| GET | `/api/v1/dashboard/team-workload` | 팀 워크로드 |
| GET | `/api/v1/dashboard/trend` | 이슈 트렌드 (기간별) |

### 응답 포맷

```kotlin
// 성공 (단건)
{
  "success": true,
  "data": { "id": "...", "title": "...", ... },
  "timestamp": "2026-03-23T10:00:00Z"
}

// 성공 (목록)
{
  "success": true,
  "data": [ ... ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  },
  "timestamp": "2026-03-23T10:00:00Z"
}

// 에러
{
  "success": false,
  "error": {
    "code": "ISSUE_NOT_FOUND",
    "message": "Issue not found: 550e8400-...",
    "details": null
  },
  "timestamp": "2026-03-23T10:00:00Z"
}
```

---

## 4. 도메인 모델

### Entity 관계

```
Organization (1) ──── (N) Project
Organization (1) ──── (N) Team
Organization (1) ──── (N) User
Team (1) ──── (N) User (team_members)
Project (1) ──── (N) Issue
Issue (N) ──── (1) User (assignee)
Issue (1) ──── (N) IssueComment
Issue (1) ──── (N) IssueLink
Project (1) ──── (N) ConnectorConfig
Project (1) ──── (N) AutomationRule
Project (1) ──── (N) CodingTask
```

### 핵심 엔티티

```kotlin
// core-domain/model/
data class Issue(
    val id: UUID = UUID.randomUUID(),
    val orgId: UUID,
    val projectId: UUID,
    val externalId: String? = null,
    val title: String,
    val description: String? = null,
    val status: IssueStatus = IssueStatus.OPEN,
    val priority: IssuePriority = IssuePriority.NONE,
    val source: Platform = Platform.MANUAL,
    val sourceUrl: String? = null,
    val assigneeId: UUID? = null,
    val labels: List<String> = emptyList(),
    val slaDeadline: Instant? = null,
    val slaBreach: Boolean = false,
    val resolvedAt: Instant? = null,
    val syncVersion: Long = 0,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now(),
)

data class Project(
    val id: UUID = UUID.randomUUID(),
    val orgId: UUID,
    val name: String,
    val serviceTag: String? = null,
    val gitUrl: String,
    val gitBranch: String = "main",
    val codeIntelMode: CodeIntelMode = CodeIntelMode.LOCAL,
    val codingAgent: String = "none",
    val llmProvider: LlmProvider = LlmProvider.OLLAMA,
    val embeddingProvider: String = "ollama",
    val lastSyncAt: Instant? = null,
    val createdAt: Instant = Instant.now(),
)

data class Organization(
    val id: UUID = UUID.randomUUID(),
    val slug: String,
    val name: String,
    val plan: String = "FREE",
    val createdAt: Instant = Instant.now(),
)
```

---

## 5. 이벤트 흐름

### 도메인 이벤트 목록

| 이벤트 | 트리거 | 소비자 |
|--------|--------|--------|
| `IssueCreatedEvent` | 이슈 생성 시 | 자동화 규칙, SLA 시작, 알림 |
| `IssueUpdatedEvent` | 이슈 수정 시 | 동기화, 알림 |
| `IssueStatusChangedEvent` | 상태 변경 시 | SLA 체크, 에스컬레이션 |
| `ProjectSyncCompletedEvent` | 동기화 완료 시 | 대시보드 갱신 |
| `CodingTaskCompletedEvent` | 코딩 에이전트 완료 시 | 이슈 상태 업데이트 |

### 이벤트 전달 방식 (단계별)

```
Phase 1: Spring ApplicationEvent + @Async
  → @TransactionalEventListener로 커밋 후 발행
  → @Async로 비동기 처리

Phase 2: Redis Streams (내구성 필요 시)
  → 이벤트 유실 방지
  → 컨슈머 그룹으로 다중 소비자

Phase 4+: Kafka (대규모)
  → 일일 이벤트 수만건 이상 시
```

### 이벤트 네이밍

```kotlin
// {도메인}{동작}Event
data class IssueCreatedEvent(
    val issueId: UUID,
    val projectId: UUID,
    val orgId: UUID,
    val title: String,
    val priority: IssuePriority,
    val source: Platform,
    val occurredAt: Instant = Instant.now(),
)
```

---

## 6. 테스트 전략

| 유형 | 위치 | 도구 | 대상 |
|------|------|------|------|
| 단위 | `core-*/src/test/` | JUnit 5 + MockK | Service, Domain Model |
| 통합 | `infra-*/src/test/` | @SpringBootTest + Testcontainers | Adapter, Repository |
| 아키텍처 | `app-api/src/test/` | ArchUnit | 의존성 방향 검증 |
| API | `app-api/src/test/` | MockMvc / WebTestClient | Controller |

### 필수 ArchUnit 규칙

```kotlin
// 1. core-domain은 Spring을 의존하지 않는다
noClasses().that().resideInAPackage("com.issuehub.domain..")
    .should().dependOnClassesThat()
    .resideInAPackage("org.springframework..")

// 2. core-* 모듈은 infra-*를 의존하지 않는다
noClasses().that().resideInAPackage("com.issuehub.issue..")
    .should().dependOnClassesThat()
    .resideInAnyPackage("com.issuehub.persistence..", "com.issuehub.llm..")

// 3. infra-* 모듈끼리 서로 의존하지 않는다
noClasses().that().resideInAPackage("com.issuehub.persistence..")
    .should().dependOnClassesThat()
    .resideInAPackage("com.issuehub.llm..")
```
