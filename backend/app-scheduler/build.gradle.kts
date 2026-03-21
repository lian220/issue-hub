plugins {
    kotlin("plugin.spring")
    id("org.springframework.boot")
    id("io.spring.dependency-management")
}

tasks.getByName<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
    enabled = false
}

tasks.getByName<Jar>("jar") {
    enabled = true
}

dependencies {
    implementation(project(":core-domain"))
    implementation(project(":core-issue"))
    implementation(project(":core-connector"))
    implementation(project(":infra-persistence"))

    implementation("org.springframework.boot:spring-boot-starter")
}
