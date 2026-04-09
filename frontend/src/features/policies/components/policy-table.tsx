"use client";

import { Filter, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

interface PolicyRow {
  name: string;
  description: string;
  category: "SECURITY" | "PERFORMANCE" | "COMPLIANCE";
  status: "Active" | "Draft";
  matchCount: string;
}

const MOCK_POLICIES: PolicyRow[] = [
  {
    name: "Security Baseline",
    description: "Global encryption and port standards",
    category: "SECURITY",
    status: "Active",
    matchCount: "1,204",
  },
  {
    name: "Perf Standard",
    description: "API Latency & Bundle Size thresholds",
    category: "PERFORMANCE",
    status: "Active",
    matchCount: "85",
  },
  {
    name: "GDPR Data Purge",
    description: "Automated PII identification and removal",
    category: "SECURITY",
    status: "Draft",
    matchCount: "0",
  },
  {
    name: "Dependency Audit",
    description: "Verify CVE-free library versions",
    category: "COMPLIANCE",
    status: "Active",
    matchCount: "442",
  },
];

const CATEGORY_STYLES: Record<string, string> = {
  SECURITY: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  PERFORMANCE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLIANCE: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export function PolicyTable() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Active Registry</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4 text-xs uppercase text-muted-foreground">
                Policy Name
              </TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground">
                Category
              </TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-right pr-4 text-xs uppercase text-muted-foreground">
                Match Count
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_POLICIES.map((policy) => (
              <TableRow key={policy.name}>
                <TableCell className="pl-4">
                  <div>
                    <div className="font-medium">{policy.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {policy.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      CATEGORY_STYLES[policy.category]
                    )}
                  >
                    {policy.category}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-block h-2 w-2 rounded-full",
                        policy.status === "Active"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      )}
                    />
                    <span className="text-sm">{policy.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-4 font-mono text-sm">
                  {policy.matchCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
