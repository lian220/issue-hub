package com.issuehub.api

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@SpringBootApplication(
    scanBasePackages = ["com.issuehub"]
)
@EntityScan(basePackages = ["com.issuehub.persistence.entity"])
@EnableJpaRepositories(basePackages = ["com.issuehub.persistence.repository"])
class IssueHubApplication

fun main(args: Array<String>) {
    runApplication<IssueHubApplication>(*args)
}
