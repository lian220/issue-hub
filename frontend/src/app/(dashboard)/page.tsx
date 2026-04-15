import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { SummaryCards } from "@/features/dashboard/components/summary-cards";
import { RecentIssues } from "@/features/dashboard/components/recent-issues";
import { PolicyAccuracy } from "@/features/dashboard/components/policy-accuracy";
import { ArchitecturalInsight } from "@/features/dashboard/components/architectural-insight";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Enterprise Intelligence
          </h1>
          <p className="text-muted-foreground">
            Real-time issue tracking and AI-powered analysis dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Link href="/issues">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Issue
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

        {/* Right: Policy Accuracy + Architectural Insight */}
        <div className="space-y-6">
          <PolicyAccuracy />
          <ArchitecturalInsight />
        </div>
      </div>
    </div>
  );
}
