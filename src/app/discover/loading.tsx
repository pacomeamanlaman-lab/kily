import Skeleton from "@/components/ui/Skeleton";

export default function DiscoverLoading() {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-40 bg-black backdrop-blur-lg border-b border-white/10 px-4 sm:px-6 lg:px-8 pt-20 pb-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Skeleton width="300px" height="48px" className="mb-2" />
            <Skeleton width="150px" height="20px" />
          </div>

          {/* Search bar skeleton */}
          <div className="flex gap-3">
            <Skeleton className="flex-1 h-12" />
            <Skeleton width="48px" height="48px" />
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              <Skeleton height="256px" className="rounded-none" />
              <div className="p-6">
                <Skeleton width="120px" height="20px" className="mb-3" />
                <Skeleton width="80px" height="16px" className="mb-3" />
                <Skeleton width="150px" height="16px" className="mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton width="60px" height="16px" />
                  <Skeleton width="90px" height="36px" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
