import {
  CircleDot,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    title: "전체 이슈",
    value: "2,540",
    subtitle: "+12% 이번 달",
    icon: CircleDot,
    iconBg: "bg-blue-100 dark:bg-blue-950",
    iconColor: "text-blue-600",
    trend: "+12%",
    trendUp: true,
  },
  {
    title: "진행 중",
    value: "48",
    subtitle: "활성 스프린트",
    icon: Clock,
    iconBg: "bg-yellow-100 dark:bg-yellow-950",
    iconColor: "text-yellow-600",
    trend: null,
    trendUp: false,
  },
  {
    title: "완료",
    value: "2,492",
    subtitle: "98.1% 성공률",
    icon: CheckCircle2,
    iconBg: "bg-green-100 dark:bg-green-950",
    iconColor: "text-green-600",
    trend: "98.1%",
    trendUp: true,
  },
];

export function SummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    {stat.trendUp && stat.trend && (
                      <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </span>
                  </div>
                </div>
                <div className={`rounded-lg p-3 ${stat.iconBg}`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
