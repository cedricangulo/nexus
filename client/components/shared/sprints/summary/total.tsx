import { IterationCcw } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getFilteredSprints } from "@/lib/data/sprint";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { sprintSearchParamsCache } from "@/lib/types/search-params";

type TotalProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export async function Total({ searchParams }: TotalProps) {
  const { user, token } = await getAuthContext();
  const filters = sprintSearchParamsCache.parse(searchParams);

  const sprints = await getFilteredSprints(token, user.role, filters);
  const total = sprints.length;

  return <h4 className="font-bold font-sora text-3xl">{total}</h4>;
}

export async function TotalCard({ children }: { children: React.ReactNode }) {
  "use cache";

  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <div className="rounded-md bg-info p-2">
          <IterationCcw className="size-4 text-info-foreground" />
        </div>
        <FrameTitle>Total</FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
