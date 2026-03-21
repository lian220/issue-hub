package com.issuehub.domain.enums

enum class TriggerType {
    ISSUE_CREATED,
    ISSUE_UPDATED,
    ISSUE_STATUS_CHANGED,
    ISSUE_ASSIGNED,
    SLA_BREACH_WARNING,
    SLA_BREACHED,
    COMMENT_ADDED,
    SCHEDULE
}
