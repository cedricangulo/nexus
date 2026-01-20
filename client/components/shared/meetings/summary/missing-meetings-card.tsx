import { AlertCircle } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getMissingMeetingsData } from "@/lib/data/meetings";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { meetingSearchParamsCache } from "@/lib/types/search-params";

type MissingMeetingsProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * MissingMeetings Data Component
 * Fetches and displays missing meetings data
 */
export async function MissingMeetings({ searchParams }: MissingMeetingsProps) {
  const { token } = await getAuthContext();
  const filters = meetingSearchParamsCache.parse(searchParams);
  const missing = await getMissingMeetingsData(token, filters);

  return (
    <div className="flex items-center gap-2">
      <p className="font-bold font-sora text-3xl">{missing.count}</p>
      <p className="grid text-muted-foreground text-xs">
        {missing.sprints.length > 0 && (
          <>
            {missing.sprints.length} sprint
            {missing.sprints.length !== 1 ? "s" : ""}
            {missing.phases.length > 0 && " and "}
          </>
        )}{" "}
        {missing.phases.length > 0 && (
          <>
            {missing.phases.length} phase
            {missing.phases.length !== 1 ? "s" : ""}
          </>
        )}
        <span>{missing.count > 0 && " without meetings"}</span>
      </p>
    </div>
  );
}

/**
 * MissingMeetingsCard Wrapper Component
 * Provides the card UI shell for missing meetings data
 * Note: Icon color is static; use client wrapper if dynamic styling needed
 */
export async function MissingMeetingsCard({
  children,
}: {
  children?: React.ReactNode;
}) {
  "use cache";

  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <AlertCircle className="size-4 text-muted-foreground" />
        <FrameTitle className="text-sm">Missing</FrameTitle>
        {/* <div className="rounded-md bg-info p-2">
        </div>
        <div className="space-y-0">
          <FrameDescription className="text-xs">Meetings</FrameDescription>
        </div> */}
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
