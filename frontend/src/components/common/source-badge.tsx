import { cn } from "@/lib/utils";

type Source = "JIRA" | "GITHUB" | "NOTION" | "GITLAB" | "INTERNAL";

interface SourceBadgeProps {
  source: Source;
  className?: string;
}

const SOURCE_CONFIG: Record<Source, { label: string; colorClass: string }> = {
  JIRA: { label: "Jira", colorClass: "bg-blue-100 text-blue-700" },
  GITHUB: { label: "GitHub", colorClass: "bg-gray-100 text-gray-700" },
  NOTION: { label: "Notion", colorClass: "bg-orange-100 text-orange-700" },
  GITLAB: { label: "GitLab", colorClass: "bg-purple-100 text-purple-700" },
  INTERNAL: { label: "Internal", colorClass: "bg-green-100 text-green-700" },
};

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[source];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.colorClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}
