package com.issuehub.domain.model

import java.time.Instant
import java.util.UUID

data class Team(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val description: String? = null,
    val leadId: UUID? = null,
    val memberIds: List<UUID> = emptyList(),
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)
