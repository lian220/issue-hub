"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AiSuggestionBanner() {
  return (
    <div className="rounded-xl border bg-gradient-to-r from-slate-50 to-slate-100 p-5 dark:from-slate-900/50 dark:to-slate-800/50">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900/30">
          <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-sm font-semibold">AI Optimization Suggestion</h3>
          <p className="text-sm text-muted-foreground">
            We&apos;ve identified 3 redundant rules across your Security Baseline
            and Network Ingress policies. Merging these could reduce evaluation
            latency by 24%.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="default">
            Review Conflicts
          </Button>
          <button className="text-sm text-muted-foreground hover:text-foreground">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
