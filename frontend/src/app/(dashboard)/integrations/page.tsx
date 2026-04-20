import { ConnectorGrid } from "@/features/integrations/components/connector-grid";

export default function IntegrationsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-heading">연동 설정</h1>
          <p className="text-sm text-muted-foreground mt-1">
            이슈 소스와 알림 채널을 연결합니다
          </p>
        </div>
        <a
          href={`${process.env.NEXT_PUBLIC_N8N_URL || "http://localhost:5678"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-3 py-2"
        >
          n8n 고급 설정 ↗
        </a>
      </div>
      <ConnectorGrid />
    </div>
  );
}
