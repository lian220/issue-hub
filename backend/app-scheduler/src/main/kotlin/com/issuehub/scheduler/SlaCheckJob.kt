package com.issuehub.scheduler

import com.issuehub.issue.port.outbound.LoadIssuePort
import com.issuehub.issue.port.outbound.SaveIssuePort
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.Instant

@Component
class SlaCheckJob(
    private val loadIssuePort: LoadIssuePort,
    private val saveIssuePort: SaveIssuePort
) {

    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(fixedDelayString = "\${issuehub.scheduler.sla-check-interval:60000}")
    fun checkSlaBreaches() {
        log.info("Running SLA breach check at {}", Instant.now())

        val candidates = loadIssuePort.findSlaBreach()
        if (candidates.isEmpty()) {
            log.debug("No SLA breaches detected")
            return
        }

        log.warn("Detected {} SLA breach candidates", candidates.size)

        val breached = candidates.map { issue ->
            issue.copy(slaBreached = true, updatedAt = Instant.now())
        }

        saveIssuePort.saveAll(breached)
        log.info("Marked {} issues as SLA breached", breached.size)

        // Trigger notifications via automation rule engine when wired
    }
}
