"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface TrackerBlockProps {
  key?: string | number;
  color?: string;
  tooltip?: string;
}

interface TrackerProps extends React.HTMLAttributes<HTMLDivElement> {
  data: TrackerBlockProps[];
  showTooltip?: boolean;
}

const Tracker = React.forwardRef<HTMLDivElement, TrackerProps>(
  ({ data = [], className, showTooltip = false, ...props }, forwardedRef) => {
    return (
      <div
        ref={forwardedRef}
        className={cn("flex h-8 w-full items-center gap-0.5", className)}
        {...props}
      >
        {data.map((block) => (
          showTooltip && block.tooltip ? (
            <Tooltip key={block.key}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "h-full w-full rounded-xs flex-1 transition-all hover:opacity-80 cursor-pointer",
                    block.color || "bg-accent"
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {block.tooltip}
              </TooltipContent>
            </Tooltip>
          ) : (
            <div
              key={block.key}
              className={cn(
                "h-full w-full rounded-xs flex-1 transition-all hover:opacity-80",
                block.color || "bg-accent"
              )}
            />
          )
        ))}
      </div>
    );
  }
);

Tracker.displayName = "Tracker";

export { Tracker };
