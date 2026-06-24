import { ListPageSkeleton } from "@/components/ui/list-page-skeleton";

export default function BookingsLoading() {
  return <ListPageSkeleton columns={6} showSearch={false} label="Loading bookings" />;
}
