export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] skeleton-shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-4 rounded w-3/4 skeleton-shimmer" />
        <div className="h-3 rounded w-full skeleton-shimmer" />
        <div className="h-3 rounded w-2/3 skeleton-shimmer" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 rounded w-16 skeleton-shimmer" />
          <div className="h-7 rounded w-16 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

