import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ArchitecturalInsight() {
  return (
    <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20">
      <CardHeader className="flex flex-row items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <CardTitle className="text-base">아키텍처 인사이트</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          최근 인시던트 분석 결과,{" "}
          <span className="font-medium text-foreground">결제 서비스</span>의
          커넥션 풀 설정이 현재 트래픽 패턴에 비해 부족할 수 있습니다.
          최근 14일간의 p99 레이턴시 추이를 기반으로{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
            max_pool_size
          </code>
          를 20에서 50으로 증가시키는 것을 권장합니다.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="default">
            롤백 적용
          </Button>
          <Button size="sm" variant="outline">
            무시
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
