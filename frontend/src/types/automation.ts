export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  triggerType: TriggerType;
  triggerConfig: Record<string, unknown>;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  executionCount: number;
  lastExecutedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type TriggerType =
  | "ISSUE_CREATED"
  | "ISSUE_UPDATED"
  | "ISSUE_STATUS_CHANGED"
  | "ISSUE_ASSIGNED"
  | "SLA_APPROACHING"
  | "SLA_BREACHED"
  | "COMMENT_ADDED"
  | "SCHEDULE";

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: string | string[] | number | boolean;
}

export type ConditionOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "IN"
  | "NOT_IN"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "MATCHES_REGEX";

export interface RuleAction {
  type: ActionType;
  config: Record<string, unknown>;
}

export type ActionType =
  | "ASSIGN_USER"
  | "CHANGE_STATUS"
  | "CHANGE_PRIORITY"
  | "ADD_LABEL"
  | "REMOVE_LABEL"
  | "SEND_NOTIFICATION"
  | "CREATE_LINKED_ISSUE"
  | "RUN_WEBHOOK"
  | "ADD_COMMENT";

export interface SlaPolicy {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: string;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  businessHoursOnly: boolean;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  businessDays?: number[];
  escalationRules: EscalationRule[];
  createdAt: string;
  updatedAt: string;
}

export interface EscalationRule {
  thresholdPercent: number;
  notifyUserIds: string[];
  action: ActionType;
  actionConfig?: Record<string, unknown>;
}
