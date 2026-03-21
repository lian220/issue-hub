package com.issuehub.issue.port.outbound

import com.issuehub.domain.model.Issue

interface SaveIssuePort {

    fun save(issue: Issue): Issue

    fun saveAll(issues: List<Issue>): List<Issue>
}
