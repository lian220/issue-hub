package com.issuehub.llm.adapter

import com.issuehub.ai.port.outbound.EmbeddingPort

/**
 * Ollama 임베딩 어댑터 (기본)
 * application.yml의 issuehub.ai.embedding-provider=ollama 일 때 활성화
 *
 * Ollama REST API:
 * - POST /api/embeddings
 */
class OllamaEmbeddingAdapter : EmbeddingPort {

    override fun embed(text: String): FloatArray {
        // TODO: Ollama REST API 연동 (Phase 3)
        throw UnsupportedOperationException("OllamaEmbeddingAdapter not yet implemented")
    }

    override fun embedBatch(texts: List<String>): List<FloatArray> {
        // TODO: Ollama REST API 연동 (Phase 3)
        throw UnsupportedOperationException("OllamaEmbeddingAdapter not yet implemented")
    }

    override fun dimensions(): Int = 768
}
