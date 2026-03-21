package com.issuehub.domain.model

import com.issuehub.domain.enums.Role
import java.time.Instant
import java.util.UUID

data class User(
    val id: UUID = UUID.randomUUID(),
    val email: String,
    val displayName: String,
    val role: Role = Role.AGENT,
    val jiraAccountId: String? = null,
    val githubUsername: String? = null,
    val slackUserId: String? = null,
    val teamsUserId: String? = null,
    val notificationPrefs: Map<String, Any> = emptyMap(),
    val active: Boolean = true,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)
