package com.issuehub.domain.model

import com.issuehub.domain.enums.ActionType
import com.issuehub.domain.enums.TriggerType
import java.time.Instant
import java.util.UUID

data class AutomationRule(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val description: String? = null,
    val triggerType: TriggerType,
    val triggerConfig: Map<String, Any> = emptyMap(),
    val actionType: ActionType,
    val actionConfig: Map<String, Any> = emptyMap(),
    val enabled: Boolean = true,
    val priority: Int = 0,
    val createdBy: UUID,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)
