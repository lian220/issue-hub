package com.issuehub.issue.service

import com.issuehub.domain.enums.IssueStatus
import com.issuehub.domain.model.Issue
import com.issuehub.issue.port.inbound.CreateIssueUseCase
import com.issuehub.issue.port.inbound.CreateIssueUseCase.CreateIssueCommand
import com.issuehub.issue.port.inbound.SearchIssueUseCase
import com.issuehub.issue.port.inbound.SearchIssueUseCase.SearchIssueQuery
import com.issuehub.issue.port.inbound.SearchIssueUseCase.SearchResult
import com.issuehub.issue.port.inbound.UpdateIssueUseCase
import com.issuehub.issue.port.inbound.UpdateIssueUseCase.UpdateIssueCommand
import com.issuehub.domain.exception.DomainException
import com.issuehub.issue.port.outbound.LoadIssuePort
import com.issuehub.issue.port.outbound.SaveIssuePort
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class IssueService(
    private val loadIssuePort: LoadIssuePort,
    private val saveIssuePort: SaveIssuePort
) : CreateIssueUseCase, UpdateIssueUseCase, SearchIssueUseCase {

    override fun createIssue(command: CreateIssueCommand): Issue {
        val issue = Issue(
            title = command.title,
            description = command.description,
            priority = command.priority,
            issueType = command.issueType,
            category = command.category,
            tags = command.tags,
            assigneeId = command.assigneeId,
            teamId = command.teamId,
            slaPolicyId = command.slaPolicyId,
            metadata = command.metadata
        )
        return saveIssuePort.save(issue)
    }

    override fun updateIssue(command: UpdateIssueCommand): Issue {
        val existing = loadIssuePort.findById(command.issueId)
            ?: throw DomainException.EntityNotFound("Issue", command.issueId)

        val updated = existing.copy(
            title = command.title ?: existing.title,
            description = command.description ?: existing.description,
            priority = command.priority ?: existing.priority,
            category = command.category ?: existing.category,
            tags = command.tags ?: existing.tags,
            assigneeId = command.assigneeId ?: existing.assigneeId,
            teamId = command.teamId ?: existing.teamId,
            updatedAt = Instant.now()
        )
        return saveIssuePort.save(updated)
    }

    override fun changeStatus(issueId: UUID, status: IssueStatus): Issue {
        val existing = loadIssuePort.findById(issueId)
            ?: throw DomainException.EntityNotFound("Issue", issueId)

        val updated = existing.copy(status = status, updatedAt = Instant.now())
        return saveIssuePort.save(updated)
    }

    override fun assignIssue(issueId: UUID, assigneeId: UUID): Issue {
        val existing = loadIssuePort.findById(issueId)
            ?: throw DomainException.EntityNotFound("Issue", issueId)

        val updated = existing.copy(assigneeId = assigneeId, updatedAt = Instant.now())
        return saveIssuePort.save(updated)
    }

    override fun findById(issueId: UUID): Issue? {
        return loadIssuePort.findById(issueId)
    }

    override fun search(query: SearchIssueQuery): SearchResult {
        return loadIssuePort.search(query)
    }
}
