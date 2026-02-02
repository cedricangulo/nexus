/**
 * Category Bar
 * Displays a proportional breakdown of categories as stacked bars
 */

import { cn } from "@/lib/utils";

const COLOR_VARIANTS = {
  "status-success": "bg-chart-1",
  "status-in-progress": "bg-chart-3",
  "status-warning": "bg-chart-2",
  "status-error": "bg-chart-4",
  "status-info": "bg-muted",
} as const;

export type ColorVariant = keyof typeof COLOR_VARIANTS;

interface CategoryBarProps {
  values: number[];
  colors: ColorVariant[];
  showLabels?: boolean;
  className?: string;
  tooltips?: string[];
}

export function CategoryBar({
  values,
  colors,
  // showLabels = false,
  className,
  tooltips,
}: CategoryBarProps) {
  const total = values.reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <div
        className={cn(
          "flex w-full overflow-hidden rounded-full bg-muted",
          className
        )}
      />
    );
  }

  return (
    <div className={cn("flex w-full gap-1 overflow-hidden", className)}>
      {values.map((value, index) => {
        const percentage = (value / total) * 100;
        const color = colors[index] || "bg-muted";

        if (percentage === 0) {
          return null;
        }

        return (
          <div
            className={cn(
              "h-full rounded-xs transition-all",
              COLOR_VARIANTS[color as ColorVariant]
            )}
            key={index}
            style={{
              width: `${percentage}%`,
            }}
            title={tooltips?.[index] || `${value}`}
          />
        );
      })}
    </div>
  );
}
