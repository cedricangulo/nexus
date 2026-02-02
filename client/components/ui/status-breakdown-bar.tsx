import { cn } from "@/lib/utils";

interface StatusBlock {
  count: number;
  color: string;
  label: string;
}

interface StatusBreakdownBarProps {
  blocks: StatusBlock[];
  height?: string;
  className?: string;
}

export function StatusBreakdownBar({
  blocks,
  height = "h-2",
  className,
}: StatusBreakdownBarProps) {
  const total = blocks.reduce((sum, block) => sum + block.count, 0);

  if (total === 0) {
    return null;
  }

  return (
    <div className={cn("flex gap-0.5", className)}>
      {blocks.flatMap((block, blockIndex) =>
        new Array(block.count)
          .fill(null)
          .map((_, rectIndex) => (
            <div
              className={cn(height, "flex-1 rounded-xs", block.color)}
              key={`${block.label}-${blockIndex}-${rectIndex}`}
              title={`${block.label}: ${block.count}`}
            />
          ))
      )}
    </div>
  );
}
