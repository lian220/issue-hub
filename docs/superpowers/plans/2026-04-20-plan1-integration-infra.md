# Integration Infrastructure Plan (Plan 1/3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Docker Compose에 n8n + Keycloak 추가, DB 스키마(integrations, pending_issues) 마이그레이션

**Architecture:** 기존 docker-compose.yml에 n8n, Keycloak 서비스 추가. Flyway 마이그레이션으로 DB 테이블 생성. Keycloak은 Realm/Client/Role JSON 임포트로 자동 설정.

**Tech Stack:** Docker Compose, n8n, Keycloak 26, PostgreSQL 16 + pgvector, Flyway

**관련 스펙:** docs/superpowers/specs/2026-04-15-integration-system-design.md
**아키텍처 가이드:** ~/.claude/architecture-guides/kotlin.md

---

### Task 1: Docker Compose — n8n + Keycloak 추가

**Files:**
- Modify: `docker-compose.yml`
- Create: `deploy/keycloak/issuehub-realm.json`

- [ ] **Step 1: docker-compose.yml에 n8n 서비스 추가**

`docker-compose.yml`의 `redis` 서비스 아래, `volumes:` 위에 추가:

```yaml
  n8n:
    image: n8nio/n8n:latest
    container_name: issuehub-n8n
    profiles:
      - local
    ports:
      - "5678:5678"
    environment:
      N8N_BASIC_AUTH_ACTIVE: "true"
      N8N_BASIC_AUTH_USER: ${N8N_USER:-admin}
      N8N_BASIC_AUTH_PASSWORD: ${N8N_PASSWORD:-issuehub_dev}
      N8N_HOST: localhost
      N8N_PORT: 5678
      N8N_PROTOCOL: http
      WEBHOOK_URL: http://localhost:5678/
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: ${POSTGRES_DB:-issuehub}
      DB_POSTGRESDB_USER: ${POSTGRES_USER:-issuehub}
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD:-issuehub_dev}
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
```

- [ ] **Step 2: docker-compose.yml에 Keycloak 서비스 추가**

n8n 서비스 아래에 추가:

```yaml
  keycloak:
    image: quay.io/keycloak/keycloak:26.0
    container_name: issuehub-keycloak
    profiles:
      - local
    command:
      - start-dev
      - --import-realm
    ports:
      - "8180:8080"
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB:-issuehub}
      KC_DB_USERNAME: ${POSTGRES_USER:-issuehub}
      KC_DB_PASSWORD: ${POSTGRES_PASSWORD:-issuehub_dev}
      KC_DB_SCHEMA: keycloak
      KEYCLOAK_ADMIN: ${KEYCLOAK_ADMIN:-admin}
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD:-issuehub_dev}
    volumes:
      - ./deploy/keycloak/issuehub-realm.json:/opt/keycloak/data/import/issuehub-realm.json:ro
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
```

- [ ] **Step 3: volumes에 n8n_data 추가**

```yaml
volumes:
  kafka_data:
  postgres_data:
  redis_data:
  n8n_data:
```

- [ ] **Step 4: Keycloak Realm 설정 파일 생성**

```bash
mkdir -p deploy/keycloak
```

`deploy/keycloak/issuehub-realm.json` 생성:

```json
{
  "realm": "issuehub",
  "enabled": true,
  "sslRequired": "none",
  "roles": {
    "realm": [
      { "name": "ADMIN", "description": "관리자 — 연동, 정책, 승인 관리" },
      { "name": "MEMBER", "description": "멤버 — 이슈 조회, 대시보드" }
    ]
  },
  "clients": [
    {
      "clientId": "issuehub-api",
      "enabled": true,
      "publicClient": false,
      "secret": "issuehub-api-secret",
      "directAccessGrantsEnabled": true,
      "serviceAccountsEnabled": true,
      "redirectUris": ["http://localhost:3000/*"],
      "webOrigins": ["http://localhost:3000"],
      "protocol": "openid-connect",
      "defaultClientScopes": ["openid", "profile", "email", "roles"]
    },
    {
      "clientId": "issuehub-frontend",
      "enabled": true,
      "publicClient": true,
      "directAccessGrantsEnabled": true,
      "redirectUris": ["http://localhost:3000/*"],
      "webOrigins": ["http://localhost:3000"],
      "protocol": "openid-connect",
      "defaultClientScopes": ["openid", "profile", "email", "roles"]
    }
  ],
  "users": [
    {
      "username": "admin",
      "enabled": true,
      "email": "admin@issuehub.local",
      "firstName": "Admin",
      "lastName": "User",
      "credentials": [{ "type": "password", "value": "admin", "temporary": false }],
      "realmRoles": ["ADMIN"]
    },
    {
      "username": "member",
      "enabled": true,
      "email": "member@issuehub.local",
      "firstName": "Member",
      "lastName": "User",
      "credentials": [{ "type": "password", "value": "member", "temporary": false }],
      "realmRoles": ["MEMBER"]
    }
  ]
}
```

- [ ] **Step 5: 서비스 기동 테스트**

Run:
```bash
docker compose --profile local up -d
docker compose --profile local ps
```

Expected: postgres, redis, n8n, keycloak 모두 running 상태

- [ ] **Step 6: 서비스 접근 확인**

- n8n: http://localhost:5678 (admin / issuehub_dev)
- Keycloak: http://localhost:8180 (admin / issuehub_dev)
- Keycloak Realm: http://localhost:8180/realms/issuehub/.well-known/openid-configuration

- [ ] **Step 7: Commit**

```bash
git add docker-compose.yml deploy/keycloak/issuehub-realm.json
git commit -m "infra: Docker Compose에 n8n + Keycloak 추가"
```

---

### Task 2: DB 스키마 — integrations + pending_issues 테이블

**Files:**
- Create: `backend/infra-persistence/src/main/resources/db/migration/V10__create_integrations_table.sql`
- Create: `backend/infra-persistence/src/main/resources/db/migration/V11__create_pending_issues_table.sql`

**참고:** 기존 마이그레이션 번호를 확인 후 V번호를 조정할 것. DDL은 별도 문서로도 관리.

- [ ] **Step 1: 기존 마이그레이션 번호 확인**

Run:
```bash
ls backend/infra-persistence/src/main/resources/db/migration/
```

마지막 V번호 확인 후, 그 다음 번호 사용.

- [ ] **Step 2: integrations 테이블 마이그레이션 생성**

`V10__create_integrations_table.sql`:

```sql
CREATE TABLE integrations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(20) NOT NULL,
    role            VARCHAR(20) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'DISCONNECTED',
    config          JSONB NOT NULL DEFAULT '{}',
    n8n_workflow_id VARCHAR(100),
    n8n_credential_id VARCHAR(100),
    last_sync_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE integrations IS '외부 플랫폼 연동 설정';
COMMENT ON COLUMN integrations.type IS 'JIRA, GITHUB, GITLAB, NOTION, SLACK, TEAMS, EMAIL';
COMMENT ON COLUMN integrations.role IS 'ISSUE_SOURCE, NOTIFICATION, CODE_ENGINE';
COMMENT ON COLUMN integrations.status IS 'CONNECTED, DISCONNECTED, ERROR';
COMMENT ON COLUMN integrations.config IS 'OAuth token, API key, 채널/프로젝트 설정 등 (암호화)';

CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_status ON integrations(status);
```

- [ ] **Step 3: pending_issues 테이블 마이그레이션 생성**

`V11__create_pending_issues_table.sql`:

```sql
CREATE TABLE pending_issues (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type         VARCHAR(20) NOT NULL,
    source_channel      VARCHAR(100),
    source_message_id   VARCHAR(200),
    raw_message         TEXT NOT NULL,
    parsed_title        VARCHAR(500),
    parsed_description  TEXT,
    parsed_priority     VARCHAR(20),
    parsed_component    VARCHAR(100),
    confidence          DECIMAL(3,2),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    confirmed_by        UUID,
    external_issue_id   VARCHAR(200),
    external_issue_url  VARCHAR(500),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at        TIMESTAMPTZ
);

COMMENT ON TABLE pending_issues IS 'AI 감지 후 관리자 확인 대기 중인 이슈';
COMMENT ON COLUMN pending_issues.source_type IS 'SLACK, GRAFANA 등 감지 소스';
COMMENT ON COLUMN pending_issues.source_message_id IS '멱등성용 원본 메시지 ID (Slack ts 등)';
COMMENT ON COLUMN pending_issues.status IS 'PENDING, CONFIRMED, DISMISSED';
COMMENT ON COLUMN pending_issues.external_issue_id IS '확정 후 생성된 Jira 티켓 ID';

CREATE INDEX idx_pending_issues_status ON pending_issues(status);
CREATE INDEX idx_pending_issues_source_message ON pending_issues(source_message_id);
```

- [ ] **Step 4: Flyway 마이그레이션 실행 확인**

Run:
```bash
cd backend && ./gradlew :app-api:flywayMigrate --no-daemon
```

Expected: V10, V11 마이그레이션 성공

- [ ] **Step 5: Commit**

```bash
git add backend/infra-persistence/src/main/resources/db/migration/V10__create_integrations_table.sql
git add backend/infra-persistence/src/main/resources/db/migration/V11__create_pending_issues_table.sql
git commit -m "infra: integrations + pending_issues 테이블 마이그레이션"
```
