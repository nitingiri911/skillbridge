// Signature visual: renders a match score as a filled "bridge" bar
// rather than a plain number, reinforcing the product's core idea.
export default function MatchBridge({ score }) {
  const pct = Math.max(0, Math.min(100, score || 0));
  const color = pct >= 70 ? 'bg-teal' : pct >= 40 ? 'bg-amber' : 'bg-slate-400';

  return (
    <div className="flex items-center gap-2 w-full max-w-[160px]">
      <div className="relative flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-ink font-display tabular-nums w-10 text-right">
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}
