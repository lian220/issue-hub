package com.issuehub.issue.port.inbound

import com.issuehub.domain.enums.IssuePriority
import com.issuehub.domain.enums.IssueStatus
import com.issuehub.domain.enums.IssueType
import com.issuehub.domain.model.Issue
import java.util.UUID

interface SearchIssueUseCase {

    fun findById(issueId: UUID): Issue?

    fun search(query: SearchIssueQuery): SearchResult

    data class SearchIssueQuery(
        val keyword: String? = null,
        val statuses: List<IssueStatus> = emptyList(),
        val priorities: List<IssuePriority> = emptyList(),
        val issueTypes: List<IssueType> = emptyList(),
        val assigneeId: UUID? = null,
        val teamId: UUID? = null,
        val tags: List<String> = emptyList(),
        val page: Int = 0,
        val size: Int = 20
    )

    data class SearchResult(
        val issues: List<Issue>,
        val totalCount: Long,
        val page: Int,
        val size: Int
    )
}
