export interface Policy {
  id: string;
  name: string;
  description?: string;
  category: PolicyCategory;
  content: string;
  isActive: boolean;
  version: number;
  versions?: PolicyVersion[];
  templateId?: string;
  template?: PolicyTemplate;
  tags: string[];
  createdBy: string;
  approvedBy?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}

export type PolicyCategory =
  | "SECURITY"
  | "COMPLIANCE"
  | "OPERATIONS"
  | "DEVELOPMENT"
  | "INCIDENT_RESPONSE"
  | "ACCESS_CONTROL"
  | "DATA_PROTECTION";

export interface PolicyVersion {
  id: string;
  policyId: string;
  version: number;
  content: string;
  changeSummary?: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
}

export interface PolicyTemplate {
  id: string;
  name: string;
  description?: string;
  category: PolicyCategory;
  content: string;
  placeholders: PolicyPlaceholder[];
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyPlaceholder {
  key: string;
  label: string;
  description?: string;
  defaultValue?: string;
  required: boolean;
}
