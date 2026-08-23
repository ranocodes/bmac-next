import { Skeleton } from "@/components/ui/Skeleton";

export default function EventsLoading() {
  return (
    <div className="min-h-[60vh] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <div className="border border-border rounded-lg divide-y divide-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-none border-0" />
        ))}
      </div>
    </div>
  );
}
