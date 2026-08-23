import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function PublicLoading() {
  return (
    <div className="min-h-[60vh] max-w-7xl mx-auto px-6 pt-28 pb-16">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-6 h-10 w-2/3 md:h-14" />
      <Skeleton className="mt-4 h-4 w-1/2" />
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
