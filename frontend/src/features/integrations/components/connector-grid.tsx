"use client";

import { useState } from "react";
import { ConnectorCard } from "./connector-card";
import { useConnectors } from "../hooks/useConnectors";
import { ISSUE_SOURCES, NOTIFICATION_CHANNELS } from "../utils/connector-registry";
import { SlackConfigModal } from "./slack-config-modal";
import { JiraConfigModal } from "./jira-config-modal";
import type { Integration } from "../types/integration";
import type { PlatformInfo } from "../utils/connector-registry";

const CODE_ENGINES: PlatformInfo[] = [
  {
    type: "GITHUB" as const,
    label: "OpenHands",
    description: "AI 코드 에이전트",
    role: "CODE_ENGINE" as const,
    iconBgColor: "bg-emerald-600",
    iconLabel: "OH",
    phase: 1,
    authType: "api_key",
  },
  {
    type: "GITLAB" as const,
    label: "LLM Direct",
    description: "Ollama / Claude API",
    role: "CODE_ENGINE" as const,
    iconBgColor: "bg-violet-600",
    iconLabel: "AI",
    phase: 1,
    authType: "api_key",
  },
];

export function ConnectorGrid() {
  const { integrations, getIntegrationByType, connectPlatform, disconnectPlatform, testConnection } = useConnectors();
  const [configModal, setConfigModal] = useState<{ type: "slack" | "jira"; integration: Integration } | null>(null);

  function handleConnect(platform: PlatformInfo) {
    connectPlatform(platform.type);
  }

  function handleConfigure(integration: Integration) {
    if (integration.type === "SLACK") {
      setConfigModal({ type: "slack", integration });
    } else if (integration.type === "JIRA") {
      setConfigModal({ type: "jira", integration });
    }
  }

  function handleTest(integration: Integration) {
    testConnection(integration.id);
  }

  function handleDisconnect(integration: Integration) {
    disconnectPlatform(integration.id);
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-primary">
          이슈 소스
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ISSUE_SOURCES.map((platform) => (
            <ConnectorCard
              key={platform.type}
              platform={platform}
              integration={getIntegrationByType(platform.type)}
              onConnect={handleConnect}
              onConfigure={handleConfigure}
              onTest={handleTest}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-tertiary">
          알림 채널
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {NOTIFICATION_CHANNELS.map((platform) => (
            <ConnectorCard
              key={platform.type}
              platform={platform}
              integration={getIntegrationByType(platform.type)}
              onConnect={handleConnect}
              onConfigure={handleConfigure}
              onTest={handleTest}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-emerald-500">
          코드 생성 엔진
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CODE_ENGINES.map((engine) => (
            <ConnectorCard
              key={engine.label}
              platform={engine}
              onConnect={handleConnect}
              onConfigure={() => {}}
              onTest={() => {}}
              onDisconnect={() => {}}
            />
          ))}
        </div>
      </section>

      {configModal?.type === "slack" && (
        <SlackConfigModal
          integration={configModal.integration}
          open={true}
          onClose={() => setConfigModal(null)}
        />
      )}
      {configModal?.type === "jira" && (
        <JiraConfigModal
          integration={configModal.integration}
          open={true}
          onClose={() => setConfigModal(null)}
        />
      )}
    </div>
  );
}
