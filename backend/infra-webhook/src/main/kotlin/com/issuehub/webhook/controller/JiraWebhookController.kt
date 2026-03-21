package com.issuehub.webhook.controller

import com.issuehub.webhook.security.WebhookSignatureVerifier
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/webhooks/jira")
class JiraWebhookController(
    private val signatureVerifier: WebhookSignatureVerifier
) {

    private val log = LoggerFactory.getLogger(javaClass)

    @PostMapping
    fun handleJiraWebhook(
        @RequestBody payload: String,
        @RequestHeader("X-Atlassian-Webhook-Identifier", required = false) webhookId: String?
    ): ResponseEntity<Map<String, String>> {
        log.info("Received Jira webhook: id={}", webhookId)

        // Parse and delegate to SyncUseCase when wired
        return ResponseEntity.ok(mapOf("status" to "accepted"))
    }
}
