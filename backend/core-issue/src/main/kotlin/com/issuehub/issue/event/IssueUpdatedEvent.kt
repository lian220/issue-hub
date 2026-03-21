package com.issuehub.issue.event

import com.issuehub.domain.model.Issue
import java.time.Instant
import java.util.UUID

data class IssueUpdatedEvent(
    val eventId: UUID = UUID.randomUUID(),
    val previousIssue: Issue,
    val updatedIssue: Issue,
    val updatedBy: UUID? = null,
    val occurredAt: Instant = Instant.now()
)
