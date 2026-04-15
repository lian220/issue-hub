"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PolicyTable } from "./policy-table";
import { PolicyForm } from "./policy-form";
import { AiSuggestionBanner } from "./ai-suggestion-banner";

const STATS = [
  { label: "활성 정책", value: "14" },
  { label: "준수 점수", value: "98.2%", valueClass: "text-green-600 dark:text-green-400" },
  { label: "최근 매칭", value: "142" },
] as const;

export function PolicyListing() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">정책</h1>
          <p className="text-muted-foreground">
            프로젝트 전반의 아키텍처 제약 조건 및 자동화 규칙을 정의합니다.
          </p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          새 정책 생성
        </Button>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left column: 60% */}
        <div className="space-y-6 lg:col-span-3">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            {STATS.map((stat) => (
              <Card key={stat.label} size="sm">
                <CardContent className="pt-0">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </div>
                  <div
                    className={`mt-1 text-2xl font-bold ${
                      "valueClass" in stat ? stat.valueClass : ""
                    }`}
                  >
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Active Registry Table */}
          <PolicyTable />
        </div>

        {/* Right column: 40% */}
        <div className="lg:col-span-2">
          <PolicyForm />
        </div>
      </div>

      {/* AI Suggestion Banner */}
      <AiSuggestionBanner />
    </div>
  );
}
