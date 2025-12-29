"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export type PendingActionToastConfig = {
  title: string;
  description: string;
  onTimeout: () => Promise<void> | void;
  onCancel: () => void;
  duration?: number;
};

function PendingActionToastContent({
  config,
  toastId,
  onClose,
}: {
  config: PendingActionToastConfig;
  toastId: string | number;
  onClose: () => void;
}) {
  const [progress, setProgress] = useState(100);
  const [isCancelled, setIsCancelled] = useState(false);
  const duration = config.duration || 5000;

  useEffect(() => {
    if (isCancelled) {
      return;
    }

    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const progressPercent = (remaining / duration) * 100;
      setProgress(progressPercent);

      if (remaining <= 0) {
        clearInterval(interval);
        // Execute the action after countdown expires
        config.onTimeout();
        onClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, config, isCancelled, onClose]);

  const handleCancel = () => {
    setIsCancelled(true);
    config.onCancel();
    toast.dismiss(toastId);
  };

  return (
    <div className="flex w-full gap-3 overflow-hidden rounded-lg rounded-b-none border border-amber-200 bg-amber-50 p-4 shadow-lg dark:border-amber-800 dark:bg-amber-950">
      <div className="flex grow flex-col gap-2">
        <div className="space-y-1">
          <p className="font-semibold">{config.title}</p>
          <p className="text-sm">{config.description}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCancel} size="sm" variant="outline">
            Cancel
          </Button>
        </div>
      </div>
      <div className="flex shrink-0 items-start gap-1">
        <button
          aria-label="Close notification"
          className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          onClick={handleCancel}
          type="button"
        >
          <svg
            aria-label="Close"
            className="size-4"
            fill="none"
            role="img"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-amber-100 dark:bg-amber-900">
        <div
          className="h-full bg-amber-500 transition-all dark:bg-amber-400"
          style={{
            width: `${progress}%`,
            transitionDuration: "50ms",
          }}
        />
      </div>
    </div>
  );
}

export function showPendingActionToast(config: PendingActionToastConfig) {
  const duration = config.duration || 10_000;

  toast.custom(
    (id) => (
      <PendingActionToastContent
        config={config}
        onClose={() => {
          toast.dismiss(id);
        }}
        toastId={id}
      />
    ),
    {
      duration,
      position: "top-right",
    }
  );
}
