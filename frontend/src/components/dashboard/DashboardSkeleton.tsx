export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-7 w-48 bg-slate-200 rounded-xl" />
        <div className="h-3 w-32 bg-slate-100 rounded-lg mt-2" />
      </div>

      {/* Score + stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-56 bg-white border border-slate-200 rounded-xl shadow-sm" />
        <div className="h-32 bg-white border border-slate-200 rounded-xl shadow-sm" />
        <div className="h-32 bg-white border border-slate-200 rounded-xl shadow-sm" />
        <div className="h-32 bg-white border border-slate-200 rounded-xl shadow-sm" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-72 bg-white border border-slate-200 rounded-xl shadow-sm" />
        <div className="h-72 bg-white border border-slate-200 rounded-xl shadow-sm" />
      </div>

      {/* Evidence matrix */}
      <div>
        <div className="h-5 w-36 bg-slate-200 rounded-lg mb-3" />
        <div className="h-[300px] bg-white border border-slate-200 rounded-xl shadow-sm" />
      </div>

      {/* Projects + Quick Wins */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-3">
          <div className="h-5 w-44 bg-slate-200 rounded-lg" />
          <div className="h-40 bg-white border border-slate-200 rounded-xl shadow-sm" />
          <div className="h-40 bg-white border border-slate-200 rounded-xl shadow-sm" />
        </div>
        <div className="lg:col-span-2">
          <div className="h-5 w-28 bg-slate-200 rounded-lg mb-3" />
          <div className="h-48 bg-white border border-slate-200 rounded-xl shadow-sm" />
        </div>
      </div>
    </div>
  );
}
