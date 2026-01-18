import { TriangleAlert } from "lucide-react";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getOverdueDeliverablesCount } from "@/lib/data/deliverables";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { searchParamsCache } from "@/lib/types/search-params";

type OverdueDeliverablesCardProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function Overdue({ searchParams }: OverdueDeliverablesCardProps) {
  const { token } = await getAuthContext();
  const filters = searchParamsCache.parse(await searchParams);
  const overdue = await getOverdueDeliverablesCount(token, filters);

  return (
    <p className="font-bold text-3xl">{overdue}</p>
  );
}

export async function OverdueCard({ children }: { children?: React.ReactNode }) {
  "use cache"

  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <div className="rounded-md bg-error/70 p-2">
          <TriangleAlert className="size-4 text-error-foreground" />
        </div>
        <div className="space-y-0">
          <FrameTitle className="text-sm">Overdue</FrameTitle>
          <FrameDescription className="text-xs">
            Action needed
          </FrameDescription>
        </div>
      </FrameHeader>
      <FramePanel>
        {children}
      </FramePanel>
    </Frame>
  );
}
