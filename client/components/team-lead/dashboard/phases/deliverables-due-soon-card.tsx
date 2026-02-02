import { Calendar } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getDeliverables } from "@/lib/data/deliverables";
import { getPhases } from "@/lib/data/phases";

export async function DeliverablesDueSoon({ token }: { token: string }) {
  "use cache";
  cacheLife("minutes");
  cacheTag("deliverables", "phases");

  const [deliverables, phases] = await Promise.all([
    getDeliverables(token),
    getPhases(token),
  ]);

  // Calculate deliverables due within 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const dueSoonDeliverables = deliverables.filter((d) => {
    if (d.status === "COMPLETED" || !d.dueDate || d.deletedAt) {
      return false;
    }
    const dueDate = new Date(d.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate >= today && dueDate <= sevenDaysFromNow;
  });

  // Group by phase
  const groupedByPhase = dueSoonDeliverables.reduce(
    (acc, d) => {
      const phase = phases.find((p) => p.id === d.phaseId);
      const phaseName = phase?.name || "Unknown";
      acc[phaseName] = (acc[phaseName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalCount = dueSoonDeliverables.length;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <h4 className="font-bold font-sora text-3xl tabular-nums">
          {totalCount}
        </h4>
        <p className="text-muted-foreground text-xs">Due Soon</p>
      </div>
      {totalCount > 0 && (
        <div className="space-y-1 text-xs">
          {Object.entries(groupedByPhase).map(([phase, count]) => (
            <p className="text-muted-foreground" key={phase}>
              {phase}: {count}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function DeliverablesDueSoonCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <Calendar aria-hidden="true" className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Deliverables Due This Week
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
