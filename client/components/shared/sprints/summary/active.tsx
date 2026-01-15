import { CircleDot } from "lucide-react";
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

type ActiveProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export async function Active({ searchParams }: ActiveProps) {
  const { user, token } = await getAuthContext();
  const filters = sprintSearchParamsCache.parse(searchParams);

  const sprints = await getFilteredSprints(token, user.role, filters);
  const now = new Date();

  const activeCount = sprints.filter(
    (sprint) => getSprintStatus(sprint, now) === "ACTIVE"
  ).length;

  return <h4 className="font-bold font-sora text-3xl">{activeCount}</h4>;
}

export async function ActiveCard({ children }: { children: React.ReactNode }) {
  "use cache";

  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <div className="rounded-md bg-success p-2">
          <CircleDot className="size-4 text-success-foreground" />
        </div>
        <FrameTitle>Active</FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
