"use client";

import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { CategoryBar, type ColorVariant } from "@/components/ui/category-bar";
import { FramePanel } from "@/components/ui/frame";
import { StatusBadge } from "@/components/ui/status";
import { formatDate } from "@/lib/helpers/format-date";
import type { PhaseDetail } from "@/lib/types";

const TASK_LEGEND = [
  {
    key: "done",
    label: "Done",
    color: "bg-chart-1",
    statusColor: "status-success" as ColorVariant,
  },
  {
    key: "inProgress",
    label: "In Progress",
    color: "bg-chart-3",
    statusColor: "status-in-progress" as ColorVariant,
  },
  {
    key: "blocked",
    label: "Blocked",
    color: "bg-chart-4",
    statusColor: "status-error" as ColorVariant,
  },
  {
    key: "todo",
    label: "To Do",
    color: "bg-muted",
    statusColor: "status-info" as ColorVariant,
  },
] as const;

const DELIVERABLE_LEGEND = [
  {
    key: "completed",
    label: "Completed",
    color: "bg-chart-1",
    statusColor: "status-success" as ColorVariant,
  },
  {
    key: "inProgress",
    label: "In Progress",
    color: "bg-chart-3",
    statusColor: "status-in-progress" as ColorVariant,
  },
  {
    key: "review",
    label: "In Review",
    color: "bg-chart-2",
    statusColor: "status-warning" as ColorVariant,
  },
  {
    key: "notStarted",
    label: "Not Started",
    color: "bg-muted",
    statusColor: "status-info" as ColorVariant,
  },
] as const;

interface StatusBreakdownSectionProps {
  title: string;
  total: number;
  values: number[];
  colors: ColorVariant[];
  items: ReadonlyArray<{
    readonly key: string;
    readonly label: string;
    readonly color: string;
  }>;
  counts: number[];
}

function StatusBreakdownSection({
  title,
  total,
  values,
  colors,
  items,
  counts,
}: StatusBreakdownSectionProps) {
  if (total === 0) {
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-muted-foreground text-xs">
          No {title.toLowerCase()}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">{title}</h4>
      <CategoryBar
        className="h-3"
        colors={colors}
        showLabels={false}
        values={values}
      />
      <div className="space-y-2 text-sm">
        {items.map(({ key, label, color }, index) => (
          <div
            className="flex items-center justify-between gap-3 text-xs"
            key={key}
          >
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className={`size-2 rounded-xs ${color}`}
              />
              <span className="text-muted-foreground">{label}</span>
            </div>
            <span className="font-medium font-sora tabular-nums">
              {counts[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PhaseProgressTimeline({ phases }: { phases: PhaseDetail[] }) {
  const [selectedPhaseId] = useQueryState(
    "selectedPhase",
    parseAsString.withDefault(phases[0]?.id ?? "")
  );

  const selectedPhase = useMemo(
    () => phases.find((p) => p.id === selectedPhaseId) ?? phases[0],
    [selectedPhaseId, phases]
  );

  const taskCounts = useMemo(() => {
    if (!selectedPhase?.tasks) {
      return {
        done: 0,
        inProgress: 0,
        blocked: 0,
        todo: 0,
        total: 0,
      };
    }

    const tasks = selectedPhase.tasks;
    return {
      done: tasks.filter((t) => t.status === "DONE").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      blocked: tasks.filter((t) => t.status === "BLOCKED").length,
      todo: tasks.filter((t) => t.status === "TODO").length,
      total: tasks.length,
    };
  }, [selectedPhase]);

  const deliverableCounts = useMemo(() => {
    if (!selectedPhase?.deliverables) {
      return {
        completed: 0,
        inProgress: 0,
        review: 0,
        notStarted: 0,
        total: 0,
      };
    }

    const deliverables = selectedPhase.deliverables.filter((d) => !d.deletedAt);
    return {
      completed: deliverables.filter((d) => d.status === "COMPLETED").length,
      inProgress: deliverables.filter((d) => d.status === "IN_PROGRESS").length,
      review: deliverables.filter((d) => d.status === "REVIEW").length,
      notStarted: deliverables.filter((d) => d.status === "NOT_STARTED").length,
      total: deliverables.length,
    };
  }, [selectedPhase]);

  if (phases.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground text-sm">No phases available</p>
      </div>
    );
  }

  if (!selectedPhase) {
    return null;
  }

  return (
    <>
      {/* Overview Panel */}
      <FramePanel className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate font-medium text-sm">{selectedPhase.name}</h3>
          <StatusBadge status={selectedPhase.type} />
        </div>

        {selectedPhase.startDate ? (
          <time className="text-muted-foreground text-xs">
            {formatDate(selectedPhase.startDate)}
            {selectedPhase.endDate && ` – ${formatDate(selectedPhase.endDate)}`}
          </time>
        ) : null}
      </FramePanel>

      {/* Breakdown Panel */}
      <FramePanel className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <StatusBreakdownSection
          colors={[
            TASK_LEGEND[0].statusColor,
            TASK_LEGEND[1].statusColor,
            TASK_LEGEND[2].statusColor,
            TASK_LEGEND[3].statusColor,
          ]}
          counts={[
            taskCounts.done,
            taskCounts.inProgress,
            taskCounts.blocked,
            taskCounts.todo,
          ]}
          items={TASK_LEGEND}
          title="Tasks"
          total={taskCounts.total}
          values={[
            taskCounts.done,
            taskCounts.inProgress,
            taskCounts.blocked,
            taskCounts.todo,
          ]}
        />
        {/* </FramePanel>
      <FramePanel> */}
        <StatusBreakdownSection
          colors={[
            DELIVERABLE_LEGEND[0].statusColor,
            DELIVERABLE_LEGEND[1].statusColor,
            DELIVERABLE_LEGEND[2].statusColor,
            DELIVERABLE_LEGEND[3].statusColor,
          ]}
          counts={[
            deliverableCounts.completed,
            deliverableCounts.inProgress,
            deliverableCounts.review,
            deliverableCounts.notStarted,
          ]}
          items={DELIVERABLE_LEGEND}
          title="Deliverables"
          total={deliverableCounts.total}
          values={[
            deliverableCounts.completed,
            deliverableCounts.inProgress,
            deliverableCounts.review,
            deliverableCounts.notStarted,
          ]}
        />
      </FramePanel>
    </>
  );
}
