package com.issuehub.persistence.adapter

import com.issuehub.domain.model.Issue
import com.issuehub.issue.port.inbound.SearchIssueUseCase.SearchIssueQuery
import com.issuehub.issue.port.inbound.SearchIssueUseCase.SearchResult
import com.issuehub.issue.port.outbound.LoadIssuePort
import com.issuehub.issue.port.outbound.SaveIssuePort
import com.issuehub.persistence.entity.IssueJpaEntity
import com.issuehub.persistence.repository.IssueJpaRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.UUID

@Component
class IssuePersistenceAdapter(
    private val issueJpaRepository: IssueJpaRepository
) : LoadIssuePort, SaveIssuePort {

    override fun findById(id: UUID): Issue? {
        return issueJpaRepository.findById(id).orElse(null)?.toDomain()
    }

    override fun findByExternalId(externalId: String, sourcePlatform: String): Issue? {
        return issueJpaRepository.findByExternalIdAndSourcePlatform(externalId, sourcePlatform)?.toDomain()
    }

    override fun search(query: SearchIssueQuery): SearchResult {
        val pageable = PageRequest.of(query.page, query.size)
        val status = query.statuses.firstOrNull()?.name
        val priority = query.priorities.firstOrNull()?.name
        val page = issueJpaRepository.searchIssues(status, priority, query.assigneeId, query.teamId, pageable)

        return SearchResult(
            issues = page.content.map { it.toDomain() },
            totalCount = page.totalElements,
            page = query.page,
            size = query.size
        )
    }

    override fun findSlaBreach(): List<Issue> {
        return issueJpaRepository.findSlaBreachCandidates(Instant.now()).map { it.toDomain() }
    }

    override fun save(issue: Issue): Issue {
        val entity = issue.toEntity()
        return issueJpaRepository.save(entity).toDomain()
    }

    override fun saveAll(issues: List<Issue>): List<Issue> {
        val entities = issues.map { it.toEntity() }
        return issueJpaRepository.saveAll(entities).map { it.toDomain() }
    }

    private fun IssueJpaEntity.toDomain(): Issue {
        return Issue(
            id = id,
            orgId = orgId,
            projectId = projectId,
            externalId = externalId,
            sourcePlatform = sourcePlatform,
            title = title,
            description = description,
            status = status,
            priority = priority,
            issueType = issueType,
            category = category,
            tags = tags?.split(",")?.filter { it.isNotBlank() } ?: emptyList(),
            assigneeId = assigneeId,
            teamId = teamId,
            slaPolicyId = slaPolicyId,
            slaDeadline = slaDeadline,
            slaBreached = slaBreached,
            syncVersion = syncVersion,
            lastSyncedAt = lastSyncedAt,
            syncStatus = syncStatus,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }

    private fun Issue.toEntity(): IssueJpaEntity {
        return IssueJpaEntity(
            id = id,
            orgId = orgId,
            projectId = projectId,
            externalId = externalId,
            sourcePlatform = sourcePlatform,
            title = title,
            description = description,
            status = status,
            priority = priority,
            issueType = issueType,
            category = category,
            tags = tags.joinToString(",").ifBlank { null },
            assigneeId = assigneeId,
            teamId = teamId,
            slaPolicyId = slaPolicyId,
            slaDeadline = slaDeadline,
            slaBreached = slaBreached,
            syncVersion = syncVersion,
            lastSyncedAt = lastSyncedAt,
            syncStatus = syncStatus,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
}
