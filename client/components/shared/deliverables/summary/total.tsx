import { Blocks } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getTotalDeliverablesCount } from "@/lib/data/deliverables";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { searchParamsCache } from "@/lib/types/search-params";

type TotalDeliverablesCardProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function Total({ searchParams }: TotalDeliverablesCardProps) {
  const { token } = await getAuthContext();
  const filters = searchParamsCache.parse(await searchParams);
  const total = await getTotalDeliverablesCount(token, filters);

  return (
    <div className="font-bold font-sora text-3xl">{total}</div>
  );
}

export async function TotalCard({ children }: { children?: React.ReactNode }) {
  "use cache"

  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <div className="rounded-md bg-info p-2">
          <Blocks className="size-4 text-info-foreground" />
        </div>
        <FrameTitle>Total Deliverables</FrameTitle>
      </FrameHeader>
      <FramePanel>
        {children}
      </FramePanel>
    </Frame>
  );
}
