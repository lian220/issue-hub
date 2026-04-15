"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface HighPriorityIssue {
  title: string;
  subtitle: string;
  priority: "CRITICAL" | "HIGH";
  status: string;
  aiStatus: "Analyzed" | "Pending" | "In Progress";
}

const MOCK_HIGH_PRIORITY_ISSUES: HighPriorityIssue[] = [
  {
    title: "Database Connection Pool Exhaustion",
    subtitle: "Payment Service - PROJ-4829",
    priority: "CRITICAL",
    status: "In Progress",
    aiStatus: "Analyzed",
  },
  {
    title: "Memory Leak in Worker Thread",
    subtitle: "Background Jobs - PROJ-4815",
    priority: "CRITICAL",
    status: "Open",
    aiStatus: "In Progress",
  },
  {
    title: "API Rate Limiting Bypass",
    subtitle: "Gateway Service - PROJ-4801",
    priority: "HIGH",
    status: "In Progress",
    aiStatus: "Analyzed",
  },
  {
    title: "Incorrect Timezone Handling",
    subtitle: "Scheduler - PROJ-4798",
    priority: "HIGH",
    status: "Open",
    aiStatus: "Pending",
  },
  {
    title: "Cache Invalidation Race Condition",
    subtitle: "Product Service - PROJ-4790",
    priority: "HIGH",
    status: "In Review",
    aiStatus: "Analyzed",
  },
];

const AI_STATUS_CONFIG: Record<string, { dot: string; text: string }> = {
  Analyzed: { dot: "bg-green-500", text: "text-green-700 dark:text-green-400" },
  "In Progress": { dot: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-400" },
  Pending: { dot: "bg-gray-400", text: "text-gray-500" },
};

export function RecentIssues() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent High-Priority Issues</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Issue Title</TableHead>
              <TableHead className="w-[100px]">Priority</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[120px]">AI Analysis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_HIGH_PRIORITY_ISSUES.map((issue) => {
              const aiConfig = AI_STATUS_CONFIG[issue.aiStatus];
              return (
                <TableRow key={issue.subtitle}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{issue.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {issue.subtitle}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        issue.priority === "CRITICAL"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                      }
                    >
                      {issue.priority === "CRITICAL" ? "Critical" : "High"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {issue.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 text-sm">
                      <span
                        className={`h-2 w-2 rounded-full ${aiConfig.dot}`}
                      />
                      <span className={aiConfig.text}>{issue.aiStatus}</span>
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
