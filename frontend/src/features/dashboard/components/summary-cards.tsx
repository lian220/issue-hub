import Link from "next/link";
import {
  CircleDot,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_ISSUES } from "@/constants/mock-data";

const cards = [
  {
    key: "totalOpen" as const,
    title: "열린 이슈",
    icon: CircleDot,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    href: "/issues?status=OPEN",
  },
  {
    key: "totalInProgress" as const,
    title: "진행 중",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    href: "/issues?status=IN_PROGRESS",
  },
  {
    key: "totalResolved" as const,
    title: "해결됨",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    href: "/issues?status=RESOLVED",
  },
  {
    key: "totalSlaBreach" as const,
    title: "SLA 위반",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950",
    href: "/issues?slaBreach=true",
    urgent: true,
  },
];

interface SummaryData {
  totalOpen: number;
  totalInProgress: number;
  totalResolved: number;
  totalSlaBreach: number;
}

export function SummaryCards() {
  const data: SummaryData = {
    totalOpen: MOCK_ISSUES.filter((i) => i.status === "OPEN").length,
    totalInProgress: MOCK_ISSUES.filter((i) => i.status === "IN_PROGRESS").length,
    totalResolved: MOCK_ISSUES.filter((i) => i.status === "RESOLVED").length,
    totalSlaBreach: MOCK_ISSUES.filter((i) => i.slaBreach).length,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isUrgent = card.urgent && data[card.key] > 0;

        return (
          <Link
            key={card.key}
            href={card.href}
            className={cn(
              "block rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:bg-muted/50",
              isUrgent && "border-red-300 dark:border-red-800"
            )}
          >
            <span className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {card.title}
              </span>
              <span className={cn("rounded-lg p-2", card.bgColor, isUrgent && "animate-pulse")}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </span>
            </span>
            <span className={cn("block text-3xl font-bold", isUrgent && "text-red-600")}>
              {data[card.key].toLocaleString("ko-KR")}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
