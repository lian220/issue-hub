package com.issuehub.automation.service

import com.issuehub.automation.port.inbound.ExecuteRuleUseCase
import com.issuehub.automation.port.inbound.ExecuteRuleUseCase.RuleExecutionContext
import com.issuehub.automation.port.inbound.ExecuteRuleUseCase.RuleExecutionResult
import com.issuehub.automation.port.outbound.LoadRulePort
import com.issuehub.domain.model.AutomationRule

class RuleEvaluator(
    private val loadRulePort: LoadRulePort,
    private val notificationDispatcher: NotificationDispatcher
) : ExecuteRuleUseCase {

    override fun evaluateAndExecute(context: RuleExecutionContext): List<RuleExecutionResult> {
        val matchingRules = loadRulePort.findByTriggerType(context.triggerType)
            .filter { it.enabled }
            .sortedBy { it.priority }

        return matchingRules.map { rule ->
            executeRule(rule, context)
        }
    }

    private fun executeRule(rule: AutomationRule, context: RuleExecutionContext): RuleExecutionResult {
        return try {
            val matches = evaluateConditions(rule, context)
            if (matches) {
                performAction(rule, context)
                RuleExecutionResult(
                    ruleId = rule.id,
                    ruleName = rule.name,
                    executed = true,
                    outcome = "Action ${rule.actionType} executed successfully"
                )
            } else {
                RuleExecutionResult(
                    ruleId = rule.id,
                    ruleName = rule.name,
                    executed = false,
                    outcome = "Conditions not met"
                )
            }
        } catch (e: Exception) {
            RuleExecutionResult(
                ruleId = rule.id,
                ruleName = rule.name,
                executed = false,
                outcome = "Execution failed",
                error = e.message
            )
        }
    }

    private fun evaluateConditions(rule: AutomationRule, context: RuleExecutionContext): Boolean {
        val conditions = rule.triggerConfig
        if (conditions.isEmpty()) return true

        return conditions.all { (key, expectedValue) ->
            context.payload[key]?.toString() == expectedValue.toString()
        }
    }

    private fun performAction(rule: AutomationRule, context: RuleExecutionContext) {
        // Action execution delegated to specialized handlers based on rule.actionType
        // This is a simplified dispatcher; production would use a strategy pattern
    }
}
