import { Sparkles, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

interface AiReviewPanelProps {
  type: "summary" | "warning";
  text: string;
}

export function AiReviewPanel({ type, text }: AiReviewPanelProps) {
  const isSummary = type === "summary";

  return (
    <div
      className={cn(
        "rounded-lg p-3",
        isSummary ? "bg-blue-50 dark:bg-blue-950/30" : "bg-orange-50 dark:bg-orange-950/30"
      )}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        {isSummary ? (
          <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
        ) : (
          <AlertTriangle className="size-3.5 text-orange-600 dark:text-orange-400" />
        )}
        <span
          className={cn(
            "text-xs font-semibold tracking-wide uppercase",
            isSummary
              ? "text-blue-700 dark:text-blue-300"
              : "text-orange-700 dark:text-orange-300"
          )}
        >
          {isSummary ? "AI Review Summary" : "AI Insight - Warning"}
        </span>
      </div>
      <p
        className={cn(
          "text-sm leading-relaxed",
          isSummary
            ? "text-blue-900 dark:text-blue-100"
            : "text-orange-900 dark:text-orange-100"
        )}
      >
        {text}
      </p>
    </div>
  );
}
