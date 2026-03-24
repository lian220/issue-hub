import { SummaryCards } from "@/features/dashboard/components/summary-cards";
import { RecentIssues } from "@/features/dashboard/components/recent-issues";
import { TeamWorkload } from "@/features/dashboard/components/team-workload";
import { SlaStatus } from "@/features/dashboard/components/sla-status";

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
        <RecentIssues />
        <TeamWorkload />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SlaStatus />
        {/* TrendChart - visx 연동 후 추가 */}
      </div>
    </div>
  );
}
