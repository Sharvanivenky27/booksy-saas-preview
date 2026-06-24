import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ListPageSkeletonProps {
  columns: number;
  rows?: number;
  showSearch?: boolean;
  label?: string;
}

export function ListPageSkeleton({
  columns,
  rows = 6,
  showSearch = true,
  label = "Loading",
}: ListPageSkeletonProps) {
  return (
    <div role="status" aria-label={label}>
      <span className="sr-only">{label}…</span>
      <div className="h-16 border-b border-gray-100 bg-white flex items-center px-4 sm:px-6 lg:px-8 flex-shrink-0">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          {showSearch ? <Skeleton className="h-9 w-full max-w-sm" /> : <div />}
          <Skeleton className="h-9 w-32 flex-shrink-0" />
        </div>
        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 flex gap-6">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-16" />
            ))}
          </div>
          <div className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="px-4 py-3.5 flex gap-6">
                {Array.from({ length: columns }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-20" />
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
