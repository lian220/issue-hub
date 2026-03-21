import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CircleDot,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface SummaryData {
  totalOpen: number;
  totalInProgress: number;
  totalResolved: number;
  totalSlaBreach: number;
}

interface SummaryCardsProps {
  data?: SummaryData;
}

const cards = [
  {
    key: "totalOpen" as const,
    title: "열린 이슈",
    icon: CircleDot,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    key: "totalInProgress" as const,
    title: "진행 중",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
  },
  {
    key: "totalResolved" as const,
    title: "해결됨",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  {
    key: "totalSlaBreach" as const,
    title: "SLA 위반",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
];

export function SummaryCards({ data }: SummaryCardsProps) {
  const placeholderData: SummaryData = {
    totalOpen: 24,
    totalInProgress: 12,
    totalResolved: 156,
    totalSlaBreach: 3,
  };

  const displayData = data ?? placeholderData;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {displayData[card.key].toLocaleString("ko-KR")}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
