rootProject.name = "issue-hub"

include(
    "core-domain",
    "core-issue",
    "core-policy",
    "core-automation",
    "core-connector",
    "core-ai",
    "infra-persistence",
    "infra-kafka",
    "infra-webhook",
    "infra-llm",
    "app-api",
    "app-scheduler"
)
