"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="rounded-full bg-red-50 p-3 dark:bg-red-950">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold">프로젝트를 불러올 수 없습니다</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          프로젝트 목록을 가져오는 중 문제가 발생했습니다.
        </p>
      </div>
      <Button variant="outline" onClick={() => unstable_retry()}>
        <RefreshCw className="mr-2 h-4 w-4" />
        다시 시도
      </Button>
    </div>
  );
}
