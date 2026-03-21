package com.issuehub.policy.port.outbound

import com.issuehub.domain.model.Policy
import java.util.UUID

interface SavePolicyPort {

    fun save(policy: Policy): Policy

    fun delete(policyId: UUID)
}
