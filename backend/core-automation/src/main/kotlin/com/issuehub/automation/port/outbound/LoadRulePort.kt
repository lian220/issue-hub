package com.issuehub.automation.port.outbound

import com.issuehub.domain.enums.TriggerType
import com.issuehub.domain.model.AutomationRule
import java.util.UUID

interface LoadRulePort {

    fun findById(id: UUID): AutomationRule?

    fun findAll(): List<AutomationRule>

    fun findByTriggerType(triggerType: TriggerType): List<AutomationRule>

    fun findEnabled(): List<AutomationRule>
}
