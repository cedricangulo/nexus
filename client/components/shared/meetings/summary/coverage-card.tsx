import { CheckCircle2 } from "lucide-react";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Progress } from "@/components/ui/progress";
import { getCoverageData } from "@/lib/data/meetings";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { meetingSearchParamsCache } from "@/lib/types/search-params";

type CoverageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * Coverage Data Component
 * Fetches and displays coverage percentage of meetings
 */
export async function Coverage({ searchParams }: CoverageProps) {
  const { token } = await getAuthContext();
  const filters = meetingSearchParamsCache.parse(searchParams);
  const coverage = await getCoverageData(token, filters);

  return (
    <div className="flex items-center gap-4">
      <p className="font-bold font-sora text-3xl">{coverage.percentage}%</p>
      <div className="w-full">
        <Progress className="mb-2 h-2" value={coverage.percentage} />
        <FrameDescription className="line-clamp-1 text-xs">
          {coverage.covered} of {coverage.total}
        </FrameDescription>
      </div>
    </div>
  );
}

/**
 * CoverageCard Wrapper Component
 * Provides the card UI shell for coverage data
 */
export async function CoverageCard({ children }: { children?: React.ReactNode }) {
  "use cache";

  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <div className="rounded-md bg-success p-2">
          <CheckCircle2 className="size-4 text-success-foreground" />
        </div>
        <div className="space-y-0">
          <FrameTitle className="text-sm">Coverage</FrameTitle>
          <FrameDescription className="line-clamp-1 text-xs">
            sprints/phases
          </FrameDescription>
        </div>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
