import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeliverableDetailSkeleton } from "@/components/layouts/loading";
import CommentSection from "@/components/shared/deliverables/comment-section";
import DeliverableActions from "@/components/shared/deliverables/deliverables-details/actions";
import { getDeliverableDetail } from "@/lib/data/deliverables";
import { getAuthContext } from "@/lib/helpers/auth-token";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberDeliverableDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const { user, token } = await getAuthContext();

  const deliverableDetail = await getDeliverableDetail(id, token);

  if (!(deliverableDetail.deliverable && user)) {
    notFound();
  }

  return (
    <Suspense fallback={<DeliverableDetailSkeleton />}>
      <DeliverableActions
        {...deliverableDetail}
        commentSection={
          <CommentSection
            comments={deliverableDetail.comments}
            deliverable={deliverableDetail.deliverable}
          />
        }
      />
    </Suspense>
  );
}
