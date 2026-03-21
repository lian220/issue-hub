import { Badge } from "@/components/ui/badge";
import { IssueStatus } from "@/types/issue";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(STATUS_COLORS[status], "font-medium", className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
