"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Integration } from "../types/integration";
import type { PlatformInfo } from "../utils/connector-registry";

interface ConnectorCardProps {
  platform: PlatformInfo;
  integration?: Integration;
  onConnect: (platform: PlatformInfo) => void;
  onConfigure: (integration: Integration) => void;
  onTest: (integration: Integration) => void;
  onDisconnect: (integration: Integration) => void;
}

function StatusBadge({ status }: { status: Integration["status"] }) {
  const styles = {
    CONNECTED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    DISCONNECTED: "bg-muted text-muted-foreground border-border",
    ERROR: "bg-red-500/20 text-red-400 border-red-500/40",
  };

  const labels = {
    CONNECTED: "Connected",
    DISCONNECTED: "Disconnected",
    ERROR: "Error",
  };

  return (
    <span className={`absolute top-3 right-3 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatLastSync(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export function ConnectorCard({
  platform,
  integration,
  onConnect,
  onConfigure,
  onTest,
  onDisconnect,
}: ConnectorCardProps) {
  const isConnected = integration?.status === "CONNECTED";
  const isPhase2 = platform.phase === 2;

  if (isPhase2) {
    return (
      <div className="relative rounded-xl border border-dashed border-border/50 bg-card p-5 opacity-50">
        <Badge variant="outline" className="absolute -top-2 right-3 bg-yellow-500/10 text-yellow-500 border-yellow-500/30 text-[10px]">
          Phase 2
        </Badge>
        <div className="flex items-center gap-3 mb-3">
          <div className={`${platform.iconBgColor} flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white`}>
            {platform.iconLabel}
          </div>
          <div>
            <p className="text-sm font-semibold">{platform.label}</p>
            <p className="text-xs text-muted-foreground">{platform.description}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">2단계에서 지원 예정</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl border bg-card p-5 ${isConnected ? "border-emerald-500/30" : "border-border"}`}>
      {integration && <StatusBadge status={integration.status} />}

      <div className="flex items-center gap-3 mb-3">
        <div className={`${platform.iconBgColor} flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white`}>
          {platform.iconLabel}
        </div>
        <div>
          <p className="text-sm font-semibold">{platform.label}</p>
          <p className="text-xs text-muted-foreground">{platform.description}</p>
        </div>
      </div>

      {integration && isConnected && (
        <div className="mb-3 text-xs text-muted-foreground space-y-1">
          {integration.config.projectKeys && (
            <p>프로젝트: {integration.config.projectKeys.join(", ")}</p>
          )}
          {integration.config.channels && (
            <>
              <p>감시 채널: {integration.config.channels.monitorChannels.join(", ")}</p>
              <p>알림 채널: {integration.config.channels.notifyChannel}</p>
              {integration.config.keywords && (
                <p>키워드: {integration.config.keywords.join(", ")}</p>
              )}
            </>
          )}
          {integration.lastSyncAt && (
            <p>마지막 동기화: {formatLastSync(integration.lastSyncAt)}</p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {integration && isConnected ? (
          <>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => onConfigure(integration)}>
              설정
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => onTest(integration)}>
              연결 테스트
            </Button>
            <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => onDisconnect(integration)}>
              해제
            </Button>
          </>
        ) : (
          <Button size="sm" className="text-xs" onClick={() => onConnect(platform)}>
            연결하기
          </Button>
        )}
      </div>
    </div>
  );
}
