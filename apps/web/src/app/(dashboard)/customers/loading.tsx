import { ListPageSkeleton } from "@/components/ui/list-page-skeleton";

export default function CustomersLoading() {
  return <ListPageSkeleton columns={5} label="Loading customers" />;
}
