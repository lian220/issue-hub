import { SummaryCards } from "@/components/dashboard/SummaryCards";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleDot, TrendingUp, Clock, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground">
          이슈 현황을 한눈에 확인하세요.
        </p>
      </div>

      <SummaryCards />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">최근 이슈 트렌드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              차트 영역 (추후 구현)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CircleDot className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">플랫폼별 이슈 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              차트 영역 (추후 구현)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "이슈 생성", detail: "로그인 보안 취약점 수정", time: "2분 전" },
                { action: "상태 변경", detail: "API 응답 속도 개선 -> 진행 중", time: "15분 전" },
                { action: "담당자 배정", detail: "결제 오류 -> 김철수", time: "1시간 전" },
                { action: "이슈 해결", detail: "대시보드 렌더링 오류", time: "3시간 전" },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium">{activity.action}</span>
                    <span className="ml-2 text-muted-foreground">
                      {activity.detail}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">SLA 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>응답 SLA 준수율</span>
                <span className="font-semibold text-green-600">94.2%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: "94.2%" }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>해결 SLA 준수율</span>
                <span className="font-semibold text-yellow-600">87.5%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-yellow-500"
                  style={{ width: "87.5%" }}
                />
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                현재 SLA 위반 이슈: 3건
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
