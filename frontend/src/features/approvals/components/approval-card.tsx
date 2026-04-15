"use client";

import { CheckCircle, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AiReviewPanel } from "./ai-review-panel";

type Priority = "high" | "medium" | "low";

interface ApprovalItem {
  prNumber: number;
  date: string;
  title: string;
  author: string;
  authorInitials: string;
  aiReview: {
    type: "summary" | "warning";
    text: string;
  };
  priority: Priority;
}

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; className: string }
> = {
  high: {
    label: "높은 우선순위",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  medium: {
    label: "보통",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  low: {
    label: "낮음",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
};

export type { ApprovalItem };

export function ApprovalCard({ item }: { item: ApprovalItem }) {
  const priorityCfg = PRIORITY_CONFIG[item.priority];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            PR #{item.prNumber}
          </Badge>
          <span className="text-xs text-muted-foreground">{item.date}</span>
        </div>
        <h3 className="mt-1 text-lg font-semibold leading-tight tracking-tight">
          {item.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>{item.authorInitials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{item.author}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AiReviewPanel type={item.aiReview.type} text={item.aiReview.text} />

        <div>
          <label className="mb-1 block text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            승인 피드백
          </label>
          <Input placeholder="피드백을 입력하세요..." />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            우선순위
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              priorityCfg.className
            )}
          >
            {priorityCfg.label}
          </span>
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/30"
        >
          <CheckCircle className="size-4" />
          승인
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <XCircle className="size-4" />
          거절
        </Button>
      </CardFooter>
    </Card>
  );
}
