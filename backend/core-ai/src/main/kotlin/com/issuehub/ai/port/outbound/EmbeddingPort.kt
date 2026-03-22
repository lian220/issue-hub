package com.issuehub.ai.port.outbound

/**
 * 임베딩 변환 포트
 * 구현체: GeminiEmbeddingAdapter, OpenAiEmbeddingAdapter, OllamaEmbeddingAdapter
 */
interface EmbeddingPort {
    fun embed(text: String): FloatArray
    fun embedBatch(texts: List<String>): List<FloatArray>
    fun dimensions(): Int
}
