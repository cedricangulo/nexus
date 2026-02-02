"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { BurndownDataPoint } from "@/lib/data/analytics";

const chartConfig = {
  remaining: {
    label: "Actual",
    color: "var(--chart-2)",
  },
  ideal: {
    label: "Ideal",
    color: "var(--muted-foreground)",
  },
};

interface BurndownChartClientProps {
  data: BurndownDataPoint[];
}

export function BurndownChartClient({ data }: BurndownChartClientProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-75 items-center justify-center text-muted-foreground text-sm">
        No active sprint
      </div>
    );
  }

  return (
    <ChartContainer className="h-75 w-full" config={chartConfig}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          axisLine={false}
          dataKey="date"
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          axisLine={false}
          label={{
            value: "Tasks Remaining",
            angle: -90,
            position: "insideLeft",
          }}
          tickLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="ideal"
          dot={false}
          stroke="var(--color-ideal)"
          strokeDasharray="5 5"
          strokeWidth={2}
          type="monotone"
        />
        <Line
          connectNulls={false}
          dataKey="remaining"
          dot={{ r: 3 }}
          stroke="var(--color-remaining)"
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ChartContainer>
  );
}
