plugins {
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.kotlin.jpa)
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
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
    implementation(project(":core-policy"))
    implementation(project(":core-automation"))
    implementation(project(":core-connector"))

    implementation(libs.bundles.spring.data.jpa)
    runtimeOnly(libs.postgresql)
}
