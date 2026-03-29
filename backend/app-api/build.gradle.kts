plugins {
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

dependencies {
    implementation(project(":core-domain"))
    implementation(project(":core-issue"))
    implementation(project(":core-policy"))
    implementation(project(":core-automation"))
    implementation(project(":core-connector"))
    implementation(project(":infra-persistence"))
    // implementation(project(":infra-kafka"))  // Phase 2 이후 활성화
    implementation(project(":infra-webhook"))

    implementation(libs.bundles.spring.web)
    implementation(libs.spring.boot.starter.data.jpa)
    implementation(libs.spring.boot.starter.security)
    implementation(libs.spring.boot.starter.actuator)
    implementation(libs.spring.boot.starter.data.redis)
}
