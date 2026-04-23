import { X, ExternalLink } from "lucide-react";
import { displayPlatform, platformStyleClass } from "../utils/problemDisplay";

function difficultyBadge(difficulty) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums";
  if (difficulty === "Easy") return `${base} bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80`;
  if (difficulty === "Medium") return `${base} bg-amber-50 text-amber-900 ring-1 ring-amber-200/80`;
  return `${base} bg-rose-50 text-rose-800 ring-1 ring-rose-200/80`;
}

export default function ProblemStandingsModal({ standingsModal, setStandingsModal }) {
  if (!standingsModal) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="standings-modal-title"
    >
      <div className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <h2
              id="standings-modal-title"
              className="text-lg font-bold text-slate-900"
            >
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
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-4 py-3">
          <p className="mb-3 text-xs text-slate-500">
            Sample data — connect submissions API to show live results.
          </p>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                Solved ({standingsModal.cell?.solvers?.length ?? 0})
              </p>
              <ul className="space-y-1">
                {(standingsModal.cell?.solvers ?? []).map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-950 ring-1 ring-emerald-200/80"
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs font-semibold text-emerald-700">✓</span>
                  </li>
                ))}
                {!standingsModal.cell?.solvers?.length && (
                  <li className="text-sm text-slate-500">No one yet.</li>
                )}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Not solved ({standingsModal.cell?.nonSolvers?.length ?? 0})
              </p>
              <ul className="space-y-1">
                {(standingsModal.cell?.nonSolvers ?? []).map((s) => (
                  <li
                    key={s.id}
                    className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200/80"
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={() => setStandingsModal(null)}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
