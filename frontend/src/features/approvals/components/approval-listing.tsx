"use client";

import { RefreshCw } from "lucide-react";

import { ApprovalCard, type ApprovalItem } from "./approval-card";

const MOCK_APPROVALS: ApprovalItem[] = [
  {
    prNumber: 4139,
    date: "Oct 24, 2023",
    title: "Update core-auth-provider to support OAuth 2.1 protocols",
    author: "Jordan Smith",
    authorInitials: "JS",
    aiReview: {
      type: "summary",
      text: "Code changes are compliant with security policies. OAuth 2.1 implementation follows RFC 9126 standards. No breaking changes detected in the authentication flow.",
    },
    priority: "medium",
  },
  {
    prNumber: 4132,
    date: "Oct 23, 2023",
    title: "Legacy Database Migration: Phase 1 Scripts",
    author: "Elena Martinez",
    authorInitials: "EM",
    aiReview: {
      type: "warning",
      text: "Policy deviation detected: Migration scripts modify production schema without a rollback plan. 3 tables affected have active foreign key constraints that may cause downtime.",
    },
    priority: "high",
  },
  {
    prNumber: 1091,
    date: "Oct 22, 2023",
    title: "Frontend Redesign: Dashboard Glassmorphism Shell",
    author: "Kevin Chen",
    authorInitials: "KC",
    aiReview: {
      type: "summary",
      text: "UI consistency verified against the design system. Glassmorphism effects use approved backdrop-filter tokens. Accessibility contrast ratios meet WCAG 2.1 AA standards.",
    },
    priority: "low",
  },
];

export function ApprovalListing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approval Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review pending pull requests and system changes. AI insights have been
          generated for each item to accelerate your decision-making.
        </p>
      </div>

      <div className="space-y-4">
        {MOCK_APPROVALS.map((item) => (
          <ApprovalCard key={item.prNumber} item={item} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-1 py-4 text-sm text-muted-foreground">
        <span>You&apos;ve reached the end of the current queue.</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-primary hover:underline"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="size-3" />
          Refresh for new PRs
        </button>
      </div>
    </div>
  );
}
