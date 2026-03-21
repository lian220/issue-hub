rootProject.name = "issue-hub"

include(
    "core-domain",
    "core-issue",
    "core-policy",
    "core-automation",
    "core-connector",
    "infra-persistence",
    "infra-kafka",
    "infra-webhook",
    "app-api",
    "app-scheduler"
)
