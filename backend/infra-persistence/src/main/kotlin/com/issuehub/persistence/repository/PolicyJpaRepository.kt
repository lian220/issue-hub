package com.issuehub.persistence.repository

import com.issuehub.domain.enums.PolicyStatus
import com.issuehub.persistence.entity.PolicyJpaEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PolicyJpaRepository : JpaRepository<PolicyJpaEntity, UUID> {

    fun findByStatus(status: PolicyStatus): List<PolicyJpaEntity>

    fun findByIdOrderByVersionDesc(id: UUID): List<PolicyJpaEntity>
}
