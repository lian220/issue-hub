import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
} from "lucide-react";

const SETTING_SECTIONS = [
  {
    icon: User,
    title: "프로필",
    description: "계정 정보와 개인 설정을 관리합니다.",
  },
  {
    icon: Bell,
    title: "알림",
    description: "알림 채널과 수신 설정을 관리합니다.",
  },
  {
    icon: Shield,
    title: "보안",
    description: "비밀번호, 2FA 등 보안 설정을 관리합니다.",
  },
  {
    icon: Palette,
    title: "테마",
    description: "화면 테마와 표시 설정을 관리합니다.",
  },
  {
    icon: Globe,
    title: "언어 및 지역",
    description: "언어, 시간대, 날짜 형식을 설정합니다.",
  },
  {
    icon: Database,
    title: "데이터 관리",
    description: "데이터 내보내기 및 백업 설정을 관리합니다.",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground">
          시스템 설정과 개인 환경을 관리합니다.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SETTING_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.title}
              className="cursor-pointer transition-colors hover:bg-accent/50"
            >
              <CardHeader className="flex flex-row items-start gap-3">
                <div className="rounded-lg border p-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {section.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">일반 설정</CardTitle>
          <CardDescription>기본 시스템 설정을 변경합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="org-name">
                조직명
              </label>
              <Input
                id="org-name"
                defaultValue="IssueHub 팀"
                aria-label="조직명"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="api-url">
                API 서버 URL
              </label>
              <Input
                id="api-url"
                defaultValue="http://localhost:8080"
                aria-label="API 서버 URL"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">시스템 정보</label>
            <div className="flex gap-2">
              <Badge variant="outline">프론트엔드 v0.1.0</Badge>
              <Badge variant="outline">API v0.1.0</Badge>
              <Badge variant="outline">Next.js 16</Badge>
            </div>
          </div>
          <div className="flex justify-end">
            <Button>설정 저장</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
