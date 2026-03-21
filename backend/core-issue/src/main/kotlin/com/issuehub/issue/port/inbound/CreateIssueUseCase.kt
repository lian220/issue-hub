package com.issuehub.issue.port.inbound

import com.issuehub.domain.enums.IssuePriority
import com.issuehub.domain.enums.IssueType
import com.issuehub.domain.model.Issue
import java.util.UUID

interface CreateIssueUseCase {

    fun createIssue(command: CreateIssueCommand): Issue

    data class CreateIssueCommand(
        val title: String,
        val description: String? = null,
        val priority: IssuePriority = IssuePriority.MEDIUM,
        val issueType: IssueType = IssueType.TASK,
        val category: String? = null,
        val tags: List<String> = emptyList(),
        val assigneeId: UUID? = null,
        val teamId: UUID? = null,
        val slaPolicyId: UUID? = null,
        val metadata: Map<String, Any> = emptyMap()
    )
}
