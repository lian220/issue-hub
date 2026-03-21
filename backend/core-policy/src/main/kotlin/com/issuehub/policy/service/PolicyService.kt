package com.issuehub.policy.service

import com.issuehub.domain.enums.PolicyStatus
import com.issuehub.domain.model.Policy
import com.issuehub.policy.port.inbound.PolicyCrudUseCase
import com.issuehub.policy.port.inbound.PolicyCrudUseCase.CreatePolicyCommand
import com.issuehub.policy.port.inbound.PolicyCrudUseCase.UpdatePolicyCommand
import com.issuehub.policy.port.inbound.PolicyVersionUseCase
import com.issuehub.policy.port.outbound.LoadPolicyPort
import com.issuehub.policy.port.outbound.SavePolicyPort
import java.time.Instant
import java.util.UUID

class PolicyService(
    private val loadPolicyPort: LoadPolicyPort,
    private val savePolicyPort: SavePolicyPort
) : PolicyCrudUseCase, PolicyVersionUseCase {

    override fun createPolicy(command: CreatePolicyCommand): Policy {
        val policy = Policy(
            name = command.name,
            description = command.description,
            content = command.content,
            rules = command.rules,
            createdBy = command.createdBy
        )
        return savePolicyPort.save(policy)
    }

    override fun updatePolicy(command: UpdatePolicyCommand): Policy {
        val existing = loadPolicyPort.findById(command.policyId)
            ?: throw IllegalArgumentException("Policy not found: ${command.policyId}")

        val updated = existing.copy(
            name = command.name ?: existing.name,
            description = command.description ?: existing.description,
            content = command.content ?: existing.content,
            rules = command.rules ?: existing.rules,
            status = command.status ?: existing.status,
            updatedAt = Instant.now()
        )
        return savePolicyPort.save(updated)
    }

    override fun deletePolicy(policyId: UUID) {
        savePolicyPort.delete(policyId)
    }

    override fun findById(policyId: UUID): Policy? {
        return loadPolicyPort.findById(policyId)
    }

    override fun findAll(status: PolicyStatus?): List<Policy> {
        return loadPolicyPort.findAll(status)
    }

    override fun publishVersion(policyId: UUID): Policy {
        val existing = loadPolicyPort.findById(policyId)
            ?: throw IllegalArgumentException("Policy not found: $policyId")

        val published = existing.copy(
            version = existing.version + 1,
            status = PolicyStatus.ACTIVE,
            updatedAt = Instant.now()
        )
        return savePolicyPort.save(published)
    }

    override fun getVersionHistory(policyId: UUID): List<Policy> {
        return loadPolicyPort.findVersionHistory(policyId)
    }

    override fun rollbackToVersion(policyId: UUID, version: Int): Policy {
        val target = loadPolicyPort.findByVersion(policyId, version)
            ?: throw IllegalArgumentException("Policy version not found: $policyId v$version")

        val rolledBack = target.copy(updatedAt = Instant.now())
        return savePolicyPort.save(rolledBack)
    }
}
