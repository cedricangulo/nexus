"use client";

import { parseAsString, useQueryState } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PhaseDetail } from "@/lib/types";

interface PhaseSelectorProps {
  phases: PhaseDetail[];
}

export function PhaseSelector({ phases }: PhaseSelectorProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useQueryState(
    "selectedPhase",
    parseAsString.withDefault(phases[0]?.id ?? "")
  );

  if (phases.length === 0) {
    return null;
  }

  return (
    <Select onValueChange={setSelectedPhaseId} value={selectedPhaseId}>
      <SelectTrigger className="w-fit text-xs">
        <SelectValue placeholder="Select phase" />
      </SelectTrigger>
      <SelectContent>
        {phases.map((phase) => (
          <SelectItem key={phase.id} value={phase.id}>
            {phase.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
