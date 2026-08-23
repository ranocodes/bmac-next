import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="min-h-[60vh] max-w-3xl p-6 space-y-6">
      <Skeleton className="h-8 w-44" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border border-border rounded-lg p-6 space-y-4">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-2/3 rounded-md" />
        </div>
      ))}
    </div>
  );
}
