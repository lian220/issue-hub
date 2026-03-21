package com.issuehub.persistence.repository

import com.issuehub.persistence.entity.IssueJpaEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface IssueJpaRepository : JpaRepository<IssueJpaEntity, UUID> {

    fun findByExternalIdAndSourcePlatform(externalId: String, sourcePlatform: String): IssueJpaEntity?

    @Query(
        """
        SELECT i FROM IssueJpaEntity i
        WHERE i.slaBreached = false
        AND i.slaDeadline IS NOT NULL
        AND i.slaDeadline < :now
        AND i.status NOT IN ('RESOLVED', 'CLOSED')
        """
    )
    fun findSlaBreachCandidates(@Param("now") now: Instant): List<IssueJpaEntity>

    @Query(
        """
        SELECT i FROM IssueJpaEntity i
        WHERE (:status IS NULL OR i.status = :status)
        AND (:priority IS NULL OR i.priority = :priority)
        AND (:assigneeId IS NULL OR i.assigneeId = :assigneeId)
        AND (:teamId IS NULL OR i.teamId = :teamId)
        """
    )
    fun searchIssues(
        @Param("status") status: String?,
        @Param("priority") priority: String?,
        @Param("assigneeId") assigneeId: UUID?,
        @Param("teamId") teamId: UUID?,
        pageable: Pageable
    ): Page<IssueJpaEntity>
}
