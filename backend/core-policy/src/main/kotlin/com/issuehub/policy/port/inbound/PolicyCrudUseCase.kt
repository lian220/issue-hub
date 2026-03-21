package com.issuehub.policy.port.inbound

import com.issuehub.domain.enums.PolicyStatus
import com.issuehub.domain.model.Policy
import java.util.UUID

interface PolicyCrudUseCase {

    fun createPolicy(command: CreatePolicyCommand): Policy

    fun updatePolicy(command: UpdatePolicyCommand): Policy

    fun deletePolicy(policyId: UUID)

    fun findById(policyId: UUID): Policy?

    fun findAll(status: PolicyStatus? = null): List<Policy>

    data class CreatePolicyCommand(
        val name: String,
        val description: String? = null,
        val content: String,
        val rules: Map<String, Any> = emptyMap(),
        val createdBy: UUID
    )

    data class UpdatePolicyCommand(
        val policyId: UUID,
        val name: String? = null,
        val description: String? = null,
        val content: String? = null,
        val rules: Map<String, Any>? = null,
        val status: PolicyStatus? = null
    )
}
