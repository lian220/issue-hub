package com.issuehub.domain.model

import com.issuehub.domain.enums.ConnectorPlatform
import java.time.Instant
import java.util.UUID

data class ConnectorConfig(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val platform: ConnectorPlatform,
    val baseUrl: String,
    val credentials: ByteArray,
    val projectKey: String? = null,
    val syncEnabled: Boolean = true,
    val syncIntervalMinutes: Int = 15,
    val fieldMappings: Map<String, String> = emptyMap(),
    val createdBy: UUID,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is ConnectorConfig) return false
        return id == other.id
    }

    override fun hashCode(): Int = id.hashCode()
}
