package com.issuehub.issue.port.inbound

import com.issuehub.domain.enums.IssuePriority
import com.issuehub.domain.enums.IssueStatus
import com.issuehub.domain.model.Issue
import java.util.UUID

interface UpdateIssueUseCase {

    fun updateIssue(command: UpdateIssueCommand): Issue

    fun changeStatus(issueId: UUID, status: IssueStatus): Issue

    fun assignIssue(issueId: UUID, assigneeId: UUID): Issue

    data class UpdateIssueCommand(
        val issueId: UUID,
        val title: String? = null,
        val description: String? = null,
        val priority: IssuePriority? = null,
        val category: String? = null,
        val tags: List<String>? = null,
        val assigneeId: UUID? = null,
        val teamId: UUID? = null
    )
}
