export default function HistoryLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-5 w-28 bg-muted rounded-lg" />
        <div className="h-3 w-16 bg-muted rounded-lg mt-2" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 bg-muted rounded-lg" />
      ))}
    </div>
  );
}
