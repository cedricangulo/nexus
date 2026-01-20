import { FileText } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getTotalMeetingsData } from "@/lib/data/meetings";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { meetingSearchParamsCache } from "@/lib/types/search-params";

type TotalMeetingsProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * TotalMeetings Data Component
 * Fetches and displays total count of filtered meetings
 */
export async function TotalMeetings({ searchParams }: TotalMeetingsProps) {
  const { token } = await getAuthContext();
  const filters = meetingSearchParamsCache.parse(searchParams);
  const total = await getTotalMeetingsData(token, filters);

  return <div className="font-bold font-sora text-3xl">{total}</div>;
}

/**
 * TotalMeetingsCard Wrapper Component
 * Provides the card UI shell for total meetings data
 */
export async function TotalMeetingsCard({
  children,
}: {
  children?: React.ReactNode;
}) {
  "use cache";

  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <FileText className="size-4 text-muted-foreground" />
        <FrameTitle className="text-sm">Total</FrameTitle>
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
