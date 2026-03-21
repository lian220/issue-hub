package com.issuehub.automation.port.outbound

import java.util.UUID

interface NotificationPort {

    fun sendNotification(request: NotificationRequest)

    data class NotificationRequest(
        val recipientId: UUID,
        val channel: String,
        val subject: String,
        val body: String,
        val metadata: Map<String, Any> = emptyMap()
    )
}
