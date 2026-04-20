import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { SummaryCards } from "@/features/dashboard/components/summary-cards";
import { RecentIssues } from "@/features/dashboard/components/recent-issues";
import { PolicyAccuracy } from "@/features/dashboard/components/policy-accuracy";
import { ArchitecturalInsight } from "@/features/dashboard/components/architectural-insight";
import { PendingIssuesWidget } from "@/features/dashboard/components/pending-issues-widget";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            통합 인텔리전스
          </h1>
          <p className="text-muted-foreground">
            프로젝트 건강도 및 이슈 동기화 현황
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            보고서 내보내기
          </Button>
          <Link href="/issues">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              새 이슈 생성
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <SummaryCards />

      {/* Bottom 2-column section */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left: Recent High-Priority Issues */}
        <RecentIssues />

        {/* Right: Pending Issues + Policy Accuracy + Architectural Insight */}
        <div className="space-y-6">
          <PendingIssuesWidget />
          <PolicyAccuracy />
          <ArchitecturalInsight />
        </div>
      </div>
    </div>
  );
}
