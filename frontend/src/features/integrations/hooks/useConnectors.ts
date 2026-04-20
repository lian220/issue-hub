"use client";

import { useState } from "react";
import type { Integration, ConnectionTestResult } from "../types/integration";
import { MOCK_INTEGRATIONS } from "@/constants/mock-integrations";

// TODO: [BE 연동] Mock 데이터 → SWR + apiClient.get("/integrations") 교체
export function useConnectors() {
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS);
  const [isLoading, setIsLoading] = useState(false);

  function getIntegrationByType(type: string): Integration | undefined {
    return integrations.find((i) => i.type === type);
  }

  // TODO: [BE 연동] apiClient.post("/integrations", { type }) → OAuth 플로우 시작
  async function connectPlatform(type: string): Promise<void> {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
    } finally {
      setIsLoading(false);
    }
  }

  // TODO: [BE 연동] apiClient.delete(`/integrations/${id}`)
  async function disconnectPlatform(id: string): Promise<void> {
    setIntegrations((prev) => prev.filter((i) => i.id !== id));
  }

  // TODO: [BE 연동] apiClient.post(`/integrations/${id}/test`)
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
