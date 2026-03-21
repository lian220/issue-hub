package com.issuehub.connector.port.outbound

import com.issuehub.domain.model.Issue
import java.time.Instant

interface ExternalIssuePort {

    fun fetchIssues(since: Instant? = null): List<ExternalIssue>

    fun fetchIssueById(externalId: String): ExternalIssue?

    fun createIssue(issue: Issue): ExternalIssue

    fun updateIssue(externalId: String, issue: Issue): ExternalIssue

    fun testConnection(): Boolean

    data class ExternalIssue(
        val externalId: String,
        val title: String,
        val description: String? = null,
        val status: String,
        val priority: String? = null,
        val assignee: String? = null,
        val labels: List<String> = emptyList(),
        val rawData: Map<String, Any> = emptyMap(),
        val updatedAt: Instant
    )
}
