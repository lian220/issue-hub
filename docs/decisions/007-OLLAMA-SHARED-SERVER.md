---
Status: Draft
Date: 2026-03-22
---

# 007: Ollama 공유 서버 아키텍처 분석 (Mac Mini M4 Pro 48GB)

## 개요

단일 Mac Mini M4 Pro (48GB) 서버에서 Ollama를 실행하여 IssueHub를 포함한 다수의 프로젝트/서비스에 LLM 추론을 제공하는 시나리오에 대한 심층 분석이다. 개인 데스크톱이 아닌 **공유 로컬 서버** 용도이다.

---

## 1. Ollama 공유 서비스 분석

### 1.1 동시성 모델 (Concurrency Model)

Ollama는 **두 단계의 동시 처리**를 지원한다:

| 수준 | 설명 | 제어 변수 |
|------|------|-----------|
| **모델 간 동시성** | 메모리가 충분하면 여러 모델을 동시에 로드 | `OLLAMA_MAX_LOADED_MODELS` |
| **모델 내 병렬 처리** | 하나의 로드된 모델이 여러 요청을 동시 처리 | `OLLAMA_NUM_PARALLEL` (기본값: 메모리에 따라 1 또는 4) |

**핵심 환경변수:**

```bash
# 동시에 메모리에 로드할 수 있는 최대 모델 수
OLLAMA_MAX_LOADED_MODELS=2

# 각 모델이 동시에 처리하는 최대 병렬 요청 수 (기본: 1 또는 4)
OLLAMA_NUM_PARALLEL=4

# 서버가 바쁠 때 큐에 대기시킬 최대 요청 수 (기본: 512)
OLLAMA_MAX_QUEUE=512

# 모델을 메모리에 유지하는 시간 (기본: 5분)
OLLAMA_KEEP_ALIVE=24h

# KV 캐시 양자화 (메모리 절약)
OLLAMA_KV_CACHE_TYPE=q8_0
```

### 1.2 큐 관리 및 과부하 처리

- **큐 방식**: FIFO (선입선출)
- **큐 크기**: 기본 512개 요청 (`OLLAMA_MAX_QUEUE`로 조정)
- **과부하 시**: 큐가 가득 차면 **HTTP 503** 응답 반환
- **자체 Rate Limiting**: 없음. 별도 구현 필요
- **우선순위 큐**: 없음. FIFO만 지원

### 1.3 5개 서비스가 동시 요청을 보내면?

`OLLAMA_NUM_PARALLEL=4`인 경우:

```
요청 1~4: 즉시 병렬 처리 시작 (동시 스트리밍 응답)
요청 5:   큐에 대기 → 요청 1~4 중 하나가 완료되면 처리 시작
```

**문제점**: 모든 요청이 같은 모델이면 배치 처리가 작동하지만, **서로 다른 모델 요청이 오면 모델 스왑이 발생**하여 심각한 지연이 생긴다.

---

## 2. 멀티 프로젝트 격리 분석

### 2.1 프로젝트별 모델 사용

Ollama는 요청별로 모델을 지정할 수 있다:

```bash
# 프로젝트 A: 코드 분석용 대형 모델
curl http://ollama-server:11434/api/chat -d '{
  "model": "qwen2.5-coder:32b-instruct-q4_K_M",
  "messages": [{"role": "user", "content": "..."}]
}'

# 프로젝트 B: 이슈 분류용 경량 모델
curl http://ollama-server:11434/api/chat -d '{
  "model": "qwen2.5:14b-instruct-q4_K_M",
  "messages": [{"role": "user", "content": "..."}]
}'
```

### 2.2 격리 수준 평가

| 기능 | Ollama 지원 여부 | 비고 |
|------|------------------|------|
| 프로젝트별 모델 선택 | O | 요청 시 model 파라미터로 지정 |
| 프로젝트별 Rate Limit | **X** | Ollama에 없음 → IssueHub에서 구현 필요 |
| 프로젝트별 우선순위 | **X** | FIFO만 지원 → IssueHub에서 구현 필요 |
| 사용자/API Key 인증 | **X** | 인증 기능 없음 → Reverse Proxy로 보완 |
| 사용량 추적 | 부분적 | 응답에 token 사용량 포함, 프로젝트별 집계는 직접 구현 |

### 2.3 메모리 관리와 모델 스왑

**48GB Mac Mini에서의 모델 로딩 시나리오:**

| 모델 | Q4_K_M 크기 | 메모리 (모델 + KV 캐시) | 비고 |
|------|-------------|----------------------|------|
| qwen2.5-coder:32b | ~20GB | ~24-26GB | 48GB 시스템에서 단독 로드 가능 |
| qwen2.5-coder:14b | ~9GB | ~12-14GB | 여유 있음 |
| qwen2.5:7b | ~5GB | ~7-8GB | 경량 |
| nomic-embed-text | ~274MB | ~0.5GB | 임베딩 전용, 항상 로드 가능 |

**동시 로딩 가능 조합 (48GB 기준, OS/시스템 ~8GB 예약):**

```
사용 가능 메모리: ~40GB

조합 1: 14B (14GB) + 임베딩 (0.5GB) = 14.5GB  ✅ 여유 충분
조합 2: 32B (26GB) + 임베딩 (0.5GB) = 26.5GB  ✅ 가능
조합 3: 14B (14GB) + 7B (8GB) + 임베딩 (0.5GB) = 22.5GB  ✅ 가능
조합 4: 32B (26GB) + 14B (14GB) = 40GB  ⚠️ 빠듯함, 스왑 위험
```

**모델 스왑 동작:**
- 메모리 부족 시 idle 모델을 자동 언로드
- 모델 로딩 시간: 14B 모델 기준 **약 5-15초** (Apple Silicon unified memory)
- `OLLAMA_KEEP_ALIVE`를 높게 설정하면 자주 쓰는 모델이 메모리에 상주
- 모델 스왑 중 새 요청은 큐에 대기

---

## 3. Ollama 서버 아키텍처

### 3.1 REST API 전체 엔드포인트

```
POST /api/generate          # 단일 프롬프트 텍스트 생성
POST /api/chat              # 대화형 메시지 생성 (OpenAI 호환 형식)
POST /api/embed             # 텍스트 → 벡터 임베딩 변환

GET  /api/tags              # 로컬 설치된 모델 목록 조회
GET  /api/ps                # 현재 메모리에 로드된 모델 상태 조회
POST /api/show              # 특정 모델 상세 정보

POST /api/pull              # 모델 다운로드
POST /api/push              # 모델 업로드 (ollama.com 레지스트리)
POST /api/create            # Modelfile로 커스텀 모델 생성
POST /api/copy              # 모델 복제 (다른 이름으로)
DELETE /api/delete           # 모델 삭제
```

**응답 형식**: 기본 NDJSON 스트리밍. `"stream": false`로 단일 JSON 응답 가능.

### 3.2 네트워크 접근 설정

```bash
# 기본: localhost만 접근 가능
# 네트워크 전체에 노출하려면:
OLLAMA_HOST=0.0.0.0:11434

# CORS 설정 (다른 도메인에서 접근 시)
OLLAMA_ORIGINS=http://issuehub-server:3000,http://192.168.1.0/24
```

**IssueHub에서 호출 예시 (같은 네트워크 내 다른 머신):**

```kotlin
// OllamaLlmAdapter.kt 에서
val response = webClient
    .post()
    .uri("http://mac-mini.local:11434/api/chat")
    .bodyValue(OllamaChatRequest(
        model = "qwen2.5-coder:14b-instruct-q4_K_M",
        messages = messages,
        stream = false
    ))
    .retrieve()
    .awaitBody<OllamaChatResponse>()
```

### 3.3 인증/보안

**Ollama에는 인증 기능이 전혀 없다.** 보안 확보 방안:

| 방법 | 복잡도 | 권장도 |
|------|--------|--------|
| **방화벽** (iptables/pf) | 낮음 | 필수 - 특정 IP만 허용 |
| **Nginx Reverse Proxy + Basic Auth** | 중간 | 권장 - API Key 기반 접근 제어 |
| **Tailscale/WireGuard VPN** | 중간 | 권장 - 네트워크 레벨 격리 |
| **SSH 터널링** | 낮음 | 가능 - 소규모 팀에 적합 |

**권장 구성: Nginx + IP 화이트리스트**

```nginx
upstream ollama {
    server 127.0.0.1:11434;
}

server {
    listen 11434;

    # IssueHub 서버 IP만 허용
    allow 192.168.1.10;
    allow 192.168.1.0/24;
    deny all;

    location / {
        proxy_pass http://ollama;
        proxy_set_header Host $host;

        # 요청 크기 제한 (대형 프롬프트 방어)
        client_max_body_size 10m;

        # 타임아웃 (LLM 추론은 느릴 수 있음)
        proxy_read_timeout 300s;
    }
}
```

### 3.4 동일 머신에서 다중 인스턴스 실행

가능하다. 각 인스턴스를 다른 포트와 데이터 디렉토리로 실행:

```bash
# 인스턴스 1: 추론 전용 (코드 분석, 이슈 분류)
OLLAMA_HOST=0.0.0.0:11434 OLLAMA_MODELS=/data/ollama-inference ollama serve

# 인스턴스 2: 임베딩 전용
OLLAMA_HOST=0.0.0.0:11435 OLLAMA_MODELS=/data/ollama-embedding ollama serve
```

**48GB Mac Mini에서는 비권장.** 메모리를 나눠 쓰면 각 인스턴스가 사용할 수 있는 메모리가 줄어든다. 단일 인스턴스에서 `OLLAMA_MAX_LOADED_MODELS`로 관리하는 것이 더 효율적.

---

## 4. 단일 Mac Mini 확장성 분석

### 4.1 현실적 처리량 추정

**하드웨어 스펙: Mac Mini M4 Pro 48GB**
- CPU: 14코어 (10P + 4E)
- GPU: 20코어
- 메모리 대역폭: ~273 GB/s
- 전력 소비: AI 부하 시 ~30W

**Qwen2.5-Coder-14B (Q4_K_M) 성능 추정치:**

| 지표 | 수치 | 비고 |
|------|------|------|
| 토큰 생성 속도 (단일 요청) | **~20-25 tok/s** | 14B Q4, Apple Silicon 최적화 |
| 토큰 생성 속도 (4 병렬) | **~8-12 tok/s/요청** | 병렬 시 개별 속도 감소 |
| 프롬프트 처리 속도 | **~200-400 tok/s** | 입력 프롬프트 처리 (prefill) |
| 평균 응답 길이 | ~500 토큰 | 이슈 분석 기준 |
| 단일 요청 응답 시간 | **~20-25초** | 500토큰 / 20-25 tok/s |
| 4 병렬 요청 응답 시간 | **~40-60초** | 처리량은 높지만 지연 증가 |

**분당 처리량 (throughput):**

```
단일 요청 직렬 처리: ~2-3 요청/분 (500토큰 기준)
4 병렬 처리:         ~4-6 요청/분 (응답 시간은 길지만 throughput 증가)
```

**임베딩 처리량 (nomic-embed-text):**

| 지표 | 수치 |
|------|------|
| 단일 텍스트 임베딩 | ~5-10ms |
| 배치 임베딩 (100건) | ~0.5-1초 |
| 분당 처리량 | ~6,000-12,000건 |

### 4.2 큐 깊이와 타임아웃

```bash
# 권장 설정
OLLAMA_MAX_QUEUE=100        # 512는 과도, 100이면 ~15-25분 대기
OLLAMA_NUM_PARALLEL=4       # 48GB에서 14B 모델은 4 병렬 가능
OLLAMA_KEEP_ALIVE=1h        # 모델 언로드 방지
OLLAMA_KV_CACHE_TYPE=q8_0   # KV 캐시 메모리 절약 (~50%)
```

**병렬 처리 시 메모리 공식:**
```
필요 메모리 = 모델 크기 + (OLLAMA_NUM_PARALLEL × 컨텍스트 길이 × KV 캐시 크기)
14B Q4: ~9GB + (4 × 32K 컨텍스트 × ~2GB/slot with q8_0) ≈ 9 + 8 = ~17GB
```

### 4.3 Mac Mini 1대를 넘어야 할 때

**수직 확장:**
- Mac Mini M4 Pro 48GB → Mac Studio M4 Ultra 192GB
- 192GB면 70B 모델도 가동 가능, 32B × 2 동시 로드 가능

**수평 확장:**
```
                    ┌──────────────────┐
                    │   Nginx / HAProxy │
                    │   (라운드 로빈)    │
                    └────┬────────┬────┘
                         │        │
              ┌──────────▼─┐  ┌──▼──────────┐
              │ Mac Mini #1 │  │ Mac Mini #2  │
              │ :11434      │  │ :11434       │
              │ 추론 전용    │  │ 추론 전용     │
              └─────────────┘  └──────────────┘
```

- Nginx upstream으로 2대 이상의 Mac Mini를 로드밸런싱
- 비용: Mac Mini M4 Pro 48GB ≈ $1,799/대

---

## 5. 대안 로컬 서빙 옵션 비교

### 5.1 종합 비교표

| 프레임워크 | Apple Silicon | 서버 모드 | OpenAI 호환 API | 동시 요청 | 모델 관리 | 공유 서버 적합도 |
|-----------|:----------:|:---------:|:--------------:|:---------:|:---------:|:--------------:|
| **Ollama** | O (Metal) | O | O (`/v1/chat/completions`) | O (내장 큐) | O (pull/push) | **A** |
| **llama.cpp server** | O (Metal) | O | 부분적 | O (slots) | X (수동) | B+ |
| **vLLM (vllm-mlx)** | O (MLX) | O | O | O (continuous batching) | X | B (아직 실험적) |
| **LM Studio** | O (Metal) | O | O | 제한적 | O (GUI) | C (GUI 의존) |
| **LocalAI** | O (Metal) | O | O | O | O | B |
| **MLX (직접)** | O (네이티브) | 커스텀 필요 | X | X | X | C |

### 5.2 상세 평가

**Ollama (권장)**
- 장점: 모델 관리가 쉬움, 내장 큐/병렬 처리, OpenAI 호환 API, 활발한 커뮤니티
- 단점: 인증 없음, 세밀한 스케줄링 불가, per-project 격리 없음
- 적합 시나리오: IssueHub처럼 자체 큐/우선순위 관리를 구현하는 경우

**llama.cpp server**
- 장점: 가장 가벼움, slot 기반 병렬 처리, 세밀한 메모리 제어
- 단점: 모델 관리 없음 (수동 다운로드), 설정 복잡
- 적합 시나리오: 단일 모델만 서빙하고 최대 성능이 필요한 경우

**vLLM (vllm-mlx)**
- 장점: continuous batching으로 최고 throughput, MLX 백엔드로 Apple Silicon 최적화
- 단점: 2025년 후반에 등장한 실험적 프로젝트, 안정성 미검증
- 적합 시나리오: throughput이 최우선이고 리스크를 감수할 수 있는 경우

**결론: Ollama가 현 시점에서 공유 서버용 최적 선택.** 모델 관리 편의성 + 내장 큐 + OpenAI 호환 API의 조합이 가장 실용적이다. IssueHub의 포트/어댑터 패턴 덕분에 향후 vllm-mlx가 안정화되면 전환도 가능하다.

---

## 6. IssueHub 통합 아키텍처

### 6.1 아키텍처 제안: IssueHub가 큐와 라우팅을 담당

```
┌─────────────────────────────────────────────────────────────────┐
│                      IssueHub 서버                               │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Project A │  │ Project B │  │ Project C │  │ Scheduler │       │
│  │ (Jira)   │  │ (GitHub)  │  │ (GitLab) │  │ (Batch)   │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │              │              │              │              │
│       ▼              ▼              ▼              ▼              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              AI Request Router (core-ai)                  │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │           Priority Queue (Redis Sorted Set)          │ │   │
│  │  │                                                      │ │   │
│  │  │  Priority 1 (CRITICAL): 긴급 티켓 분석               │ │   │
│  │  │  Priority 2 (HIGH):     신규 티켓 분류/분석           │ │   │
│  │  │  Priority 3 (NORMAL):   정책 Q&A 응답                │ │   │
│  │  │  Priority 4 (LOW):      배치 재인덱싱/임베딩          │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │ Rate Limiter │  │ Model Router │  │ Circuit Breaker│  │   │
│  │  │ (per-project)│  │ (작업→모델)   │  │ (장애 차단)     │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │   │
│  └───────────────────────────┬───────────────────────────────┘   │
│                              │                                    │
└──────────────────────────────┼────────────────────────────────────┘
                               │ HTTP (OpenAI 호환 API)
                               ▼
                    ┌─────────────────────┐
                    │   Mac Mini M4 Pro    │
                    │   Ollama Server      │
                    │   :11434             │
                    │                      │
                    │  ┌────────────────┐  │
                    │  │qwen2.5-coder   │  │
                    │  │:14b-instruct   │  │
                    │  │-q4_K_M         │  │
                    │  └────────────────┘  │
                    │  ┌────────────────┐  │
                    │  │nomic-embed-text│  │
                    │  └────────────────┘  │
                    └─────────────────────┘
```

### 6.2 IssueHub 자체 큐 vs Ollama 내장 큐

**IssueHub 자체 큐를 사용해야 하는 이유:**

| 기능 | Ollama 내장 큐 | IssueHub 자체 큐 |
|------|---------------|------------------|
| 우선순위 | FIFO만 | Priority Queue 가능 |
| Rate Limit | 없음 | 프로젝트별 설정 가능 |
| 재시도 | 없음 | 지수 백오프 + 재시도 |
| 모니터링 | `/api/ps`만 | 상세 메트릭 (대기 시간, 성공률 등) |
| 타임아웃 | 서버 수준 | 요청 유형별 타임아웃 |
| 취소 | 불가 | 요청 취소 가능 |

**결론: Ollama의 내장 큐에 의존하지 말고, IssueHub에서 자체 큐를 운영한다.** Ollama의 `OLLAMA_NUM_PARALLEL`만큼의 동시 요청만 보내고, 나머지는 IssueHub의 Redis 기반 큐에서 관리한다.

### 6.3 우선순위 처리 설계

```kotlin
// AI 요청 우선순위 정의
enum class AiRequestPriority(val score: Double) {
    CRITICAL(1.0),  // 긴급 티켓의 실시간 분석
    HIGH(2.0),      // 신규 티켓 자동 분류/분석
    NORMAL(3.0),    // 정책 Q&A, 유사 이슈 탐색
    LOW(4.0),       // 배치 재인덱싱, 코드 임베딩 갱신
}

// AI 요청 큐 항목
data class AiRequest(
    val id: String,
    val projectId: String,
    val type: AiRequestType,     // CLASSIFY, ANALYZE, QA, EMBED_BATCH
    val priority: AiRequestPriority,
    val payload: String,
    val model: String,           // 작업 유형에 따른 모델 선택
    val createdAt: Instant,
    val timeoutSeconds: Int,
)

// 모델 라우팅 전략
fun routeToModel(type: AiRequestType): String = when (type) {
    AiRequestType.CLASSIFY    -> "qwen2.5-coder:14b-instruct-q4_K_M"
    AiRequestType.ANALYZE     -> "qwen2.5-coder:14b-instruct-q4_K_M"
    AiRequestType.QA          -> "qwen2.5-coder:14b-instruct-q4_K_M"
    AiRequestType.EMBED_BATCH -> "nomic-embed-text"
}
```

### 6.4 Concurrency Limiter (세마포어 패턴)

```kotlin
/**
 * Ollama로 보내는 동시 요청 수를 OLLAMA_NUM_PARALLEL에 맞게 제한.
 * Ollama 내장 큐가 아닌 IssueHub에서 flow control을 담당한다.
 */
class OllamaConcurrencyLimiter(
    private val maxConcurrent: Int = 4,  // OLLAMA_NUM_PARALLEL과 동일
) {
    private val semaphore = Semaphore(maxConcurrent)

    suspend fun <T> execute(block: suspend () -> T): T {
        semaphore.acquire()
        try {
            return block()
        } finally {
            semaphore.release()
        }
    }
}
```

### 6.5 Circuit Breaker

Ollama 서버 장애 시 빠르게 실패하여 IssueHub 전체 시스템을 보호:

```
정상 상태 (CLOSED)
    │
    │ 연속 5회 실패 또는 50% 오류율
    ▼
회로 차단 (OPEN) ─── 30초 후 ───→ 반개방 (HALF_OPEN)
    │                                    │
    │ 요청 즉시 실패 반환               │ 1건만 시도
    │                                    │
    │                          성공 → CLOSED
    │                          실패 → OPEN
    ▼
Fallback: Gemini API로 전환 (포트/어댑터 패턴 활용)
```

이 패턴은 IssueHub의 기존 `LlmPort` 인터페이스와 완벽히 호환된다. Ollama 장애 시 `GeminiLlmAdapter`로 자동 전환하면 된다.

---

## 7. 현실적 배포 시나리오 분석

### 7.1 워크로드 정의

| 항목 | 수치 |
|------|------|
| 등록 프로젝트 | 5개 |
| 프로젝트당 일일 티켓 | ~20건 |
| **총 일일 티켓** | **100건** |
| 티켓당 AI 분석 | 1회 분류 + 1회 코드 컨텍스트 분석 + 1회 임베딩 |
| 정책 Q&A | ~10건/일 (사용자 직접 질의) |
| 배치 재인덱싱 | 1회/일 (야간, ~5,000건 임베딩 갱신) |

### 7.2 일일 AI 요청량

```
실시간 요청:
  분류:     100건 × 1회 = 100건/일
  분석:     100건 × 1회 = 100건/일
  임베딩:   100건 × 1회 = 100건/일
  Q&A:      ~10건/일
  ─────────────────────────
  소계:     ~310건/일 (실시간)

배치 요청:
  재인덱싱: ~5,000건 임베딩/일 (야간 배치)
  ─────────────────────────
  총계:     ~5,310건/일
```

### 7.3 처리 시간 추정

**실시간 요청 (LLM 추론):**

```
분류 요청: 평균 ~100 토큰 출력 → ~4-5초/건
분석 요청: 평균 ~500 토큰 출력 → ~20-25초/건
Q&A 요청: 평균 ~300 토큰 출력 → ~12-15초/건

4 병렬 처리 시:
  분류 100건:  100 ÷ 4 × 5초  = ~125초 ≈ 2분
  분석 100건:  100 ÷ 4 × 25초 = ~625초 ≈ 10분
  Q&A 10건:    10 ÷ 4 × 15초  = ~38초  ≈ 1분
  ───────────────────────────────────────
  실시간 합계: ~13분 (하루 전체 분산 처리)
```

**배치 요청 (임베딩):**

```
임베딩 5,000건:
  nomic-embed-text는 초당 ~100-200건 처리 가능 (배치 API)
  5,000 ÷ 150 = ~33초
  ───────────────────────────
  배치 합계: ~1분 미만
```

### 7.4 피크 시간 분석

**최악의 시나리오: 5개 프로젝트가 동시에 티켓을 제출**

```
동시 요청 5건 (모두 분석 요청):
  OLLAMA_NUM_PARALLEL=4이므로:
  - 4건 동시 처리: 각 ~40-60초 (병렬로 인한 속도 감소)
  - 1건 큐 대기 후 처리: +40-60초
  - 전체 완료: ~80-120초 (1.5-2분)

  → 사용자 체감: 첫 4명은 ~1분, 5번째는 ~2분 대기
```

**현실적 피크:**
- 업무 시간 8시간에 100건 = 시간당 ~12.5건
- 분당 ~0.2건 → 거의 대기 없음
- 순간 피크 (예: 장애 발생으로 10건 동시 유입)도 ~5분 내 처리 가능

### 7.5 결론: 1대 Mac Mini로 충분한가?

```
┌──────────────────────────────────────────────────────┐
│                    판정: 충분하다                       │
│                                                       │
│  일일 처리 필요량:  ~5,310건                           │
│  일일 처리 가능량:  ~15,000-20,000건 (여유 3-4배)      │
│                                                       │
│  피크 시 최대 응답 지연: ~2분 (허용 가능)               │
│  평균 응답 지연:         ~5-25초 (작업 유형별)          │
│                                                       │
│  CPU 사용률:    피크 ~60-80%, 평균 ~15-25%            │
│  메모리 사용량:  14B 모델 + 임베딩 ≈ ~15GB / 48GB     │
│  여유 메모리:    ~25GB (다른 서비스용)                  │
│                                                       │
│  병목 지점:      LLM 추론 속도 (tok/s)                 │
│  스케일 한계:    일 ~15,000건 이상 시 2대째 필요        │
└──────────────────────────────────────────────────────┘
```

### 7.6 권장 Ollama 서버 설정

```bash
#!/bin/bash
# /etc/ollama/env (Mac Mini 공유 서버 설정)

# 네트워크 바인딩 (로컬 네트워크 전체)
export OLLAMA_HOST=0.0.0.0:11434

# 동시 병렬 처리 (14B 모델 기준 48GB에서 안전)
export OLLAMA_NUM_PARALLEL=4

# 동시 로드 모델 (추론 + 임베딩)
export OLLAMA_MAX_LOADED_MODELS=2

# 큐 크기 (IssueHub에서 관리하므로 낮게)
export OLLAMA_MAX_QUEUE=50

# 모델 메모리 유지 (자주 쓰므로 길게)
export OLLAMA_KEEP_ALIVE=24h

# KV 캐시 양자화 (메모리 절약)
export OLLAMA_KV_CACHE_TYPE=q8_0

# CORS (IssueHub 서버 허용)
export OLLAMA_ORIGINS=http://issuehub.local:*

# 로그
export OLLAMA_DEBUG=false
```

### 7.7 IssueHub application.yml 권장 설정

```yaml
issuehub:
  ai:
    llm-provider: ollama
    embedding-provider: ollama
    pii-detection: regex

    ollama:
      base-url: http://mac-mini.local:11434
      inference-model: qwen2.5-coder:14b-instruct-q4_K_M
      embedding-model: nomic-embed-text
      timeout-seconds: 120
      max-concurrent: 4           # OLLAMA_NUM_PARALLEL과 일치

    queue:
      enabled: true
      max-size: 200
      priority-enabled: true

    circuit-breaker:
      enabled: true
      failure-threshold: 5
      reset-timeout-seconds: 30
      fallback-provider: gemini   # Ollama 장애 시 Gemini로 전환

    rate-limit:
      per-project-rpm: 30         # 프로젝트당 분당 최대 30요청
      global-rpm: 100             # 전체 분당 최대 100요청
```

---

## 8. 위험 요소 및 대응 방안

| 위험 | 영향도 | 발생 가능성 | 대응 |
|------|--------|------------|------|
| Ollama 서버 다운 | 높음 | 낮음 | Circuit Breaker + Gemini fallback |
| 모델 스왑 지연 (5-15초) | 중간 | 중간 | `KEEP_ALIVE=24h`로 상주, 모델 수 최소화 |
| 메모리 부족 (OOM) | 높음 | 낮음 | `NUM_PARALLEL` 조정, 모니터링 알림 |
| 네트워크 지연 | 낮음 | 낮음 | 같은 LAN 사용, 타임아웃 설정 |
| 보안 침해 (인증 없음) | 높음 | 중간 | 방화벽 + Nginx IP 화이트리스트 |
| 배치 작업이 실시간 지연 유발 | 중간 | 높음 | 우선순위 큐로 배치 작업 후순위 처리 |

---

## Sources

- [Ollama FAQ - Concurrency Configuration](https://docs.ollama.com/faq)
- [How Ollama Handles Parallel Requests (Rost Glukhov)](https://www.glukhov.org/post/2025/05/how-ollama-handles-parallel-requests/)
- [Ollama API Documentation (GitHub)](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Mac Mini M4 Pro AI Benchmarks (Compute Market)](https://www.compute-market.com/blog/mac-mini-m4-for-ai-apple-silicon-2026)
- [Local LLM Hosting Guide - Ollama, vLLM, LocalAI Comparison](https://www.glukhov.org/post/2025/11/hosting-llms-ollama-localai-jan-lmstudio-vllm-comparison/)
- [vLLM on Apple Silicon - vllm-metal vs vllm-mlx](https://blog.labs.purplemaia.org/two-paths-to-vllm-on-apple-silicon-vllm-metal-vs-vllm-mlx/)
- [Running Multiple Ollama Instances](https://blog.linux-ng.de/2025/12/21/running-multiple-ollama-instances-on-one-machine/)
- [Ollama VRAM Requirements Guide](https://localllm.in/blog/ollama-vram-requirements-for-local-llms)
- [Mac Mini M4 Pro AI Server Setup](https://www.marc0.dev/en/blog/ai-agents/mac-mini-ai-server-ollama-openclaw-claude-code-complete-guide-2026-1770481256372)
- [llama.cpp Apple Silicon Benchmarks](https://github.com/ggml-org/llama.cpp/discussions/4167)
