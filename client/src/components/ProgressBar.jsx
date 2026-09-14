export default function ProgressBar({ percent = 0, label }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs text-ink-400">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink/5">
        <div className="h-full rounded-full bg-ember transition-all" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
