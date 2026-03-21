import { Platform } from "@/types/issue";
import { PLATFORM_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PlatformIconProps {
  platform: Platform;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

function JiraIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84H11.53zM6.77 6.8a4.362 4.362 0 0 0 4.34 4.34h1.8v1.72a4.362 4.362 0 0 0 4.34 4.34V7.63a.84.84 0 0 0-.84-.84H6.77zM2 11.6a4.362 4.362 0 0 0 4.34 4.34h1.8v1.72A4.362 4.362 0 0 0 12.48 22V12.43a.84.84 0 0 0-.84-.84H2z" />
    </svg>
  );
}

function GitHubIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function SlackIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z" />
    </svg>
  );
}

function TeamsIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.404 4.5a2.25 2.25 0 1 0-2.096-1.418l.006.018A2.243 2.243 0 0 0 19.404 4.5zM20.25 5.25h-3a1.5 1.5 0 0 0-1.5 1.5v4.5a1.5 1.5 0 0 0 1.5 1.5h.75v3.75a.75.75 0 0 0 1.5 0V12.75h.75a1.5 1.5 0 0 0 1.5-1.5v-4.5a1.5 1.5 0 0 0-1.5-1.5zM14.25 6H5.437a1.688 1.688 0 0 0-1.687 1.688v5.625A1.688 1.688 0 0 0 5.437 15H9v3.75a.75.75 0 0 0 1.5 0V15h3.75a1.688 1.688 0 0 0 1.688-1.688V7.688A1.688 1.688 0 0 0 14.25 6zM9.75 3.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z" />
    </svg>
  );
}

function GitLabIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="m23.6 9.593-.033-.086L20.3.98a.851.851 0 0 0-.336-.382.862.862 0 0 0-.997.063.855.855 0 0 0-.283.392l-2.2 6.74H7.517l-2.2-6.74a.847.847 0 0 0-.283-.392.862.862 0 0 0-.997-.063.854.854 0 0 0-.337.382L.437 9.507l-.032.086a6.066 6.066 0 0 0 2.012 7.01l.01.008.028.02 4.97 3.722 2.458 1.86 1.497 1.131a1.013 1.013 0 0 0 1.222 0l1.497-1.131 2.458-1.86 5-3.743.012-.01a6.068 6.068 0 0 0 2.011-7.007z" />
    </svg>
  );
}

export function PlatformIcon({
  platform,
  size = 16,
  className,
  showLabel = false,
}: PlatformIconProps) {
  const iconMap: Record<Platform, React.ReactNode> = {
    JIRA: <JiraIcon size={size} />,
    GITHUB: <GitHubIcon size={size} />,
    GITLAB: <GitLabIcon size={size} />,
    SLACK: <SlackIcon size={size} />,
    TEAMS: <TeamsIcon size={size} />,
    EMAIL: <span style={{ fontSize: size }}>📧</span>,
    MANUAL: <span style={{ fontSize: size }}>✏️</span>,
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {iconMap[platform]}
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {PLATFORM_LABELS[platform]}
        </span>
      )}
    </span>
  );
}
