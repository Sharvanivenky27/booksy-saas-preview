import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center justify-center px-4 py-16 text-center", className)}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-5 w-5 text-red-500" />
      </div>
      <p className="mt-3 text-sm font-medium text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>
      {onRetry && (
        <div className="mt-4">
          <Button onClick={onRetry}>Try again</Button>
        </div>
      )}
    </div>
  );
}
