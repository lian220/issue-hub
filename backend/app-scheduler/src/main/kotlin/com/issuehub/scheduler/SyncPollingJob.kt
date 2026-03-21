package com.issuehub.scheduler

import com.issuehub.connector.port.inbound.SyncUseCase
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.Instant

@Component
class SyncPollingJob(
    private val syncUseCase: SyncUseCase
) {

    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(fixedDelayString = "\${issuehub.scheduler.sync-poll-interval:900000}")
    fun pollConnectors() {
        log.info("Running connector sync poll at {}", Instant.now())

        val results = syncUseCase.syncAll()

        results.forEach { result ->
            log.info(
                "Connector {} sync complete: created={}, updated={}, deleted={}, conflicts={}, errors={}",
                result.connectorId,
                result.created,
                result.updated,
                result.deleted,
                result.conflicts,
                result.errors.size
            )
        }

        log.info("Sync poll completed. Processed {} connectors", results.size)
    }
}
