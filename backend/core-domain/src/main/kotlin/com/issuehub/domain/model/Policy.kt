package com.issuehub.domain.model

import com.issuehub.domain.enums.PolicyStatus
import java.time.Instant
import java.util.UUID

data class Policy(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val description: String? = null,
    val version: Int = 1,
    val content: String,
    val rules: Map<String, Any> = emptyMap(),
    val status: PolicyStatus = PolicyStatus.DRAFT,
    val createdBy: UUID,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)
