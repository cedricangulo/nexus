import { Suspense } from "react";
import { DeliverableListSkeleton } from "@/components/layouts/loading";
import DeliverablesPage from "@/components/shared/deliverables/deliverables-page";

export const metadata = {
  title: "Deliverables",
  description: "View and manage your deliverable submissions",
};

export default function Page() {
  return (
    <Suspense fallback={<DeliverableListSkeleton />}>
      <DeliverablesPage />
    </Suspense>
  );
}
