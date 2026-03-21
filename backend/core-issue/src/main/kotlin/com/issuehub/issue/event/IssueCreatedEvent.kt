package com.issuehub.issue.event

import com.issuehub.domain.model.Issue
import java.time.Instant
import java.util.UUID

data class IssueCreatedEvent(
    val eventId: UUID = UUID.randomUUID(),
    val issue: Issue,
    val createdBy: UUID? = null,
    val occurredAt: Instant = Instant.now()
)
