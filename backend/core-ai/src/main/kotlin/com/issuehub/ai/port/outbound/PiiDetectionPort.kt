package com.issuehub.ai.port.outbound

/**
 * PII(개인정보) 탐지 포트
 * 구현체: RegexPiiDetector (Phase 1), LlmPiiDetector (Phase 3)
 */
interface PiiDetectionPort {
    fun detect(text: String): List<PiiMatch>
    fun sanitize(text: String): String
}

data class PiiMatch(
    val type: PiiType,
    val value: String,
    val startIndex: Int,
    val endIndex: Int
)

enum class PiiType {
    RESIDENT_NUMBER,
    PHONE_NUMBER,
    EMAIL,
    CREDIT_CARD
}
