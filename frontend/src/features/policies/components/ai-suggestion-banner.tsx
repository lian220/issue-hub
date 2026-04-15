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
          <h3 className="text-sm font-semibold">AI 최적화 제안</h3>
          <p className="text-sm text-muted-foreground">
            보안 기준선과 네트워크 인그레스 정책에서 중복되는 규칙 3개를
            발견했습니다. 이를 병합하면 평가 레이턴시를 24% 줄일 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="default">
            충돌 검토
          </Button>
          <button className="text-sm text-muted-foreground hover:text-foreground">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
