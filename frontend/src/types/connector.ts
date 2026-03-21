export interface ConnectorConfig {
  id: string;
  name: string;
  platform: ConnectorPlatform;
  isActive: boolean;
  connectionStatus: ConnectionStatus;
  baseUrl?: string;
  projectKey?: string;
  repositoryOwner?: string;
  repositoryName?: string;
  channelId?: string;
  credentials: ConnectorCredentials;
  fieldMappings: FieldMapping[];
  syncDirection: SyncDirection;
  syncIntervalMinutes: number;
  lastSyncAt?: string;
  lastSyncStatus?: SyncStatus;
  lastSyncError?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ConnectorPlatform =
  | "JIRA"
  | "GITHUB"
  | "GITLAB"
  | "SLACK"
  | "TEAMS"
  | "EMAIL"
  | "WEBHOOK";

export type ConnectionStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "ERROR"
  | "PENDING";

export type SyncDirection =
  | "INBOUND"
  | "OUTBOUND"
  | "BIDIRECTIONAL";

export type SyncStatus =
  | "SUCCESS"
  | "PARTIAL"
  | "FAILED";

export interface ConnectorCredentials {
  type: "API_KEY" | "OAUTH2" | "BASIC" | "TOKEN";
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  clientId?: string;
  clientSecret?: string;
  expiresAt?: string;
}

export interface FieldMapping {
  id: string;
  connectorId: string;
  sourceField: string;
  targetField: string;
  direction: SyncDirection;
  transformRule?: string;
  isRequired: boolean;
  defaultValue?: string;
}
