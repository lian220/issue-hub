package com.issuehub.domain.model

import com.issuehub.domain.enums.IssuePriority
import com.issuehub.domain.enums.IssueStatus
import com.issuehub.domain.enums.IssueType
import java.time.Instant
import java.util.UUID

data class Issue(
    val id: UUID = UUID.randomUUID(),
    val orgId: UUID? = null,
    val projectId: UUID? = null,
    val externalId: String? = null,
    val sourcePlatform: String? = null,
    val title: String,
    val description: String? = null,
    val status: IssueStatus = IssueStatus.OPEN,
    val priority: IssuePriority = IssuePriority.MEDIUM,
    val issueType: IssueType = IssueType.TASK,
    val category: String? = null,
    val tags: List<String> = emptyList(),
    val assigneeId: UUID? = null,
    val teamId: UUID? = null,
    val slaPolicyId: UUID? = null,
    val slaDeadline: Instant? = null,
    val slaBreached: Boolean = false,
    val metadata: Map<String, Any> = emptyMap(),
    val syncVersion: Long = 0,
    val lastSyncedAt: Instant? = null,
    val syncStatus: String? = null,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)
