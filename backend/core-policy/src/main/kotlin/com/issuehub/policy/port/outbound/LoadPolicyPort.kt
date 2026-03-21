package com.issuehub.policy.port.outbound

import com.issuehub.domain.enums.PolicyStatus
import com.issuehub.domain.model.Policy
import java.util.UUID

interface LoadPolicyPort {

    fun findById(id: UUID): Policy?

    fun findAll(status: PolicyStatus? = null): List<Policy>

    fun findVersionHistory(policyId: UUID): List<Policy>

    fun findByVersion(policyId: UUID, version: Int): Policy?
}
