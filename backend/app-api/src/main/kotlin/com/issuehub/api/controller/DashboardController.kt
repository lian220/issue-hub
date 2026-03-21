package com.issuehub.api.controller

import com.issuehub.domain.enums.IssuePriority
import com.issuehub.domain.enums.IssueStatus
import com.issuehub.issue.port.inbound.SearchIssueUseCase
import com.issuehub.issue.port.inbound.SearchIssueUseCase.SearchIssueQuery
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/dashboard")
class DashboardController(
    private val searchIssueUseCase: SearchIssueUseCase
) {

    @GetMapping("/summary")
    fun getSummary(): ResponseEntity<DashboardSummary> {
        val openCount = searchIssueUseCase.search(
            SearchIssueQuery(statuses = listOf(IssueStatus.OPEN), size = 1)
        ).totalCount

        val inProgressCount = searchIssueUseCase.search(
            SearchIssueQuery(statuses = listOf(IssueStatus.IN_PROGRESS), size = 1)
        ).totalCount

        val criticalCount = searchIssueUseCase.search(
            SearchIssueQuery(priorities = listOf(IssuePriority.CRITICAL), size = 1)
        ).totalCount

        val summary = DashboardSummary(
            openIssues = openCount,
            inProgressIssues = inProgressCount,
            criticalIssues = criticalCount
        )
        return ResponseEntity.ok(summary)
    }

    data class DashboardSummary(
        val openIssues: Long,
        val inProgressIssues: Long,
        val criticalIssues: Long
    )
}
