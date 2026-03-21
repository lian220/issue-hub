plugins {
    kotlin("plugin.spring")
    id("org.springframework.boot")
    id("io.spring.dependency-management")
}

dependencies {
    implementation(project(":core-domain"))
    implementation(project(":core-issue"))
    implementation(project(":core-policy"))
    implementation(project(":core-automation"))
    implementation(project(":core-connector"))
    implementation(project(":infra-persistence"))
    implementation(project(":infra-kafka"))
    implementation(project(":infra-webhook"))

    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
}
