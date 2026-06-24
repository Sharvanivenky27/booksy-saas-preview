import { ListPageSkeleton } from "@/components/ui/list-page-skeleton";

export default function LocationsLoading() {
  return <ListPageSkeleton columns={7} label="Loading locations" />;
}
