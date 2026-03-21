package com.issuehub.persistence.entity

import com.issuehub.domain.enums.IssuePriority
import com.issuehub.domain.enums.IssueStatus
import com.issuehub.domain.enums.IssueType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "issues")
class IssueJpaEntity(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "external_id")
    var externalId: String? = null,

    @Column(name = "source_platform")
    var sourcePlatform: String? = null,

    @Column(nullable = false)
    var title: String = "",

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: IssueStatus = IssueStatus.OPEN,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var priority: IssuePriority = IssuePriority.MEDIUM,

    @Enumerated(EnumType.STRING)
    @Column(name = "issue_type", nullable = false)
    var issueType: IssueType = IssueType.TASK,

    var category: String? = null,

    @Column(name = "tags", columnDefinition = "TEXT[]")
    var tags: String? = null,

    @Column(name = "assignee_id")
    var assigneeId: UUID? = null,

    @Column(name = "team_id")
    var teamId: UUID? = null,

    @Column(name = "sla_policy_id")
    var slaPolicyId: UUID? = null,

    @Column(name = "sla_deadline")
    var slaDeadline: Instant? = null,

    @Column(name = "sla_breached")
    var slaBreached: Boolean = false,

    @Column(name = "metadata", columnDefinition = "JSONB")
    var metadata: String? = null,

    @Column(name = "sync_version")
    var syncVersion: Long = 0,

    @Column(name = "last_synced_at")
    var lastSyncedAt: Instant? = null,

    @Column(name = "sync_status")
    var syncStatus: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
