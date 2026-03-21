-- IssueHub initial schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- Users & Teams
-- ============================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    display_name    VARCHAR(255) NOT NULL,
    role            VARCHAR(50)  NOT NULL DEFAULT 'AGENT',
    jira_account_id VARCHAR(255),
    github_username VARCHAR(255),
    slack_user_id   VARCHAR(255),
    teams_user_id   VARCHAR(255),
    notification_prefs JSONB DEFAULT '{}',
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE teams (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    lead_id     UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE team_members (
    id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role    VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (team_id, user_id)
);

-- ============================================================
-- SLA Policies
-- ============================================================

CREATE TABLE sla_policies (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             VARCHAR(255) NOT NULL,
    description      TEXT,
    priority         VARCHAR(50),
    response_time_minutes   INT,
    resolution_time_minutes INT,
    conditions       JSONB DEFAULT '{}',
    escalation_rules JSONB DEFAULT '[]',
    enabled          BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Issues
-- ============================================================

CREATE TABLE issues (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id     VARCHAR(255),
    source_platform VARCHAR(100),
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    status          VARCHAR(50)  NOT NULL DEFAULT 'OPEN',
    priority        VARCHAR(50)  NOT NULL DEFAULT 'MEDIUM',
    issue_type      VARCHAR(50)  NOT NULL DEFAULT 'TASK',
    category        VARCHAR(255),
    tags            TEXT[],
    assignee_id     UUID REFERENCES users(id),
    team_id         UUID REFERENCES teams(id),
    sla_policy_id   UUID REFERENCES sla_policies(id),
    sla_deadline    TIMESTAMPTZ,
    sla_breached    BOOLEAN      NOT NULL DEFAULT FALSE,
    metadata        JSONB        DEFAULT '{}',
    sync_version    BIGINT       NOT NULL DEFAULT 0,
    last_synced_at  TIMESTAMPTZ,
    sync_status     VARCHAR(50),
    embedding       vector(1536),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (external_id, source_platform)
);

CREATE TABLE issue_comments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id   UUID         NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    author_id  UUID         REFERENCES users(id),
    body       TEXT         NOT NULL,
    external_id VARCHAR(255),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE issue_links (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_issue_id UUID        NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    target_issue_id UUID        NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    link_type       VARCHAR(50) NOT NULL DEFAULT 'RELATED',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source_issue_id, target_issue_id, link_type)
);

-- ============================================================
-- Policies & Versions
-- ============================================================

CREATE TABLE policies (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    version     INT          NOT NULL DEFAULT 1,
    content     TEXT         NOT NULL,
    rules       JSONB        DEFAULT '{}',
    status      VARCHAR(50)  NOT NULL DEFAULT 'DRAFT',
    created_by  UUID         NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE policy_versions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id   UUID        NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    version     INT         NOT NULL,
    content     TEXT        NOT NULL,
    rules       JSONB       DEFAULT '{}',
    status      VARCHAR(50) NOT NULL,
    published_by UUID       REFERENCES users(id),
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (policy_id, version)
);

CREATE TABLE policy_templates (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    content     TEXT         NOT NULL,
    rules       JSONB        DEFAULT '{}',
    category    VARCHAR(100),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Automation Rules
-- ============================================================

CREATE TABLE automation_rules (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name           VARCHAR(255) NOT NULL,
    description    TEXT,
    trigger_type   VARCHAR(50)  NOT NULL,
    trigger_config JSONB        DEFAULT '{}',
    action_type    VARCHAR(50)  NOT NULL,
    action_config  JSONB        DEFAULT '{}',
    enabled        BOOLEAN      NOT NULL DEFAULT TRUE,
    priority       INT          NOT NULL DEFAULT 0,
    created_by     UUID         NOT NULL REFERENCES users(id),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Connector Configs
-- ============================================================

CREATE TABLE connector_configs (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                 VARCHAR(255) NOT NULL,
    platform             VARCHAR(100) NOT NULL,
    base_url             VARCHAR(500) NOT NULL,
    credentials          BYTEA        NOT NULL,
    project_key          VARCHAR(255),
    sync_enabled         BOOLEAN      NOT NULL DEFAULT TRUE,
    sync_interval_minutes INT         NOT NULL DEFAULT 15,
    field_mappings       JSONB        DEFAULT '{}',
    last_synced_at       TIMESTAMPTZ,
    created_by           UUID         NOT NULL REFERENCES users(id),
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE connector_field_mappings (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connector_id   UUID         NOT NULL REFERENCES connector_configs(id) ON DELETE CASCADE,
    source_field   VARCHAR(255) NOT NULL,
    target_field   VARCHAR(255) NOT NULL,
    transform_rule VARCHAR(500),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (connector_id, source_field)
);

-- ============================================================
-- Audit Logs
-- ============================================================

CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id   UUID         NOT NULL,
    action      VARCHAR(100) NOT NULL,
    performed_by UUID        NOT NULL REFERENCES users(id),
    changes     JSONB        DEFAULT '{}',
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Notifications
-- ============================================================

CREATE TABLE notifications (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID         NOT NULL REFERENCES users(id),
    channel      VARCHAR(50)  NOT NULL,
    subject      VARCHAR(500) NOT NULL,
    body         TEXT         NOT NULL,
    read         BOOLEAN      NOT NULL DEFAULT FALSE,
    sent_at      TIMESTAMPTZ,
    read_at      TIMESTAMPTZ,
    metadata     JSONB        DEFAULT '{}',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

-- Issues: common query patterns
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_assignee ON issues(assignee_id);
CREATE INDEX idx_issues_team ON issues(team_id);
CREATE INDEX idx_issues_sla_deadline ON issues(sla_deadline) WHERE sla_breached = FALSE;
CREATE INDEX idx_issues_external ON issues(external_id, source_platform);
CREATE INDEX idx_issues_created_at ON issues(created_at);
CREATE INDEX idx_issues_updated_at ON issues(updated_at);

-- Full-text search on issues
CREATE INDEX idx_issues_fts ON issues USING GIN (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- GIN index on tags array
CREATE INDEX idx_issues_tags ON issues USING GIN (tags);

-- GIN index on metadata JSONB
CREATE INDEX idx_issues_metadata ON issues USING GIN (metadata);

-- Vector similarity search (ivfflat)
CREATE INDEX idx_issues_embedding ON issues USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Issue comments
CREATE INDEX idx_issue_comments_issue ON issue_comments(issue_id);
CREATE INDEX idx_issue_comments_author ON issue_comments(author_id);

-- Issue links
CREATE INDEX idx_issue_links_source ON issue_links(source_issue_id);
CREATE INDEX idx_issue_links_target ON issue_links(target_issue_id);

-- Policies
CREATE INDEX idx_policies_status ON policies(status);

-- Policy versions
CREATE INDEX idx_policy_versions_policy ON policy_versions(policy_id);

-- Automation rules
CREATE INDEX idx_automation_rules_trigger ON automation_rules(trigger_type);
CREATE INDEX idx_automation_rules_enabled ON automation_rules(enabled);
CREATE INDEX idx_automation_rules_trigger_config ON automation_rules USING GIN (trigger_config);

-- Connectors
CREATE INDEX idx_connector_configs_platform ON connector_configs(platform);

-- Audit logs
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_changes ON audit_logs USING GIN (changes);

-- Notifications
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id) WHERE read = FALSE;

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_jira ON users(jira_account_id) WHERE jira_account_id IS NOT NULL;
CREATE INDEX idx_users_github ON users(github_username) WHERE github_username IS NOT NULL;

-- Team members
CREATE INDEX idx_team_members_user ON team_members(user_id);
