import Link from "next/link";
import { Plus, FileText, Shield, Lock, Server, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PLACEHOLDER_POLICIES = [
  {
    id: "POL-001",
    name: "보안 인시던트 대응 정책",
    category: "SECURITY",
    version: 3,
    isActive: true,
    updatedAt: "2026-03-20",
    icon: Shield,
  },
  {
    id: "POL-002",
    name: "접근 제어 정책",
    category: "ACCESS_CONTROL",
    version: 2,
    isActive: true,
    updatedAt: "2026-03-18",
    icon: Lock,
  },
  {
    id: "POL-003",
    name: "운영 절차 가이드",
    category: "OPERATIONS",
    version: 5,
    isActive: true,
    updatedAt: "2026-03-15",
    icon: Server,
  },
  {
    id: "POL-004",
    name: "개발 표준 정책",
    category: "DEVELOPMENT",
    version: 1,
    isActive: false,
    updatedAt: "2026-03-10",
    icon: Code,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  SECURITY: "보안",
  COMPLIANCE: "컴플라이언스",
  OPERATIONS: "운영",
  DEVELOPMENT: "개발",
  INCIDENT_RESPONSE: "인시던트 대응",
  ACCESS_CONTROL: "접근 제어",
  DATA_PROTECTION: "데이터 보호",
};

export default function PoliciesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">정책</h1>
          <p className="text-muted-foreground">
            조직의 정책을 관리하고 이슈에 연결합니다.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          정책 생성
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER_POLICIES.map((policy) => {
          const Icon = policy.icon;
          return (
            <Link key={policy.id} href={`/policies/${policy.id}`}>
              <Card className="transition-colors hover:bg-accent/50 cursor-pointer h-full">
                <CardHeader className="flex flex-row items-start gap-3">
                  <div className="rounded-lg border p-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-base leading-tight">
                      {policy.name}
                    </CardTitle>
                    <CardDescription>
                      {CATEGORY_LABELS[policy.category]} | v{policy.version}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant={policy.isActive ? "default" : "secondary"}>
                      {policy.isActive ? "활성" : "비활성"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {policy.updatedAt}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
