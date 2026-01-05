import { Spinner } from "@/components/ui/spinner";

export function AuthLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-8" />
        <div className="text-center">
          <p className="font-medium text-foreground text-sm">Loading</p>
          <p className="text-muted-foreground text-xs">Please wait...</p>
        </div>
      </div>
    </div>
  );
}
