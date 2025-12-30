import Skeleton from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header Skeleton */}
      <div className="relative h-96 sm:h-80 overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Avatar and name */}
            <div className="flex items-start gap-6 -mt-16 mb-8">
              <Skeleton variant="circular" width="128px" height="128px" />
              <div className="pt-20 flex-1">
                <Skeleton width="200px" height="36px" className="mb-2" />
                <Skeleton width="180px" height="20px" className="mb-4" />
                <Skeleton width="100%" height="60px" />
              </div>
            </div>

            {/* Bio */}
            <div className="mb-8">
              <Skeleton width="150px" height="28px" className="mb-4" />
              <Skeleton width="100%" height="20px" className="mb-2" />
              <Skeleton width="90%" height="20px" className="mb-2" />
              <Skeleton width="80%" height="20px" />
            </div>

            {/* Skills */}
            <div className="mb-8">
              <Skeleton width="180px" height="28px" className="mb-4" />
              <div className="flex flex-wrap gap-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} width="120px" height="36px" />
                ))}
              </div>
            </div>

            {/* Portfolio */}
            <div className="mb-8">
              <Skeleton width="150px" height="28px" className="mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <Skeleton width="120px" height="28px" className="mb-4" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton variant="circular" width="48px" height="48px" />
                      <div className="flex-1">
                        <Skeleton width="120px" height="20px" className="mb-2" />
                        <Skeleton width="80px" height="16px" />
                      </div>
                    </div>
                    <Skeleton width="100%" height="60px" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Skeleton width="150px" height="24px" className="mb-4" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton width="100px" height="16px" />
                      <Skeleton width="60px" height="20px" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Skeleton width="120px" height="24px" className="mb-4" />
                <Skeleton width="100%" height="48px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
