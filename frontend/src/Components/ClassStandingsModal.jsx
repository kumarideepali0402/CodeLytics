import { X } from "lucide-react";
import TeacherCfStandingsBoard from "./TeacherCfStandingsBoard";

export default function ClassStandingsModal({
  cfBoardModal,
  setCfBoardModal,
  setStandingsModal,
  data,
  solveMatrix,
  batchStudents,
}) {
  if (!cfBoardModal || !data[cfBoardModal.tIndex]?.subtopics?.[cfBoardModal.cIndex]) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cf-board-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <p
              id="cf-board-title"
              className="text-lg font-bold leading-tight text-slate-900"
            >
              Class standings
            </p>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                {data[cfBoardModal.tIndex].title}
              </span>
              <span className="text-slate-400"> · </span>
              <span>{data[cfBoardModal.tIndex].subtopics[cfBoardModal.cIndex].title}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCfBoardModal(null)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close standings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-2 sm:px-4">
          <TeacherCfStandingsBoard
            data={data}
            tIndex={cfBoardModal.tIndex}
            cIndex={cfBoardModal.cIndex}
            solveMatrix={solveMatrix}
            batchStudents={batchStudents}
            onOpenProblemModal={(payload) => {
              setCfBoardModal(null);
              setStandingsModal(payload);
            }}
          />
        </div>
      </div>
    </div>
  );
}
