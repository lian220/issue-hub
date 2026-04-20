export type IntegrationType = "JIRA" | "GITHUB" | "GITLAB" | "NOTION" | "SLACK" | "TEAMS" | "EMAIL";

export type IntegrationRole = "ISSUE_SOURCE" | "NOTIFICATION" | "CODE_ENGINE";

export type IntegrationStatus = "CONNECTED" | "DISCONNECTED" | "ERROR";

export interface Integration {
  id: string;
  type: IntegrationType;
  role: IntegrationRole;
  status: IntegrationStatus;
  config: IntegrationConfig;
  n8nWorkflowId?: string;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationConfig {
  projectKeys?: string[];
  channels?: SlackChannelConfig;
  keywords?: string[];
  engineUrl?: string;
  engineProvider?: string;
  [key: string]: unknown;
}

export interface SlackChannelConfig {
  monitorChannels: string[];
  notifyChannel: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs: number;
}

export interface PendingIssue {
  id: string;
  sourceType: string;
  sourceChannel?: string;
  rawMessage: string;
  parsedTitle?: string;
  parsedDescription?: string;
  parsedPriority?: string;
  parsedComponent?: string;
  confidence?: number;
  status: "PENDING" | "CONFIRMED" | "DISMISSED";
  createdAt: string;
  confirmedAt?: string;
}
