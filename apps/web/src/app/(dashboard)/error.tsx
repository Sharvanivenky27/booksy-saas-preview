"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function DashboardSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <ErrorState
        title="Couldn't load this page"
        description="Something went wrong while loading this data. Try again, or come back in a moment."
        onRetry={reset}
      />
    </div>
  );
}
