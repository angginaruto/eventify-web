// src/components/EventCardSkeleton.tsx
export default function EventCardSkeleton() {
  // rangka event card
  return (
    <div className="bg-[#12121e] rounded-2xl border border-white/10 overflow-hidden animate-pulse">
      <div className="aspect-video bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/5 rounded w-1/3" />
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
        <div className="flex justify-between">
          <div className="h-5 bg-white/5 rounded w-1/4" />
          <div className="h-5 bg-white/5 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}