package com.issuehub.kafka.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.issuehub.kafka.config.KafkaConfig
import org.slf4j.LoggerFactory
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.stereotype.Component

@Component
class IssueSyncConsumer(
    private val objectMapper: ObjectMapper
) {

    private val log = LoggerFactory.getLogger(javaClass)

    @KafkaListener(
        topics = [KafkaConfig.TOPIC_SYNC_COMMANDS],
        groupId = "\${spring.kafka.consumer.group-id:issuehub-group}"
    )
    fun onSyncCommand(message: String) {
        log.info("Received sync command: {}", message)
        try {
            val command = objectMapper.readValue(message, Map::class.java)
            val connectorId = command["connectorId"] as? String
            val action = command["action"] as? String

            log.info("Processing sync command: action={}, connectorId={}", action, connectorId)
            // Delegate to SyncOrchestrator via port when wired
        } catch (e: Exception) {
            log.error("Failed to process sync command: {}", e.message, e)
        }
    }
}
