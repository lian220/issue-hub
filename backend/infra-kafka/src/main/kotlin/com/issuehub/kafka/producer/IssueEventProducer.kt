package com.issuehub.kafka.producer

import com.fasterxml.jackson.databind.ObjectMapper
import com.issuehub.kafka.config.KafkaConfig
import org.slf4j.LoggerFactory
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Component

@Component
class IssueEventProducer(
    private val kafkaTemplate: KafkaTemplate<String, String>,
    private val objectMapper: ObjectMapper
) {

    private val log = LoggerFactory.getLogger(javaClass)

    fun publishIssueCreated(issueId: String, payload: Map<String, Any>) {
        val message = objectMapper.writeValueAsString(
            mapOf(
                "eventType" to "ISSUE_CREATED",
                "issueId" to issueId,
                "payload" to payload
            )
        )
        kafkaTemplate.send(KafkaConfig.TOPIC_ISSUE_EVENTS, issueId, message)
            .whenComplete { result, ex ->
                if (ex != null) {
                    log.error("Failed to publish ISSUE_CREATED for {}: {}", issueId, ex.message)
                } else {
                    log.debug("Published ISSUE_CREATED for {} at offset {}", issueId, result.recordMetadata.offset())
                }
            }
    }

    fun publishIssueUpdated(issueId: String, payload: Map<String, Any>) {
        val message = objectMapper.writeValueAsString(
            mapOf(
                "eventType" to "ISSUE_UPDATED",
                "issueId" to issueId,
                "payload" to payload
            )
        )
        kafkaTemplate.send(KafkaConfig.TOPIC_ISSUE_EVENTS, issueId, message)
            .whenComplete { result, ex ->
                if (ex != null) {
                    log.error("Failed to publish ISSUE_UPDATED for {}: {}", issueId, ex.message)
                } else {
                    log.debug("Published ISSUE_UPDATED for {} at offset {}", issueId, result.recordMetadata.offset())
                }
            }
    }
}
