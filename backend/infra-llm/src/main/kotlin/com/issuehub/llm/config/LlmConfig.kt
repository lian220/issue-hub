package com.issuehub.llm.config

/**
 * LLM 벤더 설정
 *
 * application.yml 예시:
 * issuehub:
 *   ai:
 *     llm-provider: ollama        # ollama | openai | claude (기본: ollama)
 *     embedding-provider: ollama   # ollama | openai | claude (기본: ollama)
 *     pii-detection: regex         # regex | llm
 */
class LlmConfig
