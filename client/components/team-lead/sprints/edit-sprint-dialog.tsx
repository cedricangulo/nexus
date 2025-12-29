"use client";

import { useState } from "react";
import { updateSprintAction } from "@/actions/sprint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Sprint } from "@/lib/types";

type EditSprintDialogProps = {
  sprint: Sprint;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditSprintDialog({
  sprint,
  isOpen,
  onOpenChange,
}: EditSprintDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    goal: sprint.goal || "",
    startDate: sprint.startDate.split("T")[0],
    endDate: sprint.endDate.split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateSprintAction({
        id: sprint.id,
        ...formData,
      });

      if (result.success) {
        onOpenChange(false);
      } else {
        alert(result.error || "Failed to update sprint");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Sprint {sprint.number}</DialogTitle>
          <DialogDescription>
            Update the sprint goal and timeline
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Textarea
              className="min-h-24"
              id="goal"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, goal: e.target.value }))
              }
              placeholder="Sprint goal"
              value={formData.goal}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                type="date"
                value={formData.startDate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                type="date"
                value={formData.endDate}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
