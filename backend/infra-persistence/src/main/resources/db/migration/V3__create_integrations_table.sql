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
