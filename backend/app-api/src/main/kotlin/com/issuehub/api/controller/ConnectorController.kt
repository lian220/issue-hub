package com.issuehub.api.controller

import com.issuehub.connector.port.inbound.ConfigureConnectorUseCase
import com.issuehub.connector.port.inbound.ConfigureConnectorUseCase.ConnectionTestResult
import com.issuehub.connector.port.inbound.SyncUseCase
import com.issuehub.connector.port.inbound.SyncUseCase.SyncResult
import com.issuehub.domain.enums.ConnectorPlatform
import com.issuehub.domain.model.ConnectorConfig
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/connectors")
class ConnectorController(
    private val configureConnectorUseCase: ConfigureConnectorUseCase,
    private val syncUseCase: SyncUseCase
) {

    @PostMapping
    fun createConnector(@RequestBody request: CreateConnectorRequest): ResponseEntity<ConnectorConfig> {
        val command = ConfigureConnectorUseCase.CreateConnectorCommand(
            name = request.name,
            platform = request.platform,
            baseUrl = request.baseUrl,
            credentials = request.credentials.toByteArray(),
            projectKey = request.projectKey,
            syncIntervalMinutes = request.syncIntervalMinutes ?: 15,
            fieldMappings = request.fieldMappings ?: emptyMap(),
            createdBy = request.createdBy
        )
        val config = configureConnectorUseCase.createConnector(command)
        return ResponseEntity.status(HttpStatus.CREATED).body(config)
    }

    @GetMapping
    fun listConnectors(): ResponseEntity<List<ConnectorConfig>> {
        return ResponseEntity.ok(configureConnectorUseCase.findAll())
    }

    @DeleteMapping("/{id}")
    fun deleteConnector(@PathVariable id: UUID): ResponseEntity<Void> {
        configureConnectorUseCase.deleteConnector(id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/test")
    fun testConnection(@PathVariable id: UUID): ResponseEntity<ConnectionTestResult> {
        val result = configureConnectorUseCase.testConnection(id)
        return ResponseEntity.ok(result)
    }

    @PostMapping("/{id}/sync")
    fun syncConnector(@PathVariable id: UUID): ResponseEntity<SyncResult> {
        val result = syncUseCase.syncConnector(id)
        return ResponseEntity.ok(result)
    }

    @PostMapping("/sync-all")
    fun syncAll(): ResponseEntity<List<SyncResult>> {
        return ResponseEntity.ok(syncUseCase.syncAll())
    }

    data class CreateConnectorRequest(
        val name: String,
        val platform: ConnectorPlatform,
        val baseUrl: String,
        val credentials: String,
        val projectKey: String? = null,
        val syncIntervalMinutes: Int? = null,
        val fieldMappings: Map<String, String>? = null,
        val createdBy: UUID
    )
}
