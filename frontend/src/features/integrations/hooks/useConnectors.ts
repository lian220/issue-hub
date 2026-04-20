"use client";

import { useState } from "react";
import type { Integration, ConnectionTestResult } from "../types/integration";
import { MOCK_INTEGRATIONS } from "@/constants/mock-integrations";

export function useConnectors() {
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS);
  const [isLoading, setIsLoading] = useState(false);

  function getIntegrationByType(type: string): Integration | undefined {
    return integrations.find((i) => i.type === type);
  }

  async function connectPlatform(type: string): Promise<void> {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
  }

  async function disconnectPlatform(id: string): Promise<void> {
    setIntegrations((prev) => prev.filter((i) => i.id !== id));
  }

  async function testConnection(id: string): Promise<ConnectionTestResult> {
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, message: "연결 성공", latencyMs: 120 };
  }

  return {
    integrations,
    isLoading,
    getIntegrationByType,
    connectPlatform,
    disconnectPlatform,
    testConnection,
  };
}
