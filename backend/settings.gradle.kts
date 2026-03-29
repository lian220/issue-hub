rootProject.name = "issue-hub"

include(
    "core-domain",
    "core-issue",
    "core-policy",
    "core-automation",
    "core-connector",
    "core-ai",
    "infra-persistence",
    // "infra-kafka",  // Phase 2 이후 활성화
    "infra-webhook",
    "infra-llm",
    "app-api",
    "app-scheduler"
)
