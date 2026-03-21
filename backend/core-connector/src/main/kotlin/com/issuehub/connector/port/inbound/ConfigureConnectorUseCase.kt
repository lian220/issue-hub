package com.issuehub.connector.port.inbound

import com.issuehub.domain.enums.ConnectorPlatform
import com.issuehub.domain.model.ConnectorConfig
import java.util.UUID

interface ConfigureConnectorUseCase {

    fun createConnector(command: CreateConnectorCommand): ConnectorConfig

    fun updateConnector(command: UpdateConnectorCommand): ConnectorConfig

    fun deleteConnector(connectorId: UUID)

    fun testConnection(connectorId: UUID): ConnectionTestResult

    fun findAll(): List<ConnectorConfig>

    data class CreateConnectorCommand(
        val name: String,
        val platform: ConnectorPlatform,
        val baseUrl: String,
        val credentials: ByteArray,
        val projectKey: String? = null,
        val syncIntervalMinutes: Int = 15,
        val fieldMappings: Map<String, String> = emptyMap(),
        val createdBy: UUID
    )

    data class UpdateConnectorCommand(
        val connectorId: UUID,
        val name: String? = null,
        val baseUrl: String? = null,
        val credentials: ByteArray? = null,
        val projectKey: String? = null,
        val syncEnabled: Boolean? = null,
        val syncIntervalMinutes: Int? = null,
        val fieldMappings: Map<String, String>? = null
    )

    data class ConnectionTestResult(
        val success: Boolean,
        val message: String,
        val latencyMs: Long
    )
}
