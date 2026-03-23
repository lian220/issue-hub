---
Status: Accepted
Date: 2026-03-22
---

# 004: LLM 추상화 및 벤더 교체 전략

## Context

IssueHub Phase 3에서 RAG 기반 AI 기능(정책 Q&A, 유사 이슈 탐지, 자동 분류, 정책 위반 감지)을 도입한다. 초기 LLM은 Google Gemini API를 사용하지만, 벤더 종속을 피하고 향후 교체/병행이 가능해야 한다.

## Decision

> **Update (2026-03-23):** 브레인스토밍 결과, 기본 LLM을 Gemini API에서 Ollama(로컬)로 변경. Claude API를 폴백으로 추가. 상세: docs/superpowers/specs/2026-03-22-issuehub-ai-code-platform-design.md

### 포트/어댑터 패턴으로 LLM 추상화

헥사고날 아키텍처의 포트/어댑터 패턴을 LLM 연동에도 적용한다. LLM 관련 기능을 포트 인터페이스로 정의하고, 각 벤더별 어댑터를 구현한다.

### 모듈 구조

```
core-ai/
├── port/outbound/
│   ├── LlmPort.kt              # 텍스트 생성 인터페이스 (Q&A, 분류, 요약)
│   ├── EmbeddingPort.kt         # 임베딩 변환 인터페이스
│   └── PiiDetectionPort.kt      # PII 탐지 인터페이스
├── service/
│   ├── PolicyQaService.kt       # 정책 Q&A (LlmPort + EmbeddingPort 사용)
│   ├── SimilarIssueService.kt   # 유사 이슈 탐지 (EmbeddingPort 사용)
│   ├── IssueClassifier.kt       # 이슈 자동 분류 (LlmPort 사용)
│   └── ViolationDetector.kt     # 정책 위반 감지 (EmbeddingPort 사용)

infra-llm/
├── adapter/
│   ├── GeminiLlmAdapter.kt      # Google Gemini API (기본)
│   ├── GeminiEmbeddingAdapter.kt # Gemini text-embedding-004
│   ├── OpenAiLlmAdapter.kt      # OpenAI GPT (교체 옵션)
│   ├── OpenAiEmbeddingAdapter.kt # OpenAI text-embedding-3-small
│   ├── OllamaLlmAdapter.kt      # Ollama 로컬 LLM (오프라인 옵션)
│   └── OllamaEmbeddingAdapter.kt # Ollama 로컬 임베딩
├── config/
│   └── LlmConfig.kt             # 벤더 선택 설정 (application.yml 기반)
```

### 포트 인터페이스 설계

```kotlin
// LlmPort.kt
interface LlmPort {
    fun generate(prompt: String, context: List<String> = emptyList()): LlmResponse
    fun classify(text: String, categories: List<String>): ClassificationResult
}

// EmbeddingPort.kt
interface EmbeddingPort {
    fun embed(text: String): FloatArray
    fun embedBatch(texts: List<String>): List<FloatArray>
    fun dimensions(): Int  // 벤더마다 차원이 다르므로 동적 조회
}

// PiiDetectionPort.kt
interface PiiDetectionPort {
    fun detect(text: String): List<PiiMatch>
    fun sanitize(text: String): String
}
```

### 벤더 전환 방법

application.yml 설정으로 벤더를 전환한다:

```yaml
issuehub:
  ai:
    llm-provider: ollama    # ollama | gemini | openai | claude
    embedding-provider: gemini
    pii-detection: regex     # regex | llm
```

### 임베딩 차원 호환성

벤더마다 임베딩 차원이 다르므로 (Gemini: 768, OpenAI: 1536, Ollama: 모델별 상이), DB의 vector 컬럼은 EmbeddingPort.dimensions()에 따라 마이그레이션이 필요하다.

| 벤더 | 모델 | 차원 |
| --- | --- | --- |
| Google Gemini | text-embedding-004 | 768 |
| OpenAI | text-embedding-3-small | 1536 |
| OpenAI | text-embedding-3-large | 3072 |
| Ollama | nomic-embed-text | 768 |

벤더 전환 시 기존 임베딩 데이터는 재생성이 필요하다 (배치 재인덱싱 스케줄러 활용).

## Consequences

### 장점
- LLM 벤더 종속 없음: 설정 변경만으로 Gemini → OpenAI → 로컬 LLM 전환 가능
- 테스트 용이: 포트 인터페이스를 Mock으로 대체하여 AI 의존 없이 테스트 가능
- 비용 최적화: 기능별로 다른 벤더 사용 가능 (예: 임베딩은 로컬, Q&A는 Gemini)
- 오프라인 지원: Ollama 어댑터로 인터넷 없이도 기본 AI 기능 사용 가능

### 단점
- 추상화 레이어 유지 비용
- 벤더 전환 시 임베딩 재생성 필요 (대규모 데이터 시 시간 소요)
- 각 벤더의 고유 기능(function calling 등)을 공통 인터페이스로 추상화하기 어려울 수 있음

### 리스크 대응
- 임베딩 재생성은 배치 스케줄러로 비동기 처리
- 벤더 고유 기능이 필요한 경우 어댑터 내부에서만 처리, 포트 인터페이스는 공통 기능만 노출
