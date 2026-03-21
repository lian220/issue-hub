package com.issuehub.domain.model

import java.time.Instant
import java.util.UUID

data class AuditLog(
    val id: UUID = UUID.randomUUID(),
    val entityType: String,
    val entityId: UUID,
    val action: String,
    val performedBy: UUID,
    val changes: Map<String, Any> = emptyMap(),
    val ipAddress: String? = null,
    val userAgent: String? = null,
    val createdAt: Instant = Instant.now()
)
