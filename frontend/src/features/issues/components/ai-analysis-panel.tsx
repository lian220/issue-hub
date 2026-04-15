"use client";

import {
  Sparkles,
  Shield,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfidenceGauge } from "@/components/common/confidence-gauge";

interface AiAnalysisPanelProps {
  analysis: {
    matchedPolicy?: string;
    policyCategory?: string;
    confidenceScore?: number;
    suggestedSolution?: string;
    linkedResources?: { title: string; type: "doc" | "link" }[];
  } | null;
}

const DEFAULT_ANALYSIS = {
  matchedPolicy: "Performance Optimization v2.1",
  policyCategory: "Infrastructure Standards",
  confidenceScore: 94,
  suggestedSolution:
    'Add a composite index on user_id and timestamp columns in the user_logs table. The current query performs a full table scan due to missing indexes. Consider partitioning the table by month for queries that filter by date range.',
  linkedResources: [
    { title: "Database Optimization Guide", type: "doc" as const },
    { title: "Query Performance Benchmarks", type: "doc" as const },
    { title: "Infrastructure Standards Wiki", type: "link" as const },
    { title: "Related PR #4521", type: "link" as const },
  ],
};

export function AiAnalysisPanel({ analysis }: AiAnalysisPanelProps) {
  const data = analysis ?? DEFAULT_ANALYSIS;

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Sparkles className="mb-2 h-8 w-8" />
          <p className="text-sm">AI analysis has not been performed yet.</p>
          <p className="mt-1 text-xs">
            Analysis will begin automatically once code indexing is complete.
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    matchedPolicy,
    policyCategory,
    confidenceScore,
    suggestedSolution,
    linkedResources,
  } = data;

  return (
    <Card className="h-fit">
      {/* Header */}
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base">Precision Analysis</CardTitle>
          </div>
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          >
            Live Insight
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Matched Policy */}
        {matchedPolicy && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Matched Policy
            </p>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Shield className="h-4 w-4 shrink-0 text-blue-600" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{matchedPolicy}</p>
                {policyCategory && (
                  <p className="text-xs text-muted-foreground">
                    {policyCategory}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confidence Score */}
        {confidenceScore != null && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Confidence Score
            </p>
            <div className="flex items-center gap-4">
              <ConfidenceGauge score={confidenceScore} size={72} />
              <div>
                <p className="text-2xl font-bold">{confidenceScore}%</p>
                <p className="text-xs text-muted-foreground">
                  High confidence match
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Solution */}
        {suggestedSolution && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Suggested Solution
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {suggestedSolution.split(/(`[^`]+`)/).map((part, i) =>
                part.startsWith("`") && part.endsWith("`") ? (
                  <code
                    key={i}
                    className="rounded bg-muted px-1 py-0.5 text-xs font-mono text-foreground"
                  >
                    {part.slice(1, -1)}
                  </code>
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
            </p>
          </div>
        )}

        {/* CTA */}
        <Button className="w-full gap-2" size="lg">
          <Sparkles className="h-4 w-4" />
          Start Code Generation
        </Button>

        {/* Linked Resources */}
        {linkedResources && linkedResources.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Linked Resources
            </p>
            <div className="space-y-1">
              {linkedResources.map((resource) => (
                <div
                  key={resource.title}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer"
                >
                  {resource.type === "doc" ? (
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {resource.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
