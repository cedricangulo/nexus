"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { VelocityDataPoint } from "@/lib/data/analytics";

const chartConfig = {
  tasksCompleted: {
    label: "Tasks Completed",
    color: "var(--success)",
  },
};

interface VelocityChartClientProps {
  data: VelocityDataPoint[];
}

export function VelocityChartClient({ data }: VelocityChartClientProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-75 items-center justify-center text-muted-foreground text-sm">
        No sprint data available
      </div>
    );
  }

  return (
    <ChartContainer className="h-75 w-full" config={chartConfig}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="sprintName"
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          label={{ value: "Tasks", angle: -90, position: "insideLeft" }}
          tickLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="tasksCompleted"
          fill="var(--color-tasksCompleted)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
