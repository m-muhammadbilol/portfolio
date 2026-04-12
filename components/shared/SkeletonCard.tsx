export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border overflow-hidden animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 bg-muted rounded-full w-12" />
          <div className="h-5 bg-muted rounded-full w-16" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 bg-muted rounded ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  )
}
