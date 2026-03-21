package com.issuehub.connector.port.inbound

import java.time.Instant
import java.util.UUID

interface SyncUseCase {

    fun syncConnector(connectorId: UUID): SyncResult

    fun syncAll(): List<SyncResult>

    fun resolveConflicts(connectorId: UUID, resolutions: List<ConflictResolution>): SyncResult

    data class SyncResult(
        val connectorId: UUID,
        val created: Int,
        val updated: Int,
        val deleted: Int,
        val conflicts: Int,
        val errors: List<String> = emptyList(),
        val syncedAt: Instant = Instant.now()
    )

    data class ConflictResolution(
        val issueId: UUID,
        val strategy: ResolutionStrategy,
        val preferredSource: String? = null
    )

    enum class ResolutionStrategy {
        USE_LOCAL,
        USE_REMOTE,
        MERGE,
        SKIP
    }
}
