"use client";

import { Bot, ExternalLink, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CodingTask } from "@/constants/mock-data";

interface AutoDevSectionProps {
  tasks: CodingTask[];
  onStartAutoDev?: () => void;
}

const STATUS_CONFIG = {
  PENDING: { label: "대기 중", icon: Loader2, color: "text-gray-500" },
  RUNNING: { label: "진행 중", icon: Loader2, color: "text-blue-500", animate: true },
  COMPLETED: { label: "완료", icon: CheckCircle2, color: "text-green-500" },
  FAILED: { label: "실패", icon: XCircle, color: "text-red-500" },
} as const;

export function AutoDevSection({ tasks, onStartAutoDev }: AutoDevSectionProps) {
  return (
    <div className="space-y-4">
      <Button
        onClick={onStartAutoDev}
        className="w-full gap-2"
        size="lg"
      >
        <Bot className="h-5 w-5" />
        자동 개발 시작
      </Button>

      {tasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">자동 개발 이력</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task) => {
                const config = STATUS_CONFIG[task.status];
                const StatusIcon = config.icon;

                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-md border p-3 text-sm"
                  >
                    <StatusIcon
                      className={`h-4 w-4 shrink-0 ${config.color} ${
                        "animate" in config && config.animate ? "animate-spin" : ""
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {task.agentProvider}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            task.status === "COMPLETED"
                              ? "border-green-300 text-green-700"
                              : task.status === "RUNNING"
                                ? "border-blue-300 text-blue-700"
                                : task.status === "FAILED"
                                  ? "border-red-300 text-red-700"
                                  : ""
                          }`}
                        >
                          {config.label}
                        </Badge>
                      </div>
                      {task.prTitle && (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {task.prTitle}
                        </p>
                      )}
                    </div>
                    {task.prUrl && (
                      <a
                        href={task.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
