import { Deliverable } from "@/lib/types";
import { EmptyState } from "@/components/shared/empty-state";
import { FileIcon } from "lucide-react";
import { formatRelativeTime } from "@/lib/helpers/format-date";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getEvidenceByDeliverable } from "@/lib/data/deliverables";

type Props = {
  deliverable: Deliverable;
  token: string;
}

export default async function Evidence({ deliverable, token }: Props) {
  "use cache";

  const evidence = await getEvidenceByDeliverable(deliverable.id, token)

  return (
    <>
      <div className="space-y-2 lg:col-span-5">
        <h3 className="font-semibold text-foreground text-sm">Evidence Files</h3>
        {evidence.length === 0 ? (
          <EmptyState
            description=""
            icon={FileIcon}
            title="No evidence uploaded yet."
          />
        ) : (
          <div className="space-y-2">
            {evidence.map((item) => (
              <div
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2"
                key={item.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{item.fileName}</p>
                  <p className="text-muted-foreground text-xs">
                    Uploaded {formatRelativeTime(item.createdAt)}
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                >
                  <Link
                    href={item.fileUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    View
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}