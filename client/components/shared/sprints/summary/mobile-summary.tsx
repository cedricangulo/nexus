import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Active } from "./active";
import { Total } from "./total";
import { Upcoming } from "./upcoming";
import { User } from "@/lib/types";
import { SprintFilters } from "@/lib/data/sprint";

export const SUMMARY_ITEMS = [
  { label: "Total", Component: Total, colorClass: "text-info-foreground" },
  {
    label: "Active",
    Component: Active,
    colorClass: "text-success-foreground",
  },
  {
    label: "Upcoming",
    Component: Upcoming,
    colorClass: "text-warning-foreground",
  },
] as const;

export function SummaryCardItem({
  label,
  Component,
  colorClass,
  filters,
  token,
  user,
}: {
  label: string;
  Component: React.ComponentType<{
    filters: SprintFilters;
    token: string;
    user: User;
  }>;
  colorClass: string;
  filters: SprintFilters;
  token: string;
  user: User;
}) {
  return (
    <div className={colorClass}>
      <Suspense fallback={<Skeleton className="mx-auto h-9 w-4" />}>
        <Component filters={filters} token={token} user={user} />
      </Suspense>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  );
}
