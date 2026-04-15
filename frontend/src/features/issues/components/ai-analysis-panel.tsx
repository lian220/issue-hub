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
  matchedPolicy: "성능 최적화 v2.1",
  policyCategory: "인프라 표준",
  confidenceScore: 94,
  suggestedSolution:
    'user_logs 테이블의 user_id와 timestamp 컬럼에 복합 인덱스를 추가하세요. 현재 쿼리는 인덱스 누락으로 인해 풀 테이블 스캔을 수행합니다. 날짜 범위로 필터링하는 쿼리의 경우 월별 파티셔닝도 고려해 보세요.',
  linkedResources: [
    { title: "데이터베이스 최적화 가이드", type: "doc" as const },
    { title: "쿼리 성능 벤치마크", type: "doc" as const },
    { title: "인프라 표준 위키", type: "link" as const },
    { title: "관련 PR #4521", type: "link" as const },
  ],
};

export function AiAnalysisPanel({ analysis }: AiAnalysisPanelProps) {
  const data = analysis ?? DEFAULT_ANALYSIS;

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Sparkles className="mb-2 h-8 w-8" />
          <p className="text-sm">아직 AI 분석이 수행되지 않았습니다.</p>
          <p className="mt-1 text-xs">
            코드 인덱싱이 완료되면 자동으로 분석이 시작됩니다.
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
            <CardTitle className="text-base">정밀 분석</CardTitle>
          </div>
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          >
            실시간 인사이트
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Matched Policy */}
        {matchedPolicy && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              매칭된 정책
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
              신뢰도 점수
            </p>
            <div className="flex items-center gap-4">
              <ConfidenceGauge score={confidenceScore} size={72} />
              <div>
                <p className="text-2xl font-bold">{confidenceScore}%</p>
                <p className="text-xs text-muted-foreground">
                  높은 신뢰도 매칭
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Solution */}
        {suggestedSolution && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              제안 해결 방안
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
          코드 생성 시작
        </Button>

        {/* Linked Resources */}
        {linkedResources && linkedResources.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              연관 리소스
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
