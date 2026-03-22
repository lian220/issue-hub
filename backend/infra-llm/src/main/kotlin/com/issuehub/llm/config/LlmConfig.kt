package com.issuehub.llm.config

/**
 * LLM 벤더 설정
 *
 * application.yml 예시:
 * issuehub:
 *   ai:
 *     llm-provider: gemini       # gemini | openai | ollama
 *     embedding-provider: gemini  # gemini | openai | ollama
 *     pii-detection: regex        # regex | llm
 */
class LlmConfig
