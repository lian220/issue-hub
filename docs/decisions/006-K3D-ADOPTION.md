---
Status: Accepted
Date: 2026-03-22
---

# 006: k3d (로컬 Kubernetes) 도입 전략

## Context

IssueHub는 현재 Docker Compose로 로컬 개발 환경을 구성하고 있다. PRD에 "Kubernetes 배포 지원"이 명시되어 있으며, 프로젝트의 학습 목적상 K8s 운영 경험이 중요하다.

로컬 Kubernetes 도구로 k3d, minikube, kind 등이 있으며, 프로젝트에 가장 적합한 도구를 선정하고 도입 시점을 결정해야 한다.

## Decision

### k3d를 Phase 2부터 도입한다

- **Phase 1**: Docker Compose 유지. 핵심 비즈니스 로직 완성에 집중
- **Phase 2**: Docker Compose → k3d 마이그레이션. K8s 네이티브 기능 활용 시작

### k3d 선정 이유

| 항목 | k3d | minikube | kind |
| --- | --- | --- | --- |
| 내부 엔진 | k3s (경량 K8s) in Docker | 풀 K8s (VM/Docker) | K8s in Docker |
| 리소스 사용 | ~512MB | ~2GB+ | ~1GB |
| 시작 속도 | 수 초 | 1~2분 | 30초 |
| 멀티 노드 | 쉬움 | 무거움 | 쉬움 |
| Ingress | Traefik 기본 내장 | 별도 설치 | 별도 설치 |
| Docker 이미지 로드 | 빠름 | 보통 | 보통 |

k3d는 가볍고, Docker만 있으면 되며, Traefik Ingress가 내장되어 있어 추가 설정이 최소화된다.

### Phase 2 k3d 클러스터 구성

```yaml
# k3d 클러스터 생성
k3d cluster create issuehub \
  --agents 2 \
  --port "80:80@loadbalancer" \
  --port "443:443@loadbalancer"
```

```
k3d 클러스터 (issuehub)
├── Deployment: issuehub-api (Spring Boot)
├── Deployment: issuehub-frontend (Next.js)
├── StatefulSet: opensearch
├── CronJob: polling-sync (5분 간격)
├── CronJob: sla-check (1시간)
├── CronJob: pg-backup (매일 새벽)
├── Ingress: Traefik (라우팅)
├── ConfigMap: 환경 설정
├── Secret: DB 접속정보, API 키
└── HPA: api 서버 오토스케일링
```

외부 서비스 (클러스터 밖):
- PostgreSQL: Aiven (원격)
- Redis: Upstash (원격)

### Phase별 K8s 기능 활용

| Phase | K8s 기능 | 용도 |
| --- | --- | --- |
| Phase 2 | Deployment, Service | 기본 서비스 배포 |
| Phase 2 | ConfigMap, Secret | 환경변수/민감정보 관리 |
| Phase 2 | CronJob | 폴링 동기화, 백업, SLA 체크 |
| Phase 2 | Ingress (Traefik) | HTTP 라우팅, TLS |
| Phase 2 | HPA | CPU/메모리 기반 오토스케일링 |
| Phase 3 | StatefulSet | OpenSearch, Airflow 메타DB |
| Phase 3 | PV/PVC | Airflow DAG 저장소 |
| Phase 4 | NetworkPolicy | 서비스 간 네트워크 격리 |

### Helm Chart 구조

```
deploy/
├── charts/
│   └── issuehub/
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── values-dev.yaml
│       ├── values-prod.yaml
│       └── templates/
│           ├── api-deployment.yaml
│           ├── api-service.yaml
│           ├── frontend-deployment.yaml
│           ├── frontend-service.yaml
│           ├── opensearch-statefulset.yaml
│           ├── cronjob-polling.yaml
│           ├── cronjob-backup.yaml
│           ├── cronjob-sla.yaml
│           ├── ingress.yaml
│           ├── hpa.yaml
│           ├── configmap.yaml
│           └── secret.yaml
└── scripts/
    ├── setup-cluster.sh
    └── teardown-cluster.sh
```

### Docker Compose → k3d 마이그레이션 계획

Phase 2 Sprint 4 (W8-9)에서 수행:

1. 기존 Docker Compose 서비스를 K8s 매니페스트로 변환
2. Helm Chart 초기화
3. k3d 클러스터 생성 + 서비스 배포 검증
4. CI/CD에서 k3d 기반 통합 테스트 추가
5. Docker Compose는 "빠른 로컬 개발" 옵션으로 유지 (삭제하지 않음)

## Consequences

### 장점
- K8s 운영 경험: Deployment, Service, Ingress, HPA, CronJob 등 실무 필수 기능 학습
- 프로덕션 동일 환경: 로컬과 프로덕션의 배포 방식 통일
- Helm Chart: 환경별 설정 분리 (dev/staging/prod)
- Phase 3 Airflow 도입 시 K8sExecutor 활용 가능

### 단점
- Phase 2 초반 마이그레이션에 1~2주 소요
- 로컬 리소스 사용 증가 (최소 8GB RAM 권장)
- K8s 디버깅 학습 곡선

### 리스크 대응
- Docker Compose를 삭제하지 않으므로 롤백 가능
- k3d 클러스터 삭제/재생성이 수 초만에 가능하여 실험 부담 없음
