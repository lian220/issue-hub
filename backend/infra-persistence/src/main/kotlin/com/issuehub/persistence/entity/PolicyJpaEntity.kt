package com.issuehub.persistence.entity

import com.issuehub.domain.enums.PolicyStatus
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "policies")
class PolicyJpaEntity(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    var name: String = "",

    var description: String? = null,

    @Column(nullable = false)
    var version: Int = 1,

    @Column(nullable = false, columnDefinition = "TEXT")
    var content: String = "",

    @Column(columnDefinition = "JSONB")
    var rules: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: PolicyStatus = PolicyStatus.DRAFT,

    @Column(name = "created_by", nullable = false)
    var createdBy: UUID = UUID.randomUUID(),

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
