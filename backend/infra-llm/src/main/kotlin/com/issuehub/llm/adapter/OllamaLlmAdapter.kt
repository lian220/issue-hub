package com.issuehub.llm.adapter

import com.issuehub.ai.port.outbound.ClassificationResult
import com.issuehub.ai.port.outbound.LlmPort
import com.issuehub.ai.port.outbound.LlmResponse

/**
 * Ollama API LLM 어댑터 (기본)
 * application.yml의 issuehub.ai.llm-provider=ollama 일 때 활성화
 *
 * Ollama REST API:
 * - POST /api/generate (텍스트 생성)
 * - POST /api/chat (대화)
 */
class OllamaLlmAdapter : LlmPort {

    override fun generate(prompt: String, context: List<String>): LlmResponse {
        // TODO: Ollama REST API 연동 (Phase 3)
        throw UnsupportedOperationException("OllamaLlmAdapter not yet implemented")
    }

    override fun classify(text: String, categories: List<String>): ClassificationResult {
        // TODO: Ollama REST API 연동 (Phase 3)
        throw UnsupportedOperationException("OllamaLlmAdapter not yet implemented")
    }
}
