import { Plus, Zap, Play, Pause, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PLACEHOLDER_RULES = [
  {
    id: "AUT-001",
    name: "심각 이슈 자동 배정",
    description: "심각 우선순위 이슈가 생성되면 보안팀 리더에게 자동 배정합니다.",
    isActive: true,
    triggerType: "ISSUE_CREATED",
    executionCount: 47,
    lastExecutedAt: "2026-03-21T10:30:00Z",
  },
  {
    id: "AUT-002",
    name: "SLA 위반 알림",
    description: "SLA 위반이 감지되면 담당자와 관리자에게 알림을 전송합니다.",
    isActive: true,
    triggerType: "SLA_BREACHED",
    executionCount: 12,
    lastExecutedAt: "2026-03-20T16:00:00Z",
  },
  {
    id: "AUT-003",
    name: "해결 이슈 자동 닫기",
    description: "해결 상태로 7일 경과한 이슈를 자동으로 닫습니다.",
    isActive: true,
    triggerType: "SCHEDULE",
    executionCount: 89,
    lastExecutedAt: "2026-03-21T00:00:00Z",
  },
  {
    id: "AUT-004",
    name: "Slack 알림 전달",
    description: "Slack에서 수신된 이슈에 자동으로 라벨을 추가합니다.",
    isActive: false,
    triggerType: "ISSUE_CREATED",
    executionCount: 23,
    lastExecutedAt: "2026-03-15T14:00:00Z",
  },
];

const TRIGGER_LABELS: Record<string, string> = {
  ISSUE_CREATED: "이슈 생성 시",
  ISSUE_UPDATED: "이슈 업데이트 시",
  ISSUE_STATUS_CHANGED: "상태 변경 시",
  ISSUE_ASSIGNED: "배정 시",
  SLA_APPROACHING: "SLA 임박 시",
  SLA_BREACHED: "SLA 위반 시",
  COMMENT_ADDED: "댓글 추가 시",
  SCHEDULE: "예약 실행",
};

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">자동화</h1>
          <p className="text-muted-foreground">
            이슈 처리를 자동화하는 규칙을 관리합니다.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          규칙 생성
        </Button>
      </div>

      <div className="grid gap-4">
        {PLACEHOLDER_RULES.map((rule) => (
          <Card key={rule.id} className={!rule.isActive ? "opacity-60" : ""}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg border p-2 mt-0.5">
                  <Zap className={`h-5 w-5 ${rule.isActive ? "text-yellow-500" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <CardTitle className="text-base">{rule.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {rule.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={rule.isActive ? "default" : "secondary"}>
                  {rule.isActive ? "활성" : "비활성"}
                </Badge>
                <Button variant="ghost" size="icon" aria-label="더 보기">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>트리거: {TRIGGER_LABELS[rule.triggerType]}</span>
                <Separator orientation="vertical" className="h-4" />
                <span>실행 횟수: {rule.executionCount}회</span>
                <Separator orientation="vertical" className="h-4" />
                <span>최근 실행: {rule.lastExecutedAt ? new Date(rule.lastExecutedAt).toLocaleDateString("ko-KR") : "-"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
