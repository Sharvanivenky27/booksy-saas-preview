import { ListPageSkeleton } from "@/components/ui/list-page-skeleton";

export default function ServicesLoading() {
  return <ListPageSkeleton columns={6} label="Loading services" />;
}
