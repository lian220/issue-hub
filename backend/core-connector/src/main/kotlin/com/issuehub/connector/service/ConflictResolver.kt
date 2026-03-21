package com.issuehub.connector.service

import com.issuehub.connector.port.inbound.SyncUseCase.ResolutionStrategy
import com.issuehub.connector.port.outbound.ExternalIssuePort.ExternalIssue
import com.issuehub.domain.model.Issue
import java.time.Instant

class ConflictResolver {

    fun detectConflict(local: Issue, remote: ExternalIssue): ConflictInfo? {
        val localUpdated = local.updatedAt
        val remoteUpdated = remote.updatedAt

        if (local.syncVersion == 0L) return null

        val localChanged = localUpdated.isAfter(local.lastSyncedAt ?: Instant.MIN)
        val remoteChanged = remoteUpdated.isAfter(local.lastSyncedAt ?: Instant.MIN)

        return if (localChanged && remoteChanged) {
            ConflictInfo(
                localIssue = local,
                remoteIssue = remote,
                conflictFields = detectConflictingFields(local, remote)
            )
        } else {
            null
        }
    }

    fun resolve(conflict: ConflictInfo, strategy: ResolutionStrategy): Issue {
        return when (strategy) {
            ResolutionStrategy.USE_LOCAL -> conflict.localIssue
            ResolutionStrategy.USE_REMOTE -> mergeFromRemote(conflict.localIssue, conflict.remoteIssue)
            ResolutionStrategy.MERGE -> mergeFields(conflict.localIssue, conflict.remoteIssue)
            ResolutionStrategy.SKIP -> conflict.localIssue
        }
    }

    private fun detectConflictingFields(local: Issue, remote: ExternalIssue): List<String> {
        val conflicts = mutableListOf<String>()
        if (local.title != remote.title) conflicts.add("title")
        if (local.description != remote.description) conflicts.add("description")
        if (local.status.name != remote.status) conflicts.add("status")
        return conflicts
    }

    private fun mergeFromRemote(local: Issue, remote: ExternalIssue): Issue {
        return local.copy(
            title = remote.title,
            description = remote.description,
            updatedAt = Instant.now()
        )
    }

    private fun mergeFields(local: Issue, remote: ExternalIssue): Issue {
        return local.copy(
            title = remote.title,
            description = remote.description ?: local.description,
            updatedAt = Instant.now()
        )
    }

    data class ConflictInfo(
        val localIssue: Issue,
        val remoteIssue: ExternalIssue,
        val conflictFields: List<String>
    )
}
