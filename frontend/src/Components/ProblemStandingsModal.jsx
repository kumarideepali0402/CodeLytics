import { X, ExternalLink, Check } from "lucide-react";
import { displayPlatform, platformStyleClass } from "../utils/problemDisplay";

function difficultyBadge(difficulty) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums";
  if (difficulty === "Easy") return `${base} bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80`;
  if (difficulty === "Medium") return `${base} bg-amber-50 text-amber-900 ring-1 ring-amber-200/80`;
  return `${base} bg-rose-50 text-rose-800 ring-1 ring-rose-200/80`;
}

export default function ProblemStandingsModal({ standingsModal, setStandingsModal }) {
  if (!standingsModal) return null;

  const solvers    = standingsModal.cell?.solvers    ?? [];
  const nonSolvers = standingsModal.cell?.nonSolvers ?? [];
  const allRows = [
    ...solvers.map((s) => ({ ...s, solved: true })),
    ...nonSolvers.map((s) => ({ ...s, solved: false })),
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="standings-modal-title"
    >
      <div className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 shrink-0">
          <div className="min-w-0">
            <h2 id="standings-modal-title" className="text-lg font-bold text-slate-900">
              Who solved this?
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {standingsModal.problem.name}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={platformStyleClass(displayPlatform(standingsModal.problem))}>
                {displayPlatform(standingsModal.problem)}
              </span>
              <span className={difficultyBadge(standingsModal.problem.difficulty)}>
                {standingsModal.problem.difficulty}
              </span>
              <a
                href={standingsModal.problem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
              >
                Open problem
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStandingsModal(null)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Table */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-[#fbfbfd]">
            <table className="w-full border-collapse text-[11px] leading-tight text-slate-900">
              <thead>
                <tr className="border-b border-slate-300 bg-[#e8edf5]">
                  <th className="border-r border-slate-300 px-3 py-2 text-left font-bold text-slate-800">Student</th>
                  <th className="w-16 px-2 py-2 text-center font-bold text-slate-800">Status</th>
                </tr>
              </thead>
              <tbody>
                {allRows.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-3 py-8 text-center text-slate-400">No students in this batch.</td>
                  </tr>
                ) : allRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-200 odd:bg-white even:bg-[#f8f9fa]">
                    <td className="border-r border-slate-200 px-3 py-2">
                      <span className={row.solved ? "font-semibold text-slate-700" : "text-slate-400"}>
                        {row.name}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      {row.solved
                        ? <Check className="mx-auto h-3.5 w-3.5 text-emerald-600" strokeWidth={2.75} />
                        : <span className="text-slate-300 font-mono">·</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-300 bg-[#eef2f8]">
                  <td className="border-r border-slate-200 px-3 py-1.5 text-left font-bold text-slate-800">
                    Total Solved
                  </td>
                  <td className="px-2 py-1.5 text-center font-mono font-semibold text-slate-800">
                    {solvers.length}/{solvers.length + nonSolvers.length}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
