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
