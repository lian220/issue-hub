"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { useDashboardStats } from "../hooks/useDashboardStats";

export function TeamWorkload() {
  const { data: dashboard } = useDashboardStats();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <CardTitle className="text-base">팀 워크로드</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dashboard.teamMembers.map((member) => {
            const total = member.openIssues + member.inProgressIssues;
            const maxIssues = 10;
            const percentage = Math.min((total / maxIssues) * 100, 100);
            const barColor =
              percentage > 70
                ? "bg-red-500"
                : percentage > 40
                  ? "bg-yellow-500"
                  : "bg-green-500";

            return (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {member.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-muted-foreground">
                      {total}건
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div
                      className={`h-1.5 rounded-full transition-all ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="mt-0.5 flex gap-2 text-[10px] text-muted-foreground">
                    <span>열림 {member.openIssues}</span>
                    <span>진행 {member.inProgressIssues}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
