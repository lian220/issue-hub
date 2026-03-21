package com.issuehub.connector.service

import com.issuehub.connector.port.outbound.ExternalIssuePort.ExternalIssue
import com.issuehub.domain.enums.IssuePriority
import com.issuehub.domain.enums.IssueStatus
import com.issuehub.domain.model.ConnectorConfig
import com.issuehub.domain.model.Issue
import java.time.Instant

class FieldMapper {

    fun toIssue(external: ExternalIssue, config: ConnectorConfig): Issue {
        return Issue(
            externalId = external.externalId,
            sourcePlatform = config.platform.name,
            title = external.title,
            description = external.description,
            status = mapStatus(external.status, config.fieldMappings),
            priority = mapPriority(external.priority, config.fieldMappings),
            tags = external.labels,
            metadata = external.rawData,
            lastSyncedAt = Instant.now(),
            syncStatus = "SYNCED"
        )
    }

    fun toExternal(issue: Issue, config: ConnectorConfig): Map<String, Any> {
        val result = mutableMapOf<String, Any>(
            "title" to issue.title,
            "status" to reverseMapStatus(issue.status, config.fieldMappings)
        )
        issue.description?.let { result["description"] = it }
        issue.tags.takeIf { it.isNotEmpty() }?.let { result["labels"] = it }
        return result
    }

    private fun mapStatus(externalStatus: String, mappings: Map<String, String>): IssueStatus {
        val mapped = mappings["status.$externalStatus"] ?: externalStatus
        return try {
            IssueStatus.valueOf(mapped.uppercase())
        } catch (_: IllegalArgumentException) {
            IssueStatus.OPEN
        }
    }

    private fun mapPriority(externalPriority: String?, mappings: Map<String, String>): IssuePriority {
        if (externalPriority == null) return IssuePriority.MEDIUM
        val mapped = mappings["priority.$externalPriority"] ?: externalPriority
        return try {
            IssuePriority.valueOf(mapped.uppercase())
        } catch (_: IllegalArgumentException) {
            IssuePriority.MEDIUM
        }
    }

    private fun reverseMapStatus(status: IssueStatus, mappings: Map<String, String>): String {
        return mappings.entries
            .firstOrNull { it.key.startsWith("status.") && it.value == status.name }
            ?.key?.removePrefix("status.")
            ?: status.name.lowercase()
    }
}
