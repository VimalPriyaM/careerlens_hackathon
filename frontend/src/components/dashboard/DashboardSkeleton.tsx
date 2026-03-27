export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-5 w-32 bg-muted rounded-lg" />
        <div className="h-3 w-56 bg-muted rounded-lg mt-2" />
      </div>

      {/* Score cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 bg-muted rounded-lg" />
        ))}
      </div>

      {/* Evidence matrix */}
      <div className="h-[300px] bg-muted rounded-lg" />

      {/* Project cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-44 bg-muted rounded-lg" />
        <div className="h-44 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
