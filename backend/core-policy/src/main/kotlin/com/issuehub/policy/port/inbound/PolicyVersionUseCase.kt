package com.issuehub.policy.port.inbound

import com.issuehub.domain.model.Policy
import java.util.UUID

interface PolicyVersionUseCase {

    fun publishVersion(policyId: UUID): Policy

    fun getVersionHistory(policyId: UUID): List<Policy>

    fun rollbackToVersion(policyId: UUID, version: Int): Policy
}
