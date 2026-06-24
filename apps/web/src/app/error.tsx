"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/ui/error-state";

export default function RootSegmentError({
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="inline-block mb-6">
          <h1 className="text-2xl font-bold text-brand-700">BookEase</h1>
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <ErrorState
            title="Something went wrong"
            description="We hit an unexpected error loading this page. Try again or head back home."
            onRetry={reset}
          />
        </div>
        <Link href="/" className="inline-block mt-4 text-sm text-brand-600 hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
