package com.issuehub.issue.port.outbound

import com.issuehub.domain.model.Issue
import com.issuehub.issue.port.inbound.SearchIssueUseCase.SearchIssueQuery
import com.issuehub.issue.port.inbound.SearchIssueUseCase.SearchResult
import java.util.UUID

interface LoadIssuePort {

    fun findById(id: UUID): Issue?

    fun findByExternalId(externalId: String, sourcePlatform: String): Issue?

    fun search(query: SearchIssueQuery): SearchResult

    fun findSlaBreach(): List<Issue>
}
