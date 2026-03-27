export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] -mx-4 -mt-2 sm:-mx-6 animate-pulse">
      {/* Sidebar skeleton */}
      <div className="w-72 flex-shrink-0 border-r border-slate-200 bg-white">
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="h-4 w-28 bg-muted rounded-lg" />
        </div>
        <div className="p-3 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
      {/* Chat area skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="h-4 w-40 bg-muted rounded-lg" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          <div className="h-10 w-3/4 bg-muted rounded-lg" />
          <div className="h-10 w-1/2 bg-muted rounded-lg ml-auto" />
          <div className="h-10 w-2/3 bg-muted rounded-lg" />
        </div>
        <div className="p-4 border-t border-slate-200">
          <div className="h-10 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}
