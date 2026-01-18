import { CircleDashed } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getFilteredSprints } from "@/lib/data/sprint";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { getSprintStatus } from "@/lib/helpers/sprint";
import { sprintSearchParamsCache } from "@/lib/types/search-params";

type UpcomingProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export async function Upcoming({ searchParams }: UpcomingProps) {
  const { user, token } = await getAuthContext();
  const filters = sprintSearchParamsCache.parse(searchParams);

  const sprints = await getFilteredSprints(token, user.role, filters);
  const now = new Date();

  const upcomingCount = sprints.filter(
    (sprint) => getSprintStatus(sprint, now) === "PLANNED"
  ).length;

  return <h4 className="font-bold font-sora text-3xl">{upcomingCount}</h4>;
}

export async function UpcomingCard({
  children,
}: {
  children: React.ReactNode;
}) {
  "use cache";

  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <div className="rounded-md bg-warning p-2">
          <CircleDashed className="size-4 text-warning-foreground" />
        </div>
        <FrameTitle>Upcoming</FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
