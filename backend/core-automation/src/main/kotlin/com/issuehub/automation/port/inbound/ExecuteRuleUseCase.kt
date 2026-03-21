package com.issuehub.automation.port.inbound

import com.issuehub.domain.enums.TriggerType
import java.util.UUID

interface ExecuteRuleUseCase {

    fun evaluateAndExecute(context: RuleExecutionContext): List<RuleExecutionResult>

    data class RuleExecutionContext(
        val triggerType: TriggerType,
        val entityId: UUID,
        val entityType: String,
        val payload: Map<String, Any> = emptyMap()
    )

    data class RuleExecutionResult(
        val ruleId: UUID,
        val ruleName: String,
        val executed: Boolean,
        val outcome: String,
        val error: String? = null
    )
}
