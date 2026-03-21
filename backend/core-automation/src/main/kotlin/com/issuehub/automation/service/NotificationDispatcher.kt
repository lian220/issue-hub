package com.issuehub.automation.service

import com.issuehub.automation.port.outbound.NotificationPort
import com.issuehub.automation.port.outbound.NotificationPort.NotificationRequest
import java.util.UUID

class NotificationDispatcher(
    private val notificationPort: NotificationPort
) {

    fun dispatch(recipientId: UUID, channel: String, subject: String, body: String) {
        notificationPort.sendNotification(
            NotificationRequest(
                recipientId = recipientId,
                channel = channel,
                subject = subject,
                body = body
            )
        )
    }

    fun dispatchBulk(requests: List<NotificationRequest>) {
        requests.forEach { request ->
            notificationPort.sendNotification(request)
        }
    }
}
