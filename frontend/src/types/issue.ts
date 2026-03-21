import { User } from "./user";

export interface Issue {
  id: string;
  externalId: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  source: Platform;
  sourceUrl?: string;
  projectKey?: string;
  assigneeId?: string;
  assignee?: User;
  reporterId?: string;
  reporter?: User;
  labels: string[];
  customFields?: Record<string, unknown>;
  linkedIssues?: IssueLink[];
  comments?: IssueComment[];
  policyId?: string;
  slaDeadline?: string;
  slaBreach: boolean;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type IssueStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "BLOCKED"
  | "PENDING";

export type IssuePriority =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "NONE";

export type Platform =
  | "JIRA"
  | "GITHUB"
  | "GITLAB"
  | "SLACK"
  | "TEAMS"
  | "EMAIL"
  | "MANUAL";

export interface IssueComment {
  id: string;
  issueId: string;
  authorId: string;
  author?: User;
  body: string;
  source: Platform;
  externalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueLink {
  id: string;
  sourceIssueId: string;
  targetIssueId: string;
  linkType: IssueLinkType;
  sourceIssue?: Issue;
  targetIssue?: Issue;
  createdAt: string;
}

export type IssueLinkType =
  | "BLOCKS"
  | "BLOCKED_BY"
  | "RELATES_TO"
  | "DUPLICATES"
  | "DUPLICATED_BY"
  | "PARENT"
  | "CHILD";
