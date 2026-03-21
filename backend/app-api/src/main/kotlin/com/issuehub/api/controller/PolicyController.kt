package com.issuehub.api.controller

import com.issuehub.domain.enums.PolicyStatus
import com.issuehub.domain.model.Policy
import com.issuehub.policy.port.inbound.PolicyCrudUseCase
import com.issuehub.policy.port.inbound.PolicyCrudUseCase.CreatePolicyCommand
import com.issuehub.policy.port.inbound.PolicyCrudUseCase.UpdatePolicyCommand
import com.issuehub.policy.port.inbound.PolicyVersionUseCase
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/policies")
class PolicyController(
    private val policyCrudUseCase: PolicyCrudUseCase,
    private val policyVersionUseCase: PolicyVersionUseCase
) {

    @PostMapping
    fun createPolicy(@RequestBody request: CreatePolicyRequest): ResponseEntity<Policy> {
        val command = CreatePolicyCommand(
            name = request.name,
            description = request.description,
            content = request.content,
            rules = request.rules ?: emptyMap(),
            createdBy = request.createdBy
        )
        val policy = policyCrudUseCase.createPolicy(command)
        return ResponseEntity.status(HttpStatus.CREATED).body(policy)
    }

    @GetMapping("/{id}")
    fun getPolicy(@PathVariable id: UUID): ResponseEntity<Policy> {
        val policy = policyCrudUseCase.findById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(policy)
    }

    @GetMapping
    fun listPolicies(@RequestParam(required = false) status: PolicyStatus?): ResponseEntity<List<Policy>> {
        return ResponseEntity.ok(policyCrudUseCase.findAll(status))
    }

    @PatchMapping("/{id}")
    fun updatePolicy(
        @PathVariable id: UUID,
        @RequestBody request: UpdatePolicyRequest
    ): ResponseEntity<Policy> {
        val command = UpdatePolicyCommand(
            policyId = id,
            name = request.name,
            description = request.description,
            content = request.content,
            rules = request.rules,
            status = request.status
        )
        val policy = policyCrudUseCase.updatePolicy(command)
        return ResponseEntity.ok(policy)
    }

    @DeleteMapping("/{id}")
    fun deletePolicy(@PathVariable id: UUID): ResponseEntity<Void> {
        policyCrudUseCase.deletePolicy(id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/publish")
    fun publishVersion(@PathVariable id: UUID): ResponseEntity<Policy> {
        val policy = policyVersionUseCase.publishVersion(id)
        return ResponseEntity.ok(policy)
    }

    @GetMapping("/{id}/versions")
    fun getVersionHistory(@PathVariable id: UUID): ResponseEntity<List<Policy>> {
        return ResponseEntity.ok(policyVersionUseCase.getVersionHistory(id))
    }

    data class CreatePolicyRequest(
        val name: String,
        val description: String? = null,
        val content: String,
        val rules: Map<String, Any>? = null,
        val createdBy: UUID
    )

    data class UpdatePolicyRequest(
        val name: String? = null,
        val description: String? = null,
        val content: String? = null,
        val rules: Map<String, Any>? = null,
        val status: PolicyStatus? = null
    )
}
