import { cn } from "@/lib/utils";

interface ConfidenceGaugeProps {
  score: number;
  size?: number;
  className?: string;
}

function getColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function getStrokeColor(score: number): string {
  if (score >= 80) return "stroke-green-500";
  if (score >= 50) return "stroke-amber-500";
  return "stroke-red-500";
}

export function ConfidenceGauge({
  score,
  size = 80,
  className,
}: ConfidenceGaugeProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-500", getStrokeColor(clampedScore))}
        />
      </svg>
      <span
        className={cn(
          "absolute text-sm font-bold",
          getColor(clampedScore)
        )}
      >
        {clampedScore}
      </span>
    </div>
  );
}
