import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceGauge } from "@/components/common/confidence-gauge";

export function PolicyAccuracy() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">정책 매칭 정확도 추이</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <ConfidenceGauge score={96} size={100} />
          <div>
            <p className="text-4xl font-bold tracking-tight">96.4%</p>
            <p className="text-sm text-muted-foreground">
              이번 분기 전체 정확도
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
