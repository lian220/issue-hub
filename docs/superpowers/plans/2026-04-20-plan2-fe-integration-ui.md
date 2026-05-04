# Frontend Integration UI Plan (Plan 2/3) — ✅ 완료 (2026-04-20)

> ~~**For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.~~
> **PR**: https://github.com/lian220/issue-hub/pull/6 (merged)

**Goal:** 연동 설정 페이지(카드 그리드 + OAuth 팝업 + 설정 모달) + 대기 이슈 큐(대시보드 위젯 + 이슈 탭) 구현

**Architecture:** features/integrations/ 모듈에 컴포넌트/훅/타입 구성. Mock 데이터로 독립 개발(BE 미완성). 기존 디자인 시스템(Forge Logic) 활용.

**Tech Stack:** Next.js 16, TypeScript, shadcn/ui, Tailwind CSS, SWR, Lucide React

**관련 스펙:** docs/superpowers/specs/2026-04-15-integration-system-design.md
**아키텍처 가이드:** ~/.claude/architecture-guides/react.md, ~/.claude/architecture-guides/typescript.md

---

## File Structure

```
frontend/src/
├── features/integrations/
│   ├── components/
│   │   ├── connector-grid.tsx          # 카테고리별 카드 그리드 (메인)
│   │   ├── connector-card.tsx          # 개별 연동 카드
│   │   ├── oauth-connect-button.tsx    # OAuth 팝업 트리거
│   │   ├── slack-config-modal.tsx      # Slack 채널/키워드 설정
│   │   ├── jira-config-modal.tsx       # Jira 프로젝트 설정
│   │   ├── engine-config-modal.tsx     # 코드 생성 엔진 설정
│   │   └── connection-test-badge.tsx   # 연결 테스트 결과
│   ├── hooks/
│   │   ├── useConnectors.ts            # SWR 연동 목록
│   │   ├── useOAuthPopup.ts            # OAuth 팝업 관리
│   │   └── useConnectorTest.ts         # 연결 테스트
│   ├── types/
│   │   └── integration.ts              # 연동 전용 타입
│   └── utils/
│       └── connector-registry.ts       # 플랫폼별 설정 매핑
├── features/dashboard/components/
│   └── pending-issues-widget.tsx        # 대기 이슈 위젯 (추가)
├── features/issues/components/
│   └── pending-issues-tab.tsx           # 대기 중 탭 (추가)
├── constants/
│   └── mock-integrations.ts             # 연동 Mock 데이터
└── app/(dashboard)/integrations/
    └── page.tsx                          # 페이지 수정
```

---

### Task 1: 연동 타입 + Mock 데이터 + 플랫폼 레지스트리

**Files:**
- Create: `frontend/src/features/integrations/types/integration.ts`
- Create: `frontend/src/features/integrations/utils/connector-registry.ts`
- Create: `frontend/src/constants/mock-integrations.ts`

- [ ] **Step 1: 연동 전용 타입 정의**

`frontend/src/features/integrations/types/integration.ts`:

```typescript
export type IntegrationType = "JIRA" | "GITHUB" | "GITLAB" | "NOTION" | "SLACK" | "TEAMS" | "EMAIL";

export type IntegrationRole = "ISSUE_SOURCE" | "NOTIFICATION" | "CODE_ENGINE";

export type IntegrationStatus = "CONNECTED" | "DISCONNECTED" | "ERROR";

export interface Integration {
  id: string;
  type: IntegrationType;
  role: IntegrationRole;
  status: IntegrationStatus;
  config: IntegrationConfig;
  n8nWorkflowId?: string;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationConfig {
  projectKeys?: string[];
  channels?: SlackChannelConfig;
  keywords?: string[];
  engineUrl?: string;
  engineProvider?: string;
  [key: string]: unknown;
}

export interface SlackChannelConfig {
  monitorChannels: string[];
  notifyChannel: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs: number;
}

export interface PendingIssue {
  id: string;
  sourceType: string;
  sourceChannel?: string;
  rawMessage: string;
  parsedTitle?: string;
  parsedDescription?: string;
  parsedPriority?: string;
  parsedComponent?: string;
  confidence?: number;
  status: "PENDING" | "CONFIRMED" | "DISMISSED";
  createdAt: string;
  confirmedAt?: string;
}
```

- [ ] **Step 2: 플랫폼 레지스트리 생성**

`frontend/src/features/integrations/utils/connector-registry.ts`:

```typescript
import type { IntegrationType, IntegrationRole } from "../types/integration";

export interface PlatformInfo {
  type: IntegrationType;
  label: string;
  description: string;
  role: IntegrationRole;
  iconBgColor: string;
  iconLabel: string;
  phase: 1 | 2;
  authType: "oauth2" | "api_key" | "webhook_url";
  oauthUrl?: string;
}

export const PLATFORM_REGISTRY: PlatformInfo[] = [
  {
    type: "JIRA",
    label: "Jira",
    description: "이슈 트래킹",
    role: "ISSUE_SOURCE",
    iconBgColor: "bg-[#0052CC]",
    iconLabel: "J",
    phase: 1,
    authType: "oauth2",
    oauthUrl: "/api/oauth/jira",
  },
  {
    type: "GITHUB",
    label: "GitHub",
    description: "이슈 + CI/CD",
    role: "ISSUE_SOURCE",
    iconBgColor: "bg-[#24292e]",
    iconLabel: "G",
    phase: 2,
    authType: "oauth2",
  },
  {
    type: "GITLAB",
    label: "GitLab",
    description: "이슈 + CI/CD",
    role: "ISSUE_SOURCE",
    iconBgColor: "bg-[#FC6D26]",
    iconLabel: "GL",
    phase: 2,
    authType: "oauth2",
  },
  {
    type: "NOTION",
    label: "Notion",
    description: "이슈 데이터베이스",
    role: "ISSUE_SOURCE",
    iconBgColor: "bg-black",
    iconLabel: "N",
    phase: 2,
    authType: "oauth2",
  },
  {
    type: "SLACK",
    label: "Slack",
    description: "에러 감지 + 알림",
    role: "NOTIFICATION",
    iconBgColor: "bg-[#4A154B]",
    iconLabel: "S",
    phase: 1,
    authType: "oauth2",
    oauthUrl: "/api/oauth/slack",
  },
  {
    type: "TEAMS",
    label: "Teams",
    description: "알림 채널",
    role: "NOTIFICATION",
    iconBgColor: "bg-[#6264A7]",
    iconLabel: "T",
    phase: 2,
    authType: "oauth2",
  },
  {
    type: "EMAIL",
    label: "Email",
    description: "알림 발송",
    role: "NOTIFICATION",
    iconBgColor: "bg-muted-foreground",
    iconLabel: "@",
    phase: 2,
    authType: "api_key",
  },
];

export const ISSUE_SOURCES = PLATFORM_REGISTRY.filter((p) => p.role === "ISSUE_SOURCE");
export const NOTIFICATION_CHANNELS = PLATFORM_REGISTRY.filter((p) => p.role === "NOTIFICATION");

export function getPlatformInfo(type: IntegrationType): PlatformInfo | undefined {
  return PLATFORM_REGISTRY.find((p) => p.type === type);
}
```

- [ ] **Step 3: Mock 데이터 생성**

`frontend/src/constants/mock-integrations.ts`:

```typescript
import type { Integration, PendingIssue } from "@/features/integrations/types/integration";

export const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: "int-1",
    type: "JIRA",
    role: "ISSUE_SOURCE",
    status: "CONNECTED",
    config: {
      projectKeys: ["PAY", "AUTH"],
    },
    n8nWorkflowId: "wf-jira-001",
    lastSyncAt: "2026-04-20T10:58:00Z",
    createdAt: "2026-04-01T00:00:00Z",
    updatedAt: "2026-04-20T10:58:00Z",
  },
  {
    id: "int-2",
    type: "SLACK",
    role: "NOTIFICATION",
    status: "CONNECTED",
    config: {
      channels: {
        monitorChannels: ["#prod-alerts", "#backend-errors"],
        notifyChannel: "#issuehub-notifications",
      },
      keywords: ["error", "500", "exception", "fail", "timeout"],
    },
    n8nWorkflowId: "wf-slack-001",
    lastSyncAt: "2026-04-20T11:00:00Z",
    createdAt: "2026-04-01T00:00:00Z",
    updatedAt: "2026-04-20T11:00:00Z",
  },
];

export const MOCK_PENDING_ISSUES: PendingIssue[] = [
  {
    id: "pi-1",
    sourceType: "SLACK",
    sourceChannel: "#prod-alerts",
    rawMessage: "500 Error on /api/login — NullPointerException at AuthService.java:42",
    parsedTitle: "로그인 500 에러",
    parsedDescription: "프로덕션 환경에서 로그인 API(/api/login)에서 NullPointerException 발생. AuthService.java:42 라인에서 에러 추적.",
    parsedPriority: "HIGH",
    parsedComponent: "Backend/Auth",
    confidence: 0.94,
    status: "PENDING",
    createdAt: "2026-04-20T10:57:00Z",
  },
  {
    id: "pi-2",
    sourceType: "SLACK",
    sourceChannel: "#backend-errors",
    rawMessage: "Payment timeout occurred for order #12345, gateway response took 32s",
    parsedTitle: "결제 타임아웃 간헐적 발생",
    parsedDescription: "주문 #12345에서 결제 게이트웨이 응답이 32초 걸림. 타임아웃 기준(10초) 초과.",
    parsedPriority: "MEDIUM",
    parsedComponent: "Backend/Payment",
    confidence: 0.87,
    status: "PENDING",
    createdAt: "2026-04-20T10:42:00Z",
  },
  {
    id: "pi-3",
    sourceType: "SLACK",
    sourceChannel: "#prod-alerts",
    rawMessage: "Redis cache miss rate increased to 45% in last 15min",
    parsedTitle: "캐시 미스율 증가",
    parsedDescription: "Redis 캐시 미스율이 최근 15분간 45%로 증가. 평균 대비 3배.",
    parsedPriority: "LOW",
    parsedComponent: "Infra/Cache",
    confidence: 0.72,
    status: "PENDING",
    createdAt: "2026-04-20T09:58:00Z",
  },
];
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/integrations/types/integration.ts
git add frontend/src/features/integrations/utils/connector-registry.ts
git add frontend/src/constants/mock-integrations.ts
git commit -m "feat(frontend): 연동 타입 + Mock 데이터 + 플랫폼 레지스트리"
```

---

### Task 2: connector-card 컴포넌트

**Files:**
- Create: `frontend/src/features/integrations/components/connector-card.tsx`

- [ ] **Step 1: connector-card 구현**

`frontend/src/features/integrations/components/connector-card.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/features/integrations/components/connector-card.tsx
git commit -m "feat(frontend): connector-card 컴포넌트"
```

---

### Task 3: connector-grid + useConnectors 훅

**Files:**
- Create: `frontend/src/features/integrations/components/connector-grid.tsx`
- Create: `frontend/src/features/integrations/hooks/useConnectors.ts`

- [ ] **Step 1: useConnectors 훅 생성**

`frontend/src/features/integrations/hooks/useConnectors.ts`:

```typescript
"use client";

import { useState } from "react";
import type { Integration, ConnectionTestResult } from "../types/integration";
import { MOCK_INTEGRATIONS } from "@/constants/mock-integrations";

export function useConnectors() {
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS);
  const [isLoading, setIsLoading] = useState(false);

  function getIntegrationByType(type: string): Integration | undefined {
    return integrations.find((i) => i.type === type);
  }

  async function connectPlatform(type: string): Promise<void> {
    setIsLoading(true);
    // TODO: BE 연동 시 apiClient.post("/integrations", { type }) 호출
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
  }

  async function disconnectPlatform(id: string): Promise<void> {
    setIntegrations((prev) => prev.filter((i) => i.id !== id));
  }

  async function testConnection(id: string): Promise<ConnectionTestResult> {
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, message: "연결 성공", latencyMs: 120 };
  }

  return {
    integrations,
    isLoading,
    getIntegrationByType,
    connectPlatform,
    disconnectPlatform,
    testConnection,
  };
}
```

- [ ] **Step 2: connector-grid 구현**

`frontend/src/features/integrations/components/connector-grid.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ConnectorCard } from "./connector-card";
import { useConnectors } from "../hooks/useConnectors";
import { ISSUE_SOURCES, NOTIFICATION_CHANNELS } from "../utils/connector-registry";
import { SlackConfigModal } from "./slack-config-modal";
import { JiraConfigModal } from "./jira-config-modal";
import type { Integration } from "../types/integration";
import type { PlatformInfo } from "../utils/connector-registry";

const CODE_ENGINES: PlatformInfo[] = [
  {
    type: "GITHUB" as const,
    label: "OpenHands",
    description: "AI 코드 에이전트",
    role: "CODE_ENGINE" as const,
    iconBgColor: "bg-emerald-600",
    iconLabel: "OH",
    phase: 1,
    authType: "api_key",
  },
  {
    type: "GITLAB" as const,
    label: "LLM Direct",
    description: "Ollama / Claude API",
    role: "CODE_ENGINE" as const,
    iconBgColor: "bg-violet-600",
    iconLabel: "AI",
    phase: 1,
    authType: "api_key",
  },
];

export function ConnectorGrid() {
  const { integrations, getIntegrationByType, connectPlatform, disconnectPlatform, testConnection } = useConnectors();
  const [configModal, setConfigModal] = useState<{ type: "slack" | "jira"; integration: Integration } | null>(null);

  function handleConnect(platform: PlatformInfo) {
    connectPlatform(platform.type);
  }

  function handleConfigure(integration: Integration) {
    if (integration.type === "SLACK") {
      setConfigModal({ type: "slack", integration });
    } else if (integration.type === "JIRA") {
      setConfigModal({ type: "jira", integration });
    }
  }

  function handleTest(integration: Integration) {
    testConnection(integration.id);
  }

  function handleDisconnect(integration: Integration) {
    disconnectPlatform(integration.id);
  }

  return (
    <div className="space-y-8">
      {/* 이슈 소스 */}
      <section>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-primary">
          이슈 소스
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ISSUE_SOURCES.map((platform) => (
            <ConnectorCard
              key={platform.type}
              platform={platform}
              integration={getIntegrationByType(platform.type)}
              onConnect={handleConnect}
              onConfigure={handleConfigure}
              onTest={handleTest}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      </section>

      {/* 알림 채널 */}
      <section>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-tertiary">
          알림 채널
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {NOTIFICATION_CHANNELS.map((platform) => (
            <ConnectorCard
              key={platform.type}
              platform={platform}
              integration={getIntegrationByType(platform.type)}
              onConnect={handleConnect}
              onConfigure={handleConfigure}
              onTest={handleTest}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      </section>

      {/* 코드 생성 엔진 */}
      <section>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-emerald-500">
          코드 생성 엔진
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CODE_ENGINES.map((engine) => (
            <ConnectorCard
              key={engine.label}
              platform={engine}
              onConnect={handleConnect}
              onConfigure={() => {}}
              onTest={() => {}}
              onDisconnect={() => {}}
            />
          ))}
        </div>
      </section>

      {/* 설정 모달 */}
      {configModal?.type === "slack" && (
        <SlackConfigModal
          integration={configModal.integration}
          open={true}
          onClose={() => setConfigModal(null)}
        />
      )}
      {configModal?.type === "jira" && (
        <JiraConfigModal
          integration={configModal.integration}
          open={true}
          onClose={() => setConfigModal(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/integrations/components/connector-grid.tsx
git add frontend/src/features/integrations/hooks/useConnectors.ts
git commit -m "feat(frontend): connector-grid + useConnectors 훅"
```

---

### Task 4: Slack 설정 모달

**Files:**
- Create: `frontend/src/features/integrations/components/slack-config-modal.tsx`

- [ ] **Step 1: slack-config-modal 구현**

`frontend/src/features/integrations/components/slack-config-modal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import type { Integration } from "../types/integration";

interface SlackConfigModalProps {
  integration: Integration;
  open: boolean;
  onClose: () => void;
}

export function SlackConfigModal({ integration, open, onClose }: SlackConfigModalProps) {
  const channels = integration.config.channels;
  const [monitorChannels, setMonitorChannels] = useState<string[]>(
    channels?.monitorChannels ?? []
  );
  const [notifyChannel, setNotifyChannel] = useState(
    channels?.notifyChannel ?? ""
  );
  const [keywords, setKeywords] = useState<string[]>(
    (integration.config.keywords as string[]) ?? []
  );
  const [newChannel, setNewChannel] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  function addChannel() {
    const ch = newChannel.trim();
    if (ch && !monitorChannels.includes(ch)) {
      setMonitorChannels([...monitorChannels, ch.startsWith("#") ? ch : `#${ch}`]);
      setNewChannel("");
    }
  }

  function removeChannel(ch: string) {
    setMonitorChannels(monitorChannels.filter((c) => c !== ch));
  }

  function addKeyword() {
    const kw = newKeyword.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setNewKeyword("");
    }
  }

  function removeKeyword(kw: string) {
    setKeywords(keywords.filter((k) => k !== kw));
  }

  function handleSave() {
    // TODO: BE 연동 시 apiClient.put(`/integrations/${integration.id}`, config)
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Slack 설정</SheetTitle>
          <SheetDescription>에러 감시 채널과 키워드를 설정합니다</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* 감시 채널 */}
          <div>
            <label className="text-sm font-medium">감시 채널</label>
            <p className="text-xs text-muted-foreground mb-2">에러 메시지를 감지할 Slack 채널</p>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="#channel-name"
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addChannel()}
              />
              <Button variant="outline" size="sm" onClick={addChannel}>추가</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {monitorChannels.map((ch) => (
                <span key={ch} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                  {ch}
                  <button onClick={() => removeChannel(ch)}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* 알림 채널 */}
          <div>
            <label className="text-sm font-medium">알림 채널</label>
            <p className="text-xs text-muted-foreground mb-2">IssueHub 처리 결과를 보낼 채널</p>
            <Input
              placeholder="#issuehub-notifications"
              value={notifyChannel}
              onChange={(e) => setNotifyChannel(e.target.value)}
            />
          </div>

          {/* 키워드 */}
          <div>
            <label className="text-sm font-medium">감지 키워드</label>
            <p className="text-xs text-muted-foreground mb-2">이 키워드가 포함된 메시지만 감지합니다</p>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="error, 500, exception..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              />
              <Button variant="outline" size="sm" onClick={addKeyword}>추가</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span key={kw} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                  {kw}
                  <button onClick={() => removeKeyword(kw)}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/features/integrations/components/slack-config-modal.tsx
git commit -m "feat(frontend): Slack 설정 모달 (채널/키워드)"
```

---

### Task 5: Jira 설정 모달

**Files:**
- Create: `frontend/src/features/integrations/components/jira-config-modal.tsx`

- [ ] **Step 1: jira-config-modal 구현**

`frontend/src/features/integrations/components/jira-config-modal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import type { Integration } from "../types/integration";

interface JiraConfigModalProps {
  integration: Integration;
  open: boolean;
  onClose: () => void;
}

export function JiraConfigModal({ integration, open, onClose }: JiraConfigModalProps) {
  const [projectKeys, setProjectKeys] = useState<string[]>(
    integration.config.projectKeys ?? []
  );
  const [newKey, setNewKey] = useState("");

  function addProjectKey() {
    const key = newKey.trim().toUpperCase();
    if (key && !projectKeys.includes(key)) {
      setProjectKeys([...projectKeys, key]);
      setNewKey("");
    }
  }

  function removeProjectKey(key: string) {
    setProjectKeys(projectKeys.filter((k) => k !== key));
  }

  function handleSave() {
    // TODO: BE 연동 시 apiClient.put(`/integrations/${integration.id}`, config)
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Jira 설정</SheetTitle>
          <SheetDescription>연동할 Jira 프로젝트를 설정합니다</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* 프로젝트 키 */}
          <div>
            <label className="text-sm font-medium">프로젝트 키</label>
            <p className="text-xs text-muted-foreground mb-2">이슈를 감시할 Jira 프로젝트 키 (예: PAY, AUTH)</p>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="프로젝트 키 입력"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addProjectKey()}
              />
              <Button variant="outline" size="sm" onClick={addProjectKey}>추가</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {projectKeys.map((key) => (
                <span key={key} className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-1 text-xs font-medium">
                  {key}
                  <button onClick={() => removeProjectKey(key)}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* 연동 방식 표시 */}
          <div>
            <label className="text-sm font-medium">연동 방식</label>
            <div className="mt-2 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Webhook — 실시간 이슈 감지
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                폴링 — 5분 간격 누락 방지 (자동)
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                Jira Automation — 고급 (n8n에서 설정)
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/features/integrations/components/jira-config-modal.tsx
git commit -m "feat(frontend): Jira 설정 모달 (프로젝트 키)"
```

---

### Task 6: 연동 설정 페이지 조립

**Files:**
- Modify: `frontend/src/app/(dashboard)/integrations/page.tsx`

- [ ] **Step 1: integrations 페이지 수정**

`frontend/src/app/(dashboard)/integrations/page.tsx` 전체 교체:

```tsx
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
```

- [ ] **Step 2: 빌드 확인**

Run:
```bash
cd frontend && npm run build
```

Expected: 빌드 성공

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/\(dashboard\)/integrations/page.tsx
git commit -m "feat(frontend): 연동 설정 페이지 조립"
```

---

### Task 7: 대시보드 대기 이슈 위젯

**Files:**
- Create: `frontend/src/features/dashboard/components/pending-issues-widget.tsx`
- Modify: `frontend/src/app/(dashboard)/page.tsx`

- [ ] **Step 1: pending-issues-widget 구현**

`frontend/src/features/dashboard/components/pending-issues-widget.tsx`:

```tsx
"use client";

import Link from "next/link";
import { MOCK_PENDING_ISSUES } from "@/constants/mock-integrations";

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "text-red-400",
  MEDIUM: "text-yellow-400",
  LOW: "text-muted-foreground",
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export function PendingIssuesWidget() {
  const pendingIssues = MOCK_PENDING_ISSUES.filter((i) => i.status === "PENDING");

  if (pendingIssues.length === 0) return null;

  return (
    <div className="rounded-xl border border-tertiary/30 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold text-tertiary">대기 중 이슈</h3>
        <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
          {pendingIssues.length}
        </span>
      </div>

      <div className="space-y-2">
        {pendingIssues.slice(0, 3).map((issue) => (
          <div
            key={issue.id}
            className="flex items-center justify-between rounded-lg bg-background p-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{issue.parsedTitle}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatTimeAgo(issue.createdAt)}
              </p>
            </div>
            <span className={`ml-2 text-[11px] font-semibold ${PRIORITY_COLORS[issue.parsedPriority ?? "LOW"]}`}>
              {issue.parsedPriority}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/issues?tab=pending"
        className="mt-2 block text-center text-xs text-primary hover:underline"
      >
        전체 보기 →
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: 대시보드 페이지에 위젯 추가**

`frontend/src/app/(dashboard)/page.tsx`를 읽고, 기존 레이아웃의 우측 사이드 영역에 `<PendingIssuesWidget />`를 추가.

import 추가:
```tsx
import { PendingIssuesWidget } from "@/features/dashboard/components/pending-issues-widget";
```

기존 레이아웃의 우측 컬럼(policy-accuracy 등이 있는 곳)에 `<PendingIssuesWidget />` 삽입.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/dashboard/components/pending-issues-widget.tsx
git add frontend/src/app/\(dashboard\)/page.tsx
git commit -m "feat(frontend): 대시보드 대기 이슈 위젯"
```

---

### Task 8: 이슈 목록 "대기 중" 탭

**Files:**
- Create: `frontend/src/features/issues/components/pending-issues-tab.tsx`
- Modify: `frontend/src/features/issues/components/issue-listing.tsx`

- [ ] **Step 1: pending-issues-tab 구현**

`frontend/src/features/issues/components/pending-issues-tab.tsx`:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PENDING_ISSUES } from "@/constants/mock-integrations";

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-red-500/20 text-red-400",
  MEDIUM: "bg-yellow-500/20 text-yellow-400",
  LOW: "bg-muted text-muted-foreground",
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export function PendingIssuesTab() {
  const pendingIssues = MOCK_PENDING_ISSUES.filter((i) => i.status === "PENDING");

  function handleConfirm(id: string) {
    // TODO: apiClient.post(`/pending-issues/${id}/confirm`)
  }

  function handleDismiss(id: string) {
    // TODO: apiClient.post(`/pending-issues/${id}/dismiss`)
  }

  if (pendingIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">대기 중인 이슈가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingIssues.map((issue) => (
        <div
          key={issue.id}
          className="flex items-center justify-between rounded-lg border bg-card p-4"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="outline" className={PRIORITY_STYLES[issue.parsedPriority ?? "LOW"]}>
                {issue.parsedPriority}
              </Badge>
              <span className="text-sm font-semibold">{issue.parsedTitle}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {issue.sourceChannel} · {formatTimeAgo(issue.createdAt)} · 신뢰도 {Math.round((issue.confidence ?? 0) * 100)}%
            </p>
          </div>
          <div className="ml-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              onClick={() => handleConfirm(issue.id)}
            >
              확인
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs text-primary"
              onClick={() => {}}
            >
              수정
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-muted-foreground"
              onClick={() => handleDismiss(issue.id)}
            >
              무시
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: issue-listing.tsx에 탭 추가**

`frontend/src/features/issues/components/issue-listing.tsx`를 읽고 수정:

상단에 import 추가:
```tsx
import { useQueryState } from "nuqs";
import { PendingIssuesTab } from "./pending-issues-tab";
import { MOCK_PENDING_ISSUES } from "@/constants/mock-integrations";
```

컴포넌트 내부에 탭 상태 추가:
```tsx
const [tab, setTab] = useQueryState("tab", { defaultValue: "all" });
const pendingCount = MOCK_PENDING_ISSUES.filter((i) => i.status === "PENDING").length;
```

제목 아래, 기존 필터/테이블 위에 탭 UI 삽입:
```tsx
<div className="mb-4 flex gap-0 border-b border-border">
  <button
    className={`px-4 py-2 text-sm ${tab === "all" ? "text-foreground border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
    onClick={() => setTab("all")}
  >
    전체 이슈
  </button>
  <button
    className={`px-4 py-2 text-sm ${tab === "pending" ? "text-primary border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
    onClick={() => setTab("pending")}
  >
    대기 중
    {pendingCount > 0 && (
      <span className="ml-1 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] text-destructive-foreground">
        {pendingCount}
      </span>
    )}
  </button>
</div>
```

기존 필터/테이블을 조건부 렌더링:
```tsx
{tab === "pending" ? <PendingIssuesTab /> : (
  // 기존 이슈 목록 내용
)}
```

- [ ] **Step 3: 빌드 확인**

Run:
```bash
cd frontend && npm run build
```

Expected: 빌드 성공

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/issues/components/pending-issues-tab.tsx
git add frontend/src/features/issues/components/issue-listing.tsx
git commit -m "feat(frontend): 이슈 목록 대기 중 탭"
```
