import { ExternalLink, Check } from "lucide-react";
import { displayPlatform, platformStyleClass } from "../utils/problemDisplay";
import {
  buildSubtopicCfRows,
  columnFooterTried,
  problemStandingsKey,
  problemColumnLabel,
} from "../utils/teacherBatchStandings";

function cfHandleClass(rank) {
  if (rank === 1) return "font-bold text-red-700";
  if (rank === 2) return "font-bold text-orange-700";
  if (rank === 3) return "font-bold text-yellow-700";
  return "text-slate-800";
}

export default function TeacherCfStandingsBoard({
  data,
  tIndex,
  cIndex,
  solveMatrix,
  batchStudents,
  onOpenProblemModal,
}) {
  const subProblems = data[tIndex]?.subtopics?.[cIndex]?.problems ?? [];
  if (!subProblems.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-600">
        No problems in this subtopic. Assign problems from the Content tab.
      </p>
    );
  }

  const cfRows = buildSubtopicCfRows(batchStudents, tIndex, cIndex, subProblems);
  const cfFooterTried = columnFooterTried(batchStudents, tIndex, cIndex, subProblems);
  const cfFooterAccepted = subProblems.map((p, pi) => {
    const pk = problemStandingsKey(tIndex, cIndex, pi, p.name);
    return solveMatrix.get(pk)?.solvedCount ?? 0;
  });

  return (
    <div className="overflow-hidden rounded border border-slate-300 bg-[#fbfbfd] shadow-sm">
      <div className="border-b border-slate-300 bg-[#e8edf5] px-3 py-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-700">
          Standings (sample class)
        </p>
        <p className="mt-0.5 text-[10px] text-slate-600">
          A, B, C… are problem links. Green tick = solved (dummy data).
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[11px] leading-tight text-slate-900">
          <thead>
            <tr className="border-b border-slate-300 bg-[#e8edf5]">
              <th className="min-w-[2.75rem] border-r border-slate-300 px-1.5 py-1.5 text-center font-bold text-slate-800">
                #
              </th>
              <th className="min-w-[11rem] border-r border-slate-300 px-2 py-1.5 text-left font-bold text-slate-800">
                Who
              </th>
              <th className="min-w-[2.75rem] border-r border-slate-300 px-1 py-1.5 text-center font-bold text-slate-800">
                =
                <span className="mt-0.5 block text-[9px] font-normal text-slate-500">
                  solved
                </span>
              </th>
              {subProblems.map((prob, pi) => {
                const label = problemColumnLabel(pi);
                const href = prob.link?.trim() || "#";
                return (
                  <th
                    key={pi}
                    className="min-w-[3.5rem] max-w-[5rem] border-l border-slate-300 px-1 py-1.5 text-center align-bottom font-bold text-slate-800"
                    title={prob.name}
                  >
                    {href !== "#" ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full flex-col items-center gap-0.5 text-indigo-700 hover:text-indigo-900 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="inline-flex items-center gap-0.5 font-bold tabular-nums">
                          {label}
                          <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-80" />
                        </span>
                        <span className="line-clamp-2 max-w-full text-[9px] font-normal leading-tight text-slate-600">
                          {prob.name}
                        </span>
                        <span className={`mt-0.5 max-w-full truncate text-[8px] ${platformStyleClass(displayPlatform(prob))}`}>
                          {displayPlatform(prob)}
                        </span>
                      </a>
                    ) : (
                      <span className="flex flex-col items-center gap-0.5">
                        <span>{label}</span>
                        <span className="line-clamp-2 text-[9px] font-normal text-slate-600">
                          {prob.name}
                        </span>
                        <span className={`mt-0.5 max-w-full truncate text-[8px] ${platformStyleClass(displayPlatform(prob))}`}>
                          {displayPlatform(prob)}
                        </span>
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {cfRows.map((row) => (
              <tr
                key={row.student.id}
                className="border-b border-slate-200 odd:bg-white even:bg-[#f8f9fa]"
              >
                <td className="border-r border-slate-200 px-1.5 py-1.5 text-center font-mono tabular-nums text-slate-700">
                  {row.rank}
                  <span className="text-slate-800"> ({row.total})</span>
                </td>
                <td className="border-r border-slate-200 px-2 py-1.5">
                  <span className={cfHandleClass(row.rank)}>{row.student.name}</span>
                </td>
                <td className="border-r border-slate-200 px-1 py-1.5 text-center font-mono font-bold tabular-nums text-slate-900">
                  {row.total}
                  <span className="block text-[9px] font-normal text-slate-500">
                    /{subProblems.length}
                  </span>
                </td>
                {row.cells.map((cell, pi) => {
                  const prob = subProblems[pi];
                  const pk = cell.pk;
                  const cellMat = solveMatrix.get(pk);
                  return (
                    <td
                      key={pk}
                      className="border-l border-slate-200 px-0.5 py-1 align-middle text-center"
                    >
                      {cell.solved ? (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenProblemModal({ tIndex, cIndex, pIndex: pi, problem: prob, cell: cellMat })
                          }
                          className="inline-flex w-full items-center justify-center py-1 text-emerald-600 hover:bg-emerald-50/90"
                          aria-label={`Solved — ${prob.name}`}
                        >
                          <Check className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenProblemModal({ tIndex, cIndex, pIndex: pi, problem: prob, cell: cellMat })
                          }
                          className="block w-full min-h-[2.25rem] cursor-pointer hover:bg-slate-100/90"
                          aria-label={`Who solved ${prob.name}`}
                        >
                          <span className="sr-only">Open</span>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-[#eef2f8]">
              <td colSpan={3} className="border-r border-slate-200 px-2 py-1.5 text-left font-bold text-slate-800">
                Accepted
              </td>
              {cfFooterAccepted.map((n, pi) => (
                <td key={`acc-${pi}`} className="border-l border-slate-200 px-1 py-1.5 text-center font-mono font-semibold text-slate-800">
                  {n}
                </td>
              ))}
            </tr>
            <tr className="border-t border-slate-200 bg-[#eef2f8]">
              <td colSpan={3} className="border-r border-slate-200 px-2 py-1.5 text-left font-bold text-slate-800">
                Tried
              </td>
              {cfFooterTried.map((n, pi) => (
                <td key={`try-${pi}`} className="border-l border-slate-200 px-1 py-1.5 text-center font-mono font-semibold text-slate-800">
                  {n}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
