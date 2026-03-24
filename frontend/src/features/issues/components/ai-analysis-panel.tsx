"use client";

import { FileCode2, GitCommit, Link2, Lightbulb, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AiAnalysis } from "@/constants/mock-data";

interface AiAnalysisPanelProps {
  analysis: AiAnalysis | undefined;
}

export function AiAnalysisPanel({ analysis }: AiAnalysisPanelProps) {
  if (!analysis) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Sparkles className="mb-2 h-8 w-8" />
          <p className="text-sm">AI 분석이 아직 수행되지 않았습니다.</p>
          <p className="text-xs mt-1">코드 인덱싱이 완료되면 자동으로 분석됩니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 영향 파일 */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <FileCode2 className="h-4 w-4 text-blue-600" />
          <CardTitle className="text-sm font-medium">영향 파일</CardTitle>
          <Badge variant="outline" className="ml-auto text-xs">
            {analysis.affectedFiles.length}개
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.affectedFiles.map((file, i) => (
              <div
                key={i}
                className="rounded-md border p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs text-blue-600">
                    {file.path}:{file.line}
                  </code>
                  <span className="text-muted-foreground">—</span>
                  <code className="font-mono text-xs">{file.symbol}</code>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{file.reason}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 최근 변경 */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <GitCommit className="h-4 w-4 text-orange-600" />
          <CardTitle className="text-sm font-medium">최근 변경</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.recentChanges.map((change, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{change.author}</span>
                    <span className="text-xs text-muted-foreground">{change.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <code className="font-mono">{change.file}</code> — {change.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 유사 과거 이슈 */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Link2 className="h-4 w-4 text-purple-600" />
          <CardTitle className="text-sm font-medium">유사 과거 이슈</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.similarIssues.map((issue, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs text-muted-foreground">{issue.id}</code>
                  <span>{issue.title}</span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    issue.status === "RESOLVED"
                      ? "border-green-300 text-green-700"
                      : "border-yellow-300 text-yellow-700"
                  }
                >
                  {issue.status === "RESOLVED" ? "해결됨" : "진행 중"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 수정 제안 */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
            AI 수정 제안
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-200">
            {analysis.suggestion}
          </p>
          <p className="mt-2 text-xs text-blue-600/70">
            분석 시각: {new Date(analysis.analyzedAt).toLocaleString("ko-KR")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
