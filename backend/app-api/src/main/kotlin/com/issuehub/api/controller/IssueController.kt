package com.issuehub.api.controller

import com.issuehub.domain.enums.IssuePriority
import com.issuehub.domain.enums.IssueStatus
import com.issuehub.domain.enums.IssueType
import com.issuehub.domain.model.Issue
import com.issuehub.issue.port.inbound.CreateIssueUseCase
import com.issuehub.issue.port.inbound.CreateIssueUseCase.CreateIssueCommand
import com.issuehub.issue.port.inbound.SearchIssueUseCase
import com.issuehub.issue.port.inbound.SearchIssueUseCase.SearchIssueQuery
import com.issuehub.issue.port.inbound.SearchIssueUseCase.SearchResult
import com.issuehub.issue.port.inbound.UpdateIssueUseCase
import com.issuehub.issue.port.inbound.UpdateIssueUseCase.UpdateIssueCommand
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/issues")
class IssueController(
    private val createIssueUseCase: CreateIssueUseCase,
    private val updateIssueUseCase: UpdateIssueUseCase,
    private val searchIssueUseCase: SearchIssueUseCase
) {

    @PostMapping
    fun createIssue(@RequestBody request: CreateIssueRequest): ResponseEntity<Issue> {
        val command = CreateIssueCommand(
            title = request.title,
            description = request.description,
            priority = request.priority ?: IssuePriority.MEDIUM,
            issueType = request.issueType ?: IssueType.TASK,
            category = request.category,
            tags = request.tags ?: emptyList(),
            assigneeId = request.assigneeId,
            teamId = request.teamId,
            slaPolicyId = request.slaPolicyId
        )
        val issue = createIssueUseCase.createIssue(command)
        return ResponseEntity.status(HttpStatus.CREATED).body(issue)
    }

    @GetMapping("/{id}")
    fun getIssue(@PathVariable id: UUID): ResponseEntity<Issue> {
        val issue = searchIssueUseCase.findById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(issue)
    }

    @PatchMapping("/{id}")
    fun updateIssue(
        @PathVariable id: UUID,
        @RequestBody request: UpdateIssueRequest
    ): ResponseEntity<Issue> {
        val command = UpdateIssueCommand(
            issueId = id,
            title = request.title,
            description = request.description,
            priority = request.priority,
            category = request.category,
            tags = request.tags,
            assigneeId = request.assigneeId,
            teamId = request.teamId
        )
        val issue = updateIssueUseCase.updateIssue(command)
        return ResponseEntity.ok(issue)
    }

    @PatchMapping("/{id}/status")
    fun changeStatus(
        @PathVariable id: UUID,
        @RequestBody request: ChangeStatusRequest
    ): ResponseEntity<Issue> {
        val issue = updateIssueUseCase.changeStatus(id, request.status)
        return ResponseEntity.ok(issue)
    }

    @GetMapping
    fun searchIssues(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(required = false) status: List<IssueStatus>?,
        @RequestParam(required = false) priority: List<IssuePriority>?,
        @RequestParam(required = false) assigneeId: UUID?,
        @RequestParam(required = false) teamId: UUID?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<SearchResult> {
        val query = SearchIssueQuery(
            keyword = keyword,
            statuses = status ?: emptyList(),
            priorities = priority ?: emptyList(),
            assigneeId = assigneeId,
            teamId = teamId,
            page = page,
            size = size
        )
        return ResponseEntity.ok(searchIssueUseCase.search(query))
    }

    data class CreateIssueRequest(
        val title: String,
        val description: String? = null,
        val priority: IssuePriority? = null,
        val issueType: IssueType? = null,
        val category: String? = null,
        val tags: List<String>? = null,
        val assigneeId: UUID? = null,
        val teamId: UUID? = null,
        val slaPolicyId: UUID? = null
    )

    data class UpdateIssueRequest(
        val title: String? = null,
        val description: String? = null,
        val priority: IssuePriority? = null,
        val category: String? = null,
        val tags: List<String>? = null,
        val assigneeId: UUID? = null,
        val teamId: UUID? = null
    )

    data class ChangeStatusRequest(
        val status: IssueStatus
    )
}
