import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Star,
  ExternalLink,
  Search,
  User,
  Users,
  X,
  Check,
  LayoutGrid,
} from "lucide-react";
import { normalizeOutlineShape, recomputeAll } from "../utils/batchOutlineShape";
import { displayPlatform, platformStyleClass } from "../utils/problemDisplay";
import {
  loadStudentProgress,
  saveStudentProgress,
  getProblemState,
  setProblemState as patchProgress,
} from "../utils/studentSheetProgress";
import {
  buildSolveMatrix,
  getStatsForSubtopic,
  problemStandingsKey,
  buildSubtopicCfRows,
  columnFooterTried,
  problemColumnLabel,
} from "../utils/teacherBatchStandings";

const MOCK_BATCH_STUDENTS = [
  { id: "demo-1", name: "Aarav Sharma" },
  { id: "demo-2", name: "Priya Nair" },
  { id: "demo-3", name: "Rahul Verma" },
  { id: "demo-4", name: "Sneha Iyer" },
  { id: "demo-5", name: "Karan Mehta" },
  { id: "demo-6", name: "Ananya Das" },
  { id: "demo-7", name: "Vikram Singh" },
  { id: "demo-8", name: "Meera Krishnan" },
];

function ProgressBar({ completed, total }) {
  const percentage = total === 0 ? 0 : (completed / total) * 100;
  return (
    <div className="h-2 w-32 max-w-[40vw] overflow-hidden rounded-full bg-slate-200/90 sm:w-36">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

/** Circular ring showing solved / total as fill percentage (student sheet). */
function StudentProgressRing({
  completed,
  total,
  size = 56,
  strokeWidth = 4,
  /** When false, ring shows only % (counts shown beside the ring). */
  showFractionInside = false,
}) {
  const pct = total === 0 ? 0 : (completed / total) * 100;
  const roundedPct = Math.round(pct);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div
      className="relative inline-flex shrink-0"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={roundedPct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${roundedPct}% of problems solved, ${completed} of ${total}`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-slate-200"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-violet-600 transition-[stroke-dashoffset] duration-500 ease-out"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-bold tabular-nums leading-none text-slate-900 ${
            showFractionInside ? "text-base sm:text-lg" : "text-xs sm:text-sm"
          }`}
        >
          {roundedPct}%
        </span>
        {showFractionInside && (
          <span className="mt-0.5 text-[9px] font-semibold tabular-nums text-slate-500 sm:text-[10px]">
            {completed} / {total}
          </span>
        )}
      </div>
    </div>
  );
}

function difficultyBadge(difficulty) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums";
  if (difficulty === "Easy")
    return `${base} bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80`;
  if (difficulty === "Medium")
    return `${base} bg-amber-50 text-amber-900 ring-1 ring-amber-200/80`;
  return `${base} bg-rose-50 text-rose-800 ring-1 ring-rose-200/80`;
}

/** Codeforces-style handle colour by rank (mock standings). */
function cfHandleClass(rank) {
  if (rank === 1) return "font-bold text-red-700";
  if (rank === 2) return "font-bold text-orange-700";
  if (rank === 3) return "font-bold text-yellow-700";
  if (rank <= 10) return "font-semibold text-sky-800";
  return "font-medium text-slate-800";
}

/** Full Codeforces-style grid (mock class data) — used in the teacher modal. */
function TeacherCfStandingsBoard({
  data,
  tIndex,
  cIndex,
  solveMatrix,
  batchStudents,
  onOpenProblemModal,
}) {
  const subProblems = data[tIndex]?.classes?.[cIndex]?.problems ?? [];
  if (!subProblems.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-600">
        No problems in this subtopic. Assign problems from the Content tab.
      </p>
    );
  }

  const cfRows = buildSubtopicCfRows(batchStudents, tIndex, cIndex, subProblems);
  const cfFooterTried = columnFooterTried(
    batchStudents,
    tIndex,
    cIndex,
    subProblems
  );
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
                        <span
                          className={`mt-0.5 max-w-full truncate text-[8px] ${platformStyleClass(displayPlatform(prob))}`}
                        >
                          {displayPlatform(prob)}
                        </span>
                      </a>
                    ) : (
                      <span className="flex flex-col items-center gap-0.5">
                        <span>{label}</span>
                        <span className="line-clamp-2 text-[9px] font-normal text-slate-600">
                          {prob.name}
                        </span>
                        <span
                          className={`mt-0.5 max-w-full truncate text-[8px] ${platformStyleClass(displayPlatform(prob))}`}
                        >
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
                            onOpenProblemModal({
                              tIndex,
                              cIndex,
                              pIndex: pi,
                              problem: prob,
                              cell: cellMat,
                            })
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
                            onOpenProblemModal({
                              tIndex,
                              cIndex,
                              pIndex: pi,
                              problem: prob,
                              cell: cellMat,
                            })
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
              <td
                colSpan={3}
                className="border-r border-slate-200 px-2 py-1.5 text-left font-bold text-slate-800"
              >
                Accepted
              </td>
              {cfFooterAccepted.map((n, pi) => (
                <td
                  key={`acc-${pi}`}
                  className="border-l border-slate-200 px-1 py-1.5 text-center font-mono font-semibold text-slate-800"
                >
                  {n}
                </td>
              ))}
            </tr>
            <tr className="border-t border-slate-200 bg-[#eef2f8]">
              <td
                colSpan={3}
                className="border-r border-slate-200 px-2 py-1.5 text-left font-bold text-slate-800"
              >
                Tried
              </td>
              {cfFooterTried.map((n, pi) => (
                <td
                  key={`try-${pi}`}
                  className="border-l border-slate-200 px-1 py-1.5 text-center font-mono font-semibold text-slate-800"
                >
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

function applyProgressToOutline(topics, progressMap) {
  const next = structuredClone(topics);
  next.forEach((topic, tIdx) => {
    topic.classes.forEach((cls, cIdx) => {
      cls.problems.forEach((p, pIdx) => {
        const st = getProblemState(progressMap, p, tIdx, cIdx, pIdx);
        p.solved = st.solved;
        p.starred = st.starred;
      });
    });
  });
  recomputeAll(next);
  return next;
}

function stripPersonalFlagsForTeacherView(topics) {
  const next = structuredClone(topics);
  next.forEach((topic) => {
    topic.classes.forEach((cls) => {
      cls.problems.forEach((p) => {
        p.solved = false;
        p.starred = false;
      });
    });
  });
  recomputeAll(next);
  return next;
}

/**
 * Student route: TUF-style personal sheet (done, revisit, filters).
 * Teacher /problemslist: Codeforces-style class standings (mock data until API exists).
 */
export default function ProblemList() {
  const { id: idParam, batchId: batchIdParam } = useParams();
  /** `/teacher/:id` uses `id`; `/batch/:batchId` uses `batchId` */
  const batchId = idParam ?? batchIdParam;
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const isTeacherPath = Boolean(batchId) && /\/teacher\//i.test(pathname);
  /** College / institution batch UI: same standings view as teacher Problem list */
  const isBatchProblemsList =
    Boolean(batchId) &&
    /\/batch\//i.test(pathname) &&
    pathname.includes("problemslist");
  const isTeacherBatch = isTeacherPath || isBatchProblemsList;
  const isTeacherStandings = isTeacherBatch && pathname.includes("problemslist");
  const isStudentSheet = !isTeacherBatch;

  const progressStorageId = batchId || "demo";

  // TODO: load outline from API when batchId is available (teacher + student views)
  const [rawOutline, setRawOutline] = useState([]);

  const [progressMap, setProgressMap] = useState(() =>
    loadStudentProgress(progressStorageId)
  );

  const [batchStudents] = useState(() => [...MOCK_BATCH_STUDENTS]);

  const [openTopics, setOpenTopics] = useState({});
  const [openClass, setOpenClass] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  /** Student sheet: all | solved | unsolved */
  const [solveStatusFilter, setSolveStatusFilter] = useState("all");
  /** Student sheet: all problems vs starred-only (revision) */
  const [studentListTab, setStudentListTab] = useState("all");
  /** Student sheet: search field expanded from icon */
  const [studentSearchOpen, setStudentSearchOpen] = useState(false);
  const studentSearchWrapRef = useRef(null);
  const studentSearchInputRef = useRef(null);
  const [standingsModal, setStandingsModal] = useState(null);
  /** Full class scoreboard (Codeforces-style) per subtopic */
  const [cfBoardModal, setCfBoardModal] = useState(null);

  useEffect(() => {
    setProgressMap(loadStudentProgress(progressStorageId));
  }, [progressStorageId]);

  const studentSearchExpanded =
    studentSearchOpen || searchQuery.trim().length > 0;

  useEffect(() => {
    if (studentSearchOpen && studentSearchInputRef.current) {
      studentSearchInputRef.current.focus();
    }
  }, [studentSearchOpen]);

  useEffect(() => {
    if (!isStudentSheet) return;
    const onDocMouseDown = (e) => {
      if (!studentSearchWrapRef.current?.contains(e.target)) {
        if (!searchQuery.trim()) setStudentSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [isStudentSheet, searchQuery]);

  useEffect(() => {
    setRawOutline([]);
    // TODO: GET outline for batchId (shared with Content tab) and setRawOutline
  }, [batchId]);

  const studentData = useMemo(() => {
    if (!isStudentSheet) return [];
    if (!rawOutline.length) return [];
    return applyProgressToOutline(structuredClone(rawOutline), progressMap);
  }, [rawOutline, progressMap, isStudentSheet]);

  const teacherData = useMemo(() => {
    if (!isTeacherStandings) return [];
    if (!rawOutline.length) return [];
    const normalized = structuredClone(rawOutline);
    normalizeOutlineShape(normalized);
    recomputeAll(normalized);
    return stripPersonalFlagsForTeacherView(normalized);
  }, [rawOutline, isTeacherStandings]);

  const data = isStudentSheet ? studentData : teacherData;

  const solveMatrix = useMemo(
    () => buildSolveMatrix(teacherData, batchStudents),
    [teacherData, batchStudents]
  );

  const persistProgress = useCallback(
    (nextMap) => {
      setProgressMap(nextMap);
      if (isStudentSheet) {
        saveStudentProgress(progressStorageId, nextMap);
      }
    },
    [isStudentSheet, progressStorageId]
  );

  const toggleSolved = (tIndex, cIndex, pIndex) => {
    if (!isStudentSheet) return;
    const p = data[tIndex].classes[cIndex].problems[pIndex];
    const st = getProblemState(progressMap, p, tIndex, cIndex, pIndex);
    const next = patchProgress(progressMap, p, tIndex, cIndex, pIndex, {
      solved: !st.solved,
    });
    persistProgress(next);
  };

  const toggleStar = (tIndex, cIndex, pIndex) => {
    if (!isStudentSheet) return;
    const p = data[tIndex].classes[cIndex].problems[pIndex];
    const st = getProblemState(progressMap, p, tIndex, cIndex, pIndex);
    const next = patchProgress(progressMap, p, tIndex, cIndex, pIndex, {
      starred: !st.starred,
    });
    persistProgress(next);
  };

  const toggleTopic = (index) => {
    setOpenTopics((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleClass = (tIndex, cIndex) => {
    const key = `${tIndex}-${cIndex}`;
    setOpenClass((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const problemMatchesFilters = (p) => {
    const q = searchQuery.trim().toLowerCase();
    if (q && !String(p.name).toLowerCase().includes(q)) return false;
    if (difficultyFilter === "all") return true;
    return p.difficulty === difficultyFilter;
  };

  /** Search + difficulty + (student) revision tab + solved/unsolved */
  const problemVisibleForRow = (p) => {
    if (!problemMatchesFilters(p)) return false;
    if (!isStudentSheet) return true;
    if (studentListTab === "revision" && !p.starred) return false;
    if (solveStatusFilter === "solved" && !p.solved) return false;
    if (solveStatusFilter === "unsolved" && p.solved) return false;
    return true;
  };

  const grandTotal = data.reduce((a, t) => a + t.total, 0);
  const grandDone = data.reduce((a, t) => a + t.completed, 0);

  let easyT = 0,
    easyD = 0,
    medT = 0,
    medD = 0,
    hardT = 0,
    hardD = 0;
  data.forEach((topic) => {
    topic.classes.forEach((cls) => {
      cls.problems.forEach((p) => {
        if (p.difficulty === "Easy") {
          easyT++;
          if (p.solved) easyD++;
        } else if (p.difficulty === "Medium") {
          medT++;
          if (p.solved) medD++;
        } else if (p.difficulty === "Hard") {
          hardT++;
          if (p.solved) hardD++;
        }
      });
    });
  });

  const teacherTotalProblemSlots = useMemo(() => {
    if (!isTeacherStandings) return 0;
    let n = 0;
    teacherData.forEach((t) =>
      t.classes.forEach((c) => {
        n += c.problems.length;
      })
    );
    return n;
  }, [teacherData, isTeacherStandings]);

  const teacherTotalSolves = useMemo(() => {
    if (!isTeacherStandings) return 0;
    let n = 0;
    solveMatrix.forEach((v) => {
      n += v.solvedCount;
    });
    return n;
  }, [solveMatrix, isTeacherStandings]);

  return (
    <div className="mt-1 min-h-0 bg-gradient-to-b from-slate-50/80 to-white pb-8 text-slate-900">
      <div className="border-b border-slate-200/90 bg-white/95 px-4 py-3 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                isTeacherStandings ? "text-sky-700" : "text-violet-600/90"
              }`}
            >
              {isTeacherStandings ? "Batch standings" : "Practice sheet"}
            </p>
            <h1
              className={`font-bold tracking-tight text-slate-900 ${
                isTeacherStandings ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
              }`}
            >
              Problem list
            </h1>
          </div>
          {isStudentSheet && (
            <button
              type="button"
              onClick={() => navigate("/student/profile")}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
              aria-label="Open student profile"
              title="Open profile"
            >
              <User className="h-5 w-5" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
        {isStudentSheet && data.length > 0 && (
          <div className="mb-5 rounded-2xl border border-slate-200/90 bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100 sm:px-4">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="inline-flex w-fit shrink-0 rounded-xl bg-slate-100/90 p-0.5 ring-1 ring-slate-200/80">
                <button
                  type="button"
                  onClick={() => setStudentListTab("all")}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${
                    studentListTab === "all"
                      ? "bg-white text-violet-700 shadow-sm ring-1 ring-violet-200/80"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All problems
                </button>
                <button
                  type="button"
                  onClick={() => setStudentListTab("revision")}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${
                    studentListTab === "revision"
                      ? "bg-white text-violet-700 shadow-sm ring-1 ring-amber-200/90"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Star className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Revision
                </button>
              </div>
              <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:gap-x-3 sm:pl-2">
                <div
                  ref={studentSearchWrapRef}
                  className={
                    studentSearchExpanded
                      ? "relative min-w-[10rem] max-w-[min(100%,20rem)] flex-1 sm:flex-initial"
                      : "shrink-0"
                  }
                >
                  {studentSearchExpanded ? (
                    <div className="relative w-full">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        ref={studentSearchInputRef}
                        type="search"
                        placeholder="Search problems…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-2.5 text-sm outline-none ring-violet-200 transition focus:border-violet-300 focus:bg-white focus:ring-2"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      aria-label="Open search"
                      title="Search problems"
                      onClick={() => setStudentSearchOpen(true)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 text-slate-500 outline-none ring-violet-200 transition hover:border-violet-300 hover:bg-white hover:text-violet-600 focus-visible:ring-2"
                    >
                      <Search className="h-4 w-4 shrink-0" aria-hidden />
                    </button>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <label
                    htmlFor="difficulty-filter"
                    className="shrink-0 text-[11px] font-medium text-slate-500"
                  >
                    Difficulty
                  </label>
                  <select
                    id="difficulty-filter"
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="min-w-[6.5rem] rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-7 text-xs font-medium text-slate-800 shadow-sm outline-none ring-violet-200 transition focus:border-violet-300 focus:ring-2 sm:min-w-[8rem]"
                  >
                    <option value="all">All</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <label
                    htmlFor="solve-status-filter"
                    className="shrink-0 text-[11px] font-medium text-slate-500"
                  >
                    Status
                  </label>
                  <select
                    id="solve-status-filter"
                    value={solveStatusFilter}
                    onChange={(e) => setSolveStatusFilter(e.target.value)}
                    className="min-w-[6.5rem] rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-7 text-xs font-medium text-slate-800 shadow-sm outline-none ring-violet-200 transition focus:border-violet-300 focus:ring-2 sm:min-w-[8rem]"
                  >
                    <option value="all">All</option>
                    <option value="solved">Solved</option>
                    <option value="unsolved">Unsolved</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {isTeacherStandings && data.length > 0 && (
          <div className="mb-2 flex flex-col gap-2 rounded-lg border border-slate-200/90 bg-white px-2.5 py-2 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:py-1.5">
            <div className="relative min-w-0 flex-1 sm:min-w-[12rem]">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search problems…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-2 text-xs outline-none ring-sky-200 transition focus:border-sky-300 focus:bg-white focus:ring-1"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="difficulty-filter-teacher"
                className="shrink-0 text-[11px] font-medium text-slate-500"
              >
                Difficulty
              </label>
              <select
                id="difficulty-filter-teacher"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="rounded-md border border-slate-200 bg-white py-1.5 pl-2 pr-7 text-xs font-medium text-slate-800 outline-none ring-sky-200 transition focus:border-sky-400 focus:ring-1"
              >
                <option value="all">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <p className="flex items-center gap-1 text-[11px] text-slate-500 sm:ml-auto sm:shrink-0">
              <Users className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              <span>
                <span className="font-semibold tabular-nums text-slate-800">
                  {batchStudents.length}
                </span>{" "}
                students (demo)
              </span>
            </p>
          </div>
        )}

        {isStudentSheet && (
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-slate-200/90 bg-white px-2.5 py-2 shadow-sm ring-1 ring-slate-100 sm:gap-x-4 sm:px-3">
            <div className="flex min-w-0 items-center gap-2">
              <StudentProgressRing
                completed={grandDone}
                total={grandTotal || 0}
                showFractionInside={false}
              />
              <div className="min-w-0 leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Your progress
                </p>
                <p className="text-xs font-semibold tabular-nums text-slate-800">
                  {grandDone} / {grandTotal || 0}
                </p>
              </div>
            </div>
            <div
              className="hidden h-6 w-px shrink-0 bg-slate-200/90 sm:block"
              aria-hidden
            />
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 sm:ml-auto sm:flex-1 sm:justify-end">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-emerald-50/90 px-2 py-0.5 text-[11px] ring-1 ring-emerald-200/50">
                <span className="font-medium text-emerald-800">Easy</span>
                <span className="font-bold tabular-nums text-emerald-900">
                  {easyD} / {easyT}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-amber-50/90 px-2 py-0.5 text-[11px] ring-1 ring-amber-200/50">
                <span className="font-medium text-amber-900">Medium</span>
                <span className="font-bold tabular-nums text-amber-950">
                  {medD} / {medT}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-rose-50/90 px-2 py-0.5 text-[11px] ring-1 ring-rose-200/50">
                <span className="font-medium text-rose-900">Hard</span>
                <span className="font-bold tabular-nums text-rose-950">
                  {hardD} / {hardT}
                </span>
              </span>
            </div>
          </div>
        )}

        {isTeacherStandings && (
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-slate-200/80 bg-slate-50/90 px-2.5 py-1.5 text-[11px] text-slate-600">
            <span className="font-semibold uppercase tracking-wide text-slate-500">
              Class solves (demo)
            </span>
            <span className="font-bold tabular-nums text-slate-900">
              {teacherTotalSolves}
              <span className="font-semibold text-slate-400"> / </span>
              {teacherTotalProblemSlots * batchStudents.length || 0}
            </span>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              |
            </span>
            <span>
              <span className="text-slate-500">Problems</span>{" "}
              <strong className="tabular-nums text-slate-900">{teacherTotalProblemSlots}</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span>
              <span className="text-slate-500">Students</span>{" "}
              <strong className="tabular-nums text-slate-900">{batchStudents.length}</strong>
            </span>
          </div>
        )}

        {data.length > 0 && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-sm ring-1 ring-slate-100">
            {data.map((topic, tIndex) => (
              <div
                key={tIndex}
                className={tIndex > 0 ? "border-t border-slate-100" : ""}
              >
              <div
                className="flex cursor-pointer items-center justify-between gap-3 bg-gradient-to-r from-slate-50/90 to-white px-4 py-3.5 transition-colors hover:from-slate-100/80 sm:px-5 sm:py-4"
                onClick={() => toggleTopic(tIndex)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleTopic(tIndex);
                  }
                }}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  {openTopics[tIndex] ? (
                    <ChevronDown
                      size={20}
                      className="shrink-0 text-slate-500"
                      aria-hidden
                    />
                  ) : (
                    <ChevronRight
                      size={20}
                      className="shrink-0 text-slate-500"
                      aria-hidden
                    />
                  )}
                  <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                    {topic.title}
                  </h2>
                </div>
                {isStudentSheet ? (
                  <div className="flex shrink-0 items-center gap-3">
                    <ProgressBar completed={topic.completed} total={topic.total} />
                    <span className="w-14 text-right text-sm font-semibold tabular-nums text-slate-600 sm:w-16">
                      {topic.completed}/{topic.total}
                    </span>
                  </div>
                ) : (
                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    {(topic.classes ?? []).reduce(
                      (a, c) => a + (c.problems?.length ?? 0),
                      0
                    )}{" "}
                    problems
                  </span>
                )}
              </div>

              {openTopics[tIndex] && (
                <div className="space-y-1 border-t border-slate-100 bg-white px-3 py-3 sm:px-5 sm:py-4">
                  {!(topic.classes ?? []).length ? (
                    <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600">
                      No subtopics under this topic yet. Add subtopics in the{" "}
                      <strong className="text-slate-800">Content</strong> tab, then assign
                      problems.
                    </p>
                  ) : (
                    (topic.classes ?? []).map((classItem, cIndex) => {
                    const subProblems = classItem.problems ?? [];
                    const visibleProblems = subProblems.filter((p) =>
                      problemVisibleForRow(p)
                    );
                    const subStats = isTeacherStandings
                      ? getStatsForSubtopic(
                          data,
                          tIndex,
                          cIndex,
                          solveMatrix,
                          batchStudents
                        )
                      : null;

                    return (
                      <div
                        key={cIndex}
                        className="rounded-xl border border-slate-100 bg-slate-50/40"
                      >
                        <div
                          className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-slate-100/60 sm:px-4 sm:py-3"
                          onClick={() => toggleClass(tIndex, cIndex)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleClass(tIndex, cIndex);
                            }
                          }}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            {openClass[`${tIndex}-${cIndex}`] ? (
                              <ChevronDown
                                size={16}
                                className="shrink-0 text-slate-500"
                                aria-hidden
                              />
                            ) : (
                              <ChevronRight
                                size={16}
                                className="shrink-0 text-slate-500"
                                aria-hidden
                              />
                            )}
                            <h3 className="truncate text-sm font-semibold text-slate-800 sm:text-[15px]">
                              {classItem.title}
                            </h3>
                            {classItem.notesLink && classItem.notesLink !== "#" && (
                              <a
                                href={classItem.notesLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1 inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Notes
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-2">
                            {isTeacherStandings && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (subProblems.length > 0) {
                                    setCfBoardModal({ tIndex, cIndex });
                                  }
                                }}
                                disabled={subProblems.length === 0}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                              >
                                <LayoutGrid className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                Class standings
                              </button>
                            )}
                            {isStudentSheet ? (
                              <div className="flex items-center gap-3">
                                <ProgressBar
                                  completed={classItem.completed}
                                  total={classItem.total}
                                />
                                <span className="w-14 text-right text-xs font-semibold tabular-nums text-slate-600 sm:text-sm">
                                  {classItem.completed}/{classItem.total}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-sky-800">
                                {subStats?.totalSolves ?? 0} class solves ·{" "}
                                {subProblems.length} problems
                              </span>
                            )}
                          </div>
                        </div>

                        {openClass[`${tIndex}-${cIndex}`] && (
                          <div className="border-t border-slate-100 bg-white px-2 pb-3 pt-1 sm:px-3 sm:pb-4">
                            {visibleProblems.length === 0 ? (
                              <p className="py-6 text-center text-sm text-slate-500">
                                {subProblems.length === 0
                                  ? "No problems in this subtopic."
                                  : isStudentSheet &&
                                      studentListTab === "revision"
                                    ? "No starred problems here. Star items in All problems to see them in Revision."
                                    : isStudentSheet &&
                                        solveStatusFilter !== "all"
                                      ? "No problems match this status (solved / unsolved)."
                                      : "No problems match your search or filters."}
                              </p>
                            ) : (
                              <>
                                <div className="overflow-x-auto overflow-hidden rounded-lg border border-slate-200/90 shadow-inner">
                                  <table className="w-full min-w-[320px] border-collapse text-sm">
                                    <thead>
                                      <tr className="bg-slate-100/90 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        {isStudentSheet && (
                                          <th className="w-12 px-2 py-2.5 text-center sm:w-14">
                                            Done
                                          </th>
                                        )}
                                        <th className="px-3 py-2.5 sm:px-4">Problem</th>
                                        <th className="px-3 py-2.5 sm:w-28">
                                          Platform
                                        </th>
                                        <th className="px-3 py-2.5 sm:w-32">
                                          Difficulty
                                        </th>
                                        <th className="px-3 py-2.5 sm:w-28">
                                          Practice
                                        </th>
                                        {isStudentSheet ? (
                                          <th className="w-12 px-2 py-2.5 text-center sm:w-14">
                                            Revisit
                                          </th>
                                        ) : (
                                          <th className="px-3 py-2.5 text-right sm:w-36">
                                            Class
                                          </th>
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {subProblems.map((p, pIndex) => {
                                        if (!problemVisibleForRow(p)) return null;
                                        const pk = problemStandingsKey(
                                          tIndex,
                                          cIndex,
                                          pIndex,
                                          p.name
                                        );
                                        const cell = solveMatrix.get(pk);

                                        return (
                                          <tr
                                            key={pIndex}
                                            className={`bg-white transition-colors hover:bg-slate-50/90 ${
                                              isStudentSheet && p.solved
                                                ? "bg-emerald-50/40"
                                                : ""
                                            }`}
                                          >
                                            {isStudentSheet && (
                                              <td className="px-2 py-2.5 text-center align-middle sm:py-3">
                                                <input
                                                  type="checkbox"
                                                  checked={p.solved}
                                                  onChange={() =>
                                                    toggleSolved(
                                                      tIndex,
                                                      cIndex,
                                                      pIndex
                                                    )
                                                  }
                                                  className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                                  aria-label={`Mark ${p.name} as done`}
                                                />
                                              </td>
                                            )}
                                            <td
                                              className={`px-3 py-2.5 font-medium sm:px-4 sm:py-3 ${
                                                isStudentSheet && p.solved
                                                  ? "text-slate-600 line-through decoration-slate-400"
                                                  : "text-slate-900"
                                              }`}
                                            >
                                              {p.name}
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                              <span
                                                className={platformStyleClass(
                                                  displayPlatform(p)
                                                )}
                                                title={displayPlatform(p)}
                                              >
                                                {displayPlatform(p)}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                              <span
                                                className={difficultyBadge(p.difficulty)}
                                              >
                                                {p.difficulty}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                              <a
                                                href={p.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                                              >
                                                Open
                                                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                                              </a>
                                            </td>
                                            {isStudentSheet ? (
                                              <td className="px-2 py-2.5 text-center align-middle sm:py-3">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    toggleStar(
                                                      tIndex,
                                                      cIndex,
                                                      pIndex
                                                    )
                                                  }
                                                  className="rounded p-1 text-slate-400 hover:bg-amber-50 hover:text-amber-500"
                                                  aria-label={
                                                    p.starred
                                                      ? "Remove from revisit"
                                                      : "Star for revisit"
                                                  }
                                                >
                                                  <Star
                                                    size={18}
                                                    className={
                                                      p.starred
                                                        ? "fill-amber-400 text-amber-500"
                                                        : "text-slate-300"
                                                    }
                                                  />
                                                </button>
                                              </td>
                                            ) : (
                                              <td className="px-3 py-2.5 text-right sm:py-3">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setStandingsModal({
                                                      tIndex,
                                                      cIndex,
                                                      pIndex,
                                                      problem: p,
                                                      cell,
                                                    })
                                                  }
                                                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-900 hover:bg-sky-100"
                                                >
                                                  <Users className="h-3.5 w-3.5" />
                                                  {cell
                                                    ? `${cell.solvedCount}/${cell.totalStudents}`
                                                    : "—"}
                                                </button>
                                              </td>
                                            )}
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }))}
                </div>
              )}
              </div>
            ))}
          </div>
        )}
      </div>

      {cfBoardModal && data[cfBoardModal.tIndex]?.classes?.[cfBoardModal.cIndex] && (
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
                  <span>{data[cfBoardModal.tIndex].classes[cfBoardModal.cIndex].title}</span>
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
      )}

      {standingsModal && (
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
                  <span
                    className={platformStyleClass(
                      displayPlatform(standingsModal.problem)
                    )}
                  >
                    {displayPlatform(standingsModal.problem)}
                  </span>
                  <span
                    className={difficultyBadge(standingsModal.problem.difficulty)}
                  >
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
                        <span className="text-xs font-semibold text-emerald-700">
                          ✓
                        </span>
                      </li>
                    ))}
                    {(!standingsModal.cell?.solvers?.length) && (
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
      )}
    </div>
  );
}
