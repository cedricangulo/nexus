import PageHeaderContainer from "@/components/adviser/phase-details/page-header";
import PhaseDeliverablesList from "@/components/adviser/phase-details/phase-deliverables-list";
import PhaseMeetingsList from "@/components/adviser/phase-details/phase-meetings-list";
import PhaseTasksList from "@/components/adviser/phase-details/phase-tasks-list";
import Boundary from "@/components/internal/Boundary";
import { Button } from "@/components/ui/button";
import { Frame, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function PhaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  return (
		<Boundary
			rendering="dynamic"
			hydration="server"
		>
      <div className="space-y-8">
        <Button asChild variant="ghost">
          <Link href="/phases">
            <ChevronLeftIcon />
            Back to Phases
          </Link>
        </Button>
        <Boundary
          rendering="static"
          hydration="server"
          cached
        >
          {/* Page Header */}
          <PageHeaderContainer phaseId={id} />
        </Boundary>
        {/* List Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Suspense fallback={<CardSkeleton />}>
            <PhaseTasksList phaseId={id} />
          </Suspense>
          <Suspense fallback={<CardSkeleton />}>
            <PhaseDeliverablesList phaseId={id} />
          </Suspense>
          <Suspense fallback={<CardSkeleton />}>
            <PhaseMeetingsList phaseId={id} />
          </Suspense>
        </div>
      </div>
		</Boundary>
	);
}

function CardSkeleton() {
  return (
    // <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
    //   {[1,2,3,].map((_, i) => (
    <Frame>
      <FrameHeader className="flex-row items-center justify-between gap-2">
        <FrameTitle>
          <Skeleton className="h-5 w-32" />
        </FrameTitle>
        {/* <Skeleton className="h-8 w-16" /> */}
      </FrameHeader>
      <FramePanel className="space-y-2 p-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </FramePanel>
    </Frame>
    //   ))}
    // </div>
  )
}
