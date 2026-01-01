// TODO: Use next buttons and show only the current phase rather than using tabs

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { savePhaseDeliverables } from "@/actions/phase-deliverables";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PhaseDetail, PhaseType } from "@/lib/types";
import {
  type MethodologyInput,
  methodologySchema,
} from "@/lib/validation/project-config";
import PhaseFields from "./phase-field";

export type PhaseKey = keyof MethodologyInput["phases"];

export type DeliverableDialogValues = {
  title: string;
  description?: string;
  dueDate?: string;
};

export const emptyDeliverable: DeliverableDialogValues = {
  title: "",
  description: "",
  dueDate: "",
};

const phaseTypeMap: Record<PhaseType, PhaseKey> = {
  WATERFALL: "waterfall",
  SCRUM: "scrum",
  FALL: "fall",
};

type MethodologyProps = {
  phases: PhaseDetail[];
};

export default function Methodology({ phases }: MethodologyProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<PhaseKey>("waterfall");
  const [isEditingDeliverable, setIsEditingDeliverable] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Initialize form with server-fetched data
  const methodologyData: MethodologyInput = {
    phases: {
      waterfall: {
        title: "",
        description: "",
        dateRange: { start: "", end: "" },
        deliverables: [],
      },
      scrum: {
        title: "",
        description: "",
        dateRange: { start: "", end: "" },
        deliverables: [],
      },
      fall: {
        title: "",
        description: "",
        dateRange: { start: "", end: "" },
        deliverables: [],
      },
    },
  };

  // Populate phases with fetched data
  for (const phase of phases) {
    const phaseKey = phaseTypeMap[phase.type];
    const startDate = phase.startDate
      ? new Date(phase.startDate).toISOString().split("T")[0]
      : "";
    const endDate = phase.endDate
      ? new Date(phase.endDate).toISOString().split("T")[0]
      : "";

    methodologyData.phases[phaseKey] = {
      title: phase.name,
      description: phase.description || "",
      dateRange: { start: startDate, end: endDate },
      deliverables: (phase.deliverables || []).map((deliverable) => ({
        title: deliverable.title,
        description: deliverable.description || "",
        dueDate: deliverable.dueDate
          ? new Date(deliverable.dueDate).toISOString().split("T")[0]
          : "",
        deletedAt: deliverable.deletedAt || "",
      })),
    };
  }

  const form = useForm<MethodologyInput>({
    resolver: zodResolver(methodologySchema),
    mode: "onChange",
    defaultValues: methodologyData,
  });

  const isTabLocked =
    isPending || form.formState.isDirty || isEditingDeliverable;

  const _getActivePhaseValues = () => form.getValues().phases[activePhase];

  function onSubmit(values: MethodologyInput) {
    setFormError(null);

    startTransition(async () => {
      const toastId = toast.loading("Saving phase...");
      try {
        const phaseData = values.phases[activePhase];

        // Skip if phase is empty
        if (!(phaseData.title && phaseData.description)) {
          toast.dismiss(toastId);
          const errorMsg =
            "Complete all required fields in the phase configuration";
          setFormError(errorMsg);
          toast.error(errorMsg);
          return;
        }

        const result = await savePhaseDeliverables({
          phaseKey: activePhase,
          phaseData,
        });

        if (!result.success) {
          const errorMessage =
            result.error || "Failed to save phase deliverables";
          toast.dismiss(toastId);
          setFormError(errorMessage);
          toast.error(errorMessage);
          return;
        }

        // Reset form on successful save
        form.reset(form.getValues());
        setFormError(null);
        toast.dismiss(toastId);
        toast.success(
          `${activePhase.charAt(0).toUpperCase() + activePhase.slice(1)} phase saved successfully`
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to save phase";
        toast.dismiss(toastId);
        setFormError(message);
        toast.error(message);
      }
    });
  }

  const handleSaveClick = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const values = form.getValues();
    onSubmit(values);
  };

  return (
    <div>
      <Frame stackedPanels>
        <FrameHeader className="p-4">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
            <div className="space-y-2">
              <FrameTitle>Methodology</FrameTitle>
              <FrameDescription>
                Configure phase-specific information.
              </FrameDescription>
            </div>
            <Tabs
              onValueChange={(next) => {
                if (isTabLocked) {
                  setFormError("Save changes before switching phases");
                  toast.error("Save changes before switching phases");
                  return;
                }

                setFormError(null);
                setActivePhase(next as PhaseKey);
              }}
              value={activePhase}
            >
              <TabsList className="w-full lg:w-fit">
                <TabsTrigger
                  disabled={isTabLocked && activePhase !== "waterfall"}
                  value="waterfall"
                >
                  Waterfall Phase
                </TabsTrigger>
                <TabsTrigger
                  disabled={isTabLocked && activePhase !== "scrum"}
                  value="scrum"
                >
                  Scrum Phase
                </TabsTrigger>
                <TabsTrigger
                  disabled={isTabLocked && activePhase !== "fall"}
                  value="fall"
                >
                  Fall Phase
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </FrameHeader>

        <FramePanel>
          <Tabs
            onValueChange={(next) => {
              if (isTabLocked) {
                setFormError("Save changes before switching phases");
                toast.error("Save changes before switching phases");
                return;
              }

              setFormError(null);
              setActivePhase(next as PhaseKey);
            }}
            value={activePhase}
          >
            <TabsContent value="waterfall">
              <PhaseFields
                control={form.control}
                getPhaseValues={() => form.getValues().phases.waterfall}
                isPending={isPending}
                onDialogOpenChange={setIsEditingDeliverable}
                phaseKey="waterfall"
              />
            </TabsContent>
            <TabsContent value="scrum">
              <PhaseFields
                control={form.control}
                getPhaseValues={() => form.getValues().phases.scrum}
                isPending={isPending}
                onDialogOpenChange={setIsEditingDeliverable}
                phaseKey="scrum"
              />
            </TabsContent>
            <TabsContent value="fall">
              <PhaseFields
                control={form.control}
                getPhaseValues={() => form.getValues().phases.fall}
                isPending={isPending}
                onDialogOpenChange={setIsEditingDeliverable}
                phaseKey="fall"
              />
            </TabsContent>
          </Tabs>
        </FramePanel>

        <FrameFooter className="flex-row justify-end gap-2">
          {formError ? (
            <FieldError className="sr-only">{formError}</FieldError>
          ) : null}
          <Button
            className="w-fit"
            disabled={isPending}
            onClick={handleSaveClick}
            variant="secondary"
          >
            {isPending ? (
              <>
                <Spinner /> Saving
              </>
            ) : (
              <>
                <Save /> Save Changes
              </>
            )}
          </Button>
        </FrameFooter>
      </Frame>
    </div>
  );
}
