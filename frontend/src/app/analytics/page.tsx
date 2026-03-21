import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Clock,
  PieChart,
  Activity,
  Users,
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">분석</h1>
        <p className="text-muted-foreground">
          이슈 처리 현황과 팀 성과를 분석합니다.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              평균 해결 시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.2시간</div>
            <p className="text-xs text-green-600 mt-1">
              전주 대비 12% 개선
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              평균 첫 응답 시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">28분</div>
            <p className="text-xs text-green-600 mt-1">
              SLA 기준 충족
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              이번 주 처리 건수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">38건</div>
            <p className="text-xs text-muted-foreground mt-1">
              목표 대비 95%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">주간 이슈 처리 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
              막대 차트 영역 (추후 구현)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <PieChart className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">우선순위별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
              파이 차트 영역 (추후 구현)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">월간 이슈 트렌드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
              라인 차트 영역 (추후 구현)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">담당자별 처리 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "김철수", resolved: 15, open: 3 },
                { name: "이영희", resolved: 12, open: 5 },
                { name: "박지민", resolved: 8, open: 2 },
                { name: "최민수", resolved: 3, open: 1 },
              ].map((member) => (
                <div key={member.name} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-16">{member.name}</span>
                  <div className="flex-1 flex items-center gap-1">
                    <div
                      className="h-6 rounded bg-green-200 dark:bg-green-900"
                      style={{ width: `${(member.resolved / 20) * 100}%` }}
                    />
                    <div
                      className="h-6 rounded bg-blue-200 dark:bg-blue-900"
                      style={{ width: `${(member.open / 20) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-20 text-right">
                    해결 {member.resolved} | 진행 {member.open}
                  </span>
                </div>
              ))}
              <div className="flex gap-4 text-xs text-muted-foreground pt-2">
                <span className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-green-200 dark:bg-green-900" /> 해결
                </span>
                <span className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-blue-200 dark:bg-blue-900" /> 진행 중
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
