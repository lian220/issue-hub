package com.issuehub.webhook.controller

import com.issuehub.webhook.security.WebhookSignatureVerifier
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/webhooks/github")
class GitHubWebhookController(
    private val signatureVerifier: WebhookSignatureVerifier
) {

    private val log = LoggerFactory.getLogger(javaClass)

    @Value("\${issuehub.webhook.github.secret:}")
    private lateinit var webhookSecret: String

    @PostMapping
    fun handleGitHubWebhook(
        @RequestBody payload: ByteArray,
        @RequestHeader("X-Hub-Signature-256", required = false) signature: String?,
        @RequestHeader("X-GitHub-Event", required = false) event: String?
    ): ResponseEntity<Map<String, String>> {
        log.info("Received GitHub webhook: event={}", event)

        if (webhookSecret.isNotBlank() && signature != null) {
            if (!signatureVerifier.verifyGitHubSignature(payload, signature, webhookSecret)) {
                log.warn("Invalid GitHub webhook signature")
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(mapOf("error" to "Invalid signature"))
            }
        }

        // Parse and delegate to SyncUseCase when wired
        return ResponseEntity.ok(mapOf("status" to "accepted"))
    }
}
