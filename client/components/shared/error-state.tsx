import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
};

export function ErrorState({
  title = "Unable to load data",
  message = "We encountered an issue loading this information. Please try again or contact support if the problem persists.",
  onRetry,
  showRetry = false,
}: ErrorStateProps) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle className="text-destructive" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      {showRetry && onRetry ? (
        <EmptyContent>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw size={16} />
            Try Again
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
