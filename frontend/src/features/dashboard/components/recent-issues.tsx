import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface HighPriorityIssue {
  title: string;
  subtitle: string;
  priority: "CRITICAL" | "HIGH";
  status: string;
  aiStatus: "Analyzed" | "Pending" | "In Progress";
}

const MOCK_HIGH_PRIORITY_ISSUES: HighPriorityIssue[] = [
  {
    title: "DB 커넥션 풀 소진",
    subtitle: "결제 서비스 - PROJ-4829",
    priority: "CRITICAL",
    status: "진행 중",
    aiStatus: "Analyzed",
  },
  {
    title: "워커 스레드 메모리 누수",
    subtitle: "백그라운드 작업 - PROJ-4815",
    priority: "CRITICAL",
    status: "열림",
    aiStatus: "In Progress",
  },
  {
    title: "API 레이트 리미팅 우회",
    subtitle: "게이트웨이 서비스 - PROJ-4801",
    priority: "HIGH",
    status: "진행 중",
    aiStatus: "Analyzed",
  },
  {
    title: "잘못된 타임존 처리",
    subtitle: "스케줄러 - PROJ-4798",
    priority: "HIGH",
    status: "열림",
    aiStatus: "Pending",
  },
  {
    title: "캐시 무효화 경쟁 상태",
    subtitle: "상품 서비스 - PROJ-4790",
    priority: "HIGH",
    status: "검토 중",
    aiStatus: "Analyzed",
  },
];

const AI_STATUS_CONFIG: Record<string, { dot: string; text: string; label: string }> = {
  Analyzed: { dot: "bg-green-500", text: "text-green-700 dark:text-green-400", label: "분석 완료" },
  "In Progress": { dot: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-400", label: "분석 중" },
  Pending: { dot: "bg-gray-400", text: "text-gray-500", label: "대기 중" },
};

export function RecentIssues() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">최근 높은 우선순위 이슈</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이슈 제목</TableHead>
              <TableHead className="w-[100px]">우선순위</TableHead>
              <TableHead className="w-[100px]">상태</TableHead>
              <TableHead className="w-[120px]">AI 분석</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_HIGH_PRIORITY_ISSUES.map((issue) => {
              const aiConfig = AI_STATUS_CONFIG[issue.aiStatus];
              return (
                <TableRow key={issue.subtitle}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{issue.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {issue.subtitle}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        issue.priority === "CRITICAL"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                      }
                    >
                      {issue.priority === "CRITICAL" ? "Critical" : "High"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {issue.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 text-sm">
                      <span
                        className={`h-2 w-2 rounded-full ${aiConfig.dot}`}
                      />
                      <span className={aiConfig.text}>{aiConfig.label}</span>
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
