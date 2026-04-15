"use client";

import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ArchitecturalInsight() {
  return (
    <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20">
      <CardHeader className="flex flex-row items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <CardTitle className="text-base">Architectural Insight</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Analysis of recent incidents suggests the{" "}
          <span className="font-medium text-foreground">Payment Service</span>{" "}
          connection pool configuration may be under-provisioned for current
          traffic patterns. Consider increasing{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
            max_pool_size
          </code>{" "}
          from 20 to 50 based on p99 latency trends observed over the last 14
          days.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="default">
            Apply Rollback
          </Button>
          <Button size="sm" variant="outline">
            Ignore
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
