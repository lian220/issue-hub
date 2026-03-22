package com.issuehub.ai.port.outbound

/**
 * LLM 텍스트 생성 포트 (Q&A, 분류, 요약)
 * 구현체: GeminiLlmAdapter, OpenAiLlmAdapter, OllamaLlmAdapter
 */
interface LlmPort {
    fun generate(prompt: String, context: List<String> = emptyList()): LlmResponse
    fun classify(text: String, categories: List<String>): ClassificationResult
}

data class LlmResponse(
    val content: String,
    val tokenUsage: Int
)

data class ClassificationResult(
    val category: String,
    val confidence: Double
)
