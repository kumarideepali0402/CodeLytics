import { X } from "lucide-react";
import TeacherStandingsBoard from "./TeacherStandingsBoard";

export default function SubtopicStandingsModal({
  boardModal,
  setBoardModal,
  data,
  solveMatrix,
  batchStudents,
}) {
  if (!boardModal || !data[boardModal.tIndex]?.subtopics?.[boardModal.sIndex]) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="board-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <p
              id="board-title"
              className="text-lg font-bold leading-tight text-slate-900"
            >
              Class standings
            </p>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                {data[boardModal.tIndex].title}
              </span>
              <span className="text-slate-400"> · </span>
              <span>{data[boardModal.tIndex].subtopics[boardModal.sIndex].title}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBoardModal(null)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close standings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-2 sm:px-4">
          <TeacherStandingsBoard
            data={data}
            tIndex={boardModal.tIndex}
            sIndex={boardModal.sIndex}
            solveMatrix={solveMatrix}
            batchStudents={batchStudents}
          />
        </div>
      </div>
    </div>
  );
}
