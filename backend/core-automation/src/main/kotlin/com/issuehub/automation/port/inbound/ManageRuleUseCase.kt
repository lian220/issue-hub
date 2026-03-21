package com.issuehub.automation.port.inbound

import com.issuehub.domain.enums.ActionType
import com.issuehub.domain.enums.TriggerType
import com.issuehub.domain.model.AutomationRule
import java.util.UUID

interface ManageRuleUseCase {

    fun createRule(command: CreateRuleCommand): AutomationRule

    fun updateRule(command: UpdateRuleCommand): AutomationRule

    fun deleteRule(ruleId: UUID)

    fun enableRule(ruleId: UUID): AutomationRule

    fun disableRule(ruleId: UUID): AutomationRule

    fun findAll(): List<AutomationRule>

    data class CreateRuleCommand(
        val name: String,
        val description: String? = null,
        val triggerType: TriggerType,
        val triggerConfig: Map<String, Any> = emptyMap(),
        val actionType: ActionType,
        val actionConfig: Map<String, Any> = emptyMap(),
        val priority: Int = 0,
        val createdBy: UUID
    )

    data class UpdateRuleCommand(
        val ruleId: UUID,
        val name: String? = null,
        val description: String? = null,
        val triggerConfig: Map<String, Any>? = null,
        val actionConfig: Map<String, Any>? = null,
        val priority: Int? = null
    )
}
