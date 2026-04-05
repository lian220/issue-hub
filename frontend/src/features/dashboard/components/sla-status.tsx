"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDashboardStats } from "../hooks/useDashboardStats";

export function SlaStatus() {
  const { data: dashboard } = useDashboardStats();
  const { breachCount, responseRate } = dashboard.sla;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
        <CardTitle className="text-base">SLA 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>SLA 준수율</span>
            <span
              className={`font-semibold ${
                responseRate >= 90
                  ? "text-green-600"
                  : responseRate >= 70
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {responseRate.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className={`h-2 rounded-full ${
                responseRate >= 90
                  ? "bg-green-500"
                  : responseRate >= 70
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${responseRate}%` }}
            />
          </div>
          {breachCount > 0 && (
            <Link
              href="/issues?slaBreach=true"
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
            >
              <AlertTriangle className="h-3 w-3" />
              현재 SLA 위반 이슈: {breachCount}건
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
