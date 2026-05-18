import React, { useState } from "react";

const MEDAL = ["🥇", "🥈", "🥉"];

const CARD_BG = [
  "bg-amber-50  border-amber-200  text-amber-700",
  "bg-slate-50  border-slate-200  text-slate-600",
  "bg-orange-50 border-orange-200 text-orange-700",
];

export default function WeeklyLeaderboard({ weeks, defaultCount = 3 }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? weeks : weeks.slice(0, defaultCount);

  return (
    <div className="space-y-3">
      {visible.map((w, ix) => (
        <div key={ix} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-sky-50 border-b border-sky-100">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {w.week}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {w.data.length === 0 ? (
              <div className="col-span-3 px-4 py-4 text-sm text-slate-400 text-center">No solves this week.</div>
            ) : w.data.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-9 h-9 rounded-xl border flex flex-col items-center justify-center shrink-0 ${CARD_BG[i]}`}>
                  <span className="text-base leading-none">{MEDAL[i]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{s.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{s.roll}</p>
                </div>
                <span className="text-sm font-bold text-teal-600 shrink-0">{s.solved}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {weeks.length > defaultCount && (
        <div className="flex justify-center pt-1">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {showAll ? "Show less" : `View all ${weeks.length} weeks`}
          </button>
        </div>
      )}
    </div>
  );
}
