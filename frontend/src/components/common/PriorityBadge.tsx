import { Badge } from "@/components/ui/badge";
import { IssuePriority } from "@/types/issue";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: IssuePriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(PRIORITY_COLORS[priority], "font-medium", className)}
    >
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
