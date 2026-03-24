import { Plus, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/common/platform-icon";
import { Platform } from "@/types/issue";

const PLACEHOLDER_CONNECTORS = [
  {
    id: "CON-001",
    name: "프로젝트 Jira",
    platform: "JIRA" as Platform,
    connectionStatus: "CONNECTED",
    syncDirection: "BIDIRECTIONAL",
    lastSyncAt: "2026-03-21T14:00:00Z",
    lastSyncStatus: "SUCCESS",
    projectKey: "PROJ",
  },
  {
    id: "CON-002",
    name: "Backend Repository",
    platform: "GITHUB" as Platform,
    connectionStatus: "CONNECTED",
    syncDirection: "INBOUND",
    lastSyncAt: "2026-03-21T13:45:00Z",
    lastSyncStatus: "SUCCESS",
    repositoryName: "org/backend-api",
  },
  {
    id: "CON-003",
    name: "고객 지원 채널",
    platform: "SLACK" as Platform,
    connectionStatus: "ERROR",
    syncDirection: "INBOUND",
    lastSyncAt: "2026-03-20T10:00:00Z",
    lastSyncStatus: "FAILED",
    channelId: "#support",
  },
  {
    id: "CON-004",
    name: "팀 협업 채널",
    platform: "TEAMS" as Platform,
    connectionStatus: "DISCONNECTED",
    syncDirection: "INBOUND",
    lastSyncAt: undefined,
    lastSyncStatus: undefined,
  },
];

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; label: string; color: string }> = {
  CONNECTED: { icon: CheckCircle2, label: "연결됨", color: "text-green-600" },
  DISCONNECTED: { icon: XCircle, label: "연결 해제", color: "text-gray-400" },
  ERROR: { icon: AlertCircle, label: "오류", color: "text-red-600" },
  PENDING: { icon: Clock, label: "연결 중", color: "text-yellow-600" },
};

const SYNC_LABELS: Record<string, string> = {
  INBOUND: "수신 전용",
  OUTBOUND: "발신 전용",
  BIDIRECTIONAL: "양방향",
};

export default function ConnectorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">커넥터</h1>
          <p className="text-muted-foreground">
            외부 플랫폼 연동을 설정하고 관리합니다.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          커넥터 추가
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PLACEHOLDER_CONNECTORS.map((connector) => {
          const statusConfig = STATUS_CONFIG[connector.connectionStatus];
          const StatusIcon = statusConfig.icon;

          return (
            <Card key={connector.id} className="cursor-pointer transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-row items-start gap-3">
                <div className="rounded-lg border p-3">
                  <PlatformIcon platform={connector.platform} size={24} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{connector.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {connector.projectKey || connector.repositoryName || connector.channelId || connector.platform}
                  </CardDescription>
                </div>
                <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{SYNC_LABELS[connector.syncDirection]}</Badge>
                    <span className={statusConfig.color}>{statusConfig.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {connector.lastSyncAt
                      ? `최근 동기화: ${new Date(connector.lastSyncAt).toLocaleDateString("ko-KR")}`
                      : "동기화 기록 없음"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
