package com.issuehub.connector.port.outbound

interface ExternalNotificationPort {

    fun sendMessage(channel: String, message: String)

    fun sendDirectMessage(userId: String, message: String)

    fun sendRichMessage(channel: String, payload: Map<String, Any>)
}
