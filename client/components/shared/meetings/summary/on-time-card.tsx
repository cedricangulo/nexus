import { Clock } from "lucide-react";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Progress } from "@/components/ui/progress";
import { getOnTimeData } from "@/lib/data/meetings";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { meetingSearchParamsCache } from "@/lib/types/search-params";

type OnTimeProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * OnTime Data Component
 * Fetches and displays on-time percentage of meetings
 */
export async function OnTime({ searchParams }: OnTimeProps) {
  const { token } = await getAuthContext();
  const filters = meetingSearchParamsCache.parse(searchParams);
  const onTime = await getOnTimeData(token, filters);

  return (
    <div className="flex items-center gap-4">
      <p className="font-bold font-sora text-3xl">{onTime.percentage}%</p>
      <div className="w-full">
        <Progress className="mb-2 h-2" value={onTime.percentage} />
        <FrameDescription className="line-clamp-1 text-xs">
          {onTime.onTime} of {onTime.total}
        </FrameDescription>
      </div>
    </div>
  );
}

/**
 * OnTimeCard Wrapper Component
 * Provides the card UI shell for on-time data
 */
export async function OnTimeCard({ children }: { children?: React.ReactNode }) {
  "use cache";

  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <FrameTitle className="text-sm">On-Time</FrameTitle>
        {/* <div className="rounded-md bg-scrum p-2">
        </div>
        <div className="space-y-0">
          <FrameDescription className="line-clamp-1 text-xs">
            documented on time
          </FrameDescription>
        </div> */}
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
