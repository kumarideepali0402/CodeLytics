import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Star,
  ExternalLink,
  Search,
  User,
} from "lucide-react";
import { normalizeOutlineShape, recomputeAll } from "../utils/batchOutlineShape";
import { displayPlatform, platformStyleClass } from "../utils/problemDisplay";
import axiosClient from "../utils/axiosClient";
import { handleError } from "../utils/notification";
import {
  loadStudentProgress,
  saveStudentProgress,
  getProblemState,
  setProblemState as patchProgress,
} from "../utils/studentSheetProgress";


function difficultyBadge(difficulty) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums";
  if (difficulty === "Easy") return `${base} bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80`;
  if (difficulty === "Medium") return `${base} bg-amber-50 text-amber-900 ring-1 ring-amber-200/80`;
  return `${base} bg-rose-50 text-rose-800 ring-1 ring-rose-200/80`;
}

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

function StudentProgressRing({ completed, total, size = 56, strokeWidth = 4, showFractionInside = false }) {
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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-slate-200" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          className="stroke-violet-600 transition-[stroke-dashoffset] duration-500 ease-out"
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold tabular-nums leading-none text-slate-900 ${showFractionInside ? "text-base sm:text-lg" : "text-xs sm:text-sm"}`}>
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

function applyProgressToOutline(topics, progressMap) {
  const next = structuredClone(topics);
  next.forEach((topic, tIdx) => {
    topic.subtopics.forEach((cls, cIdx) => {
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

export default function StudentProblemSheet() {
  const navigate = useNavigate();
  const [batchId, setBatchId] = useState(null);
  const progressStorageId = batchId ?? "student";

  const [rawOutline, setRawOutline] = useState([]);
  const [loading, setLoading] = useState(true);

  const [progressMap, setProgressMap] = useState(() => loadStudentProgress(progressStorageId));
  const [openTopics, setOpenTopics] = useState({});
  const [openClass, setOpenClass] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [solveStatusFilter, setSolveStatusFilter] = useState("all");
  const [studentListTab, setStudentListTab] = useState("all");
  const [studentSearchOpen, setStudentSearchOpen] = useState(false);
  const studentSearchWrapRef = useRef(null);
  const studentSearchInputRef = useRef(null);

  useEffect(() => {
    setProgressMap(loadStudentProgress(progressStorageId));
  }, [progressStorageId]);

  const studentSearchExpanded = studentSearchOpen || searchQuery.trim().length > 0;

  useEffect(() => {
    if (studentSearchOpen && studentSearchInputRef.current) {
      studentSearchInputRef.current.focus();
    }
  }, [studentSearchOpen]);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!studentSearchWrapRef.current?.contains(e.target)) {
        if (!searchQuery.trim()) setStudentSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [searchQuery]);

  useEffect(() => {
    const fetchOutline = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/student/my-batch-outline`);
        setRawOutline(res.data?.outline ?? []);
        if (res.data?.batchId) setBatchId(res.data.batchId);
      } catch (error) {
        handleError(error.response?.data?.msg ?? "Failed to load problem list");
      } finally {
        setLoading(false);
      }
    };
    fetchOutline();
  }, []);

  const data = useMemo(() => {
    if (!rawOutline.length) return [];
    const normalized = structuredClone(rawOutline);
    normalizeOutlineShape(normalized);
    return applyProgressToOutline(normalized, progressMap);
  }, [rawOutline, progressMap]);

  const persistProgress = useCallback((nextMap) => {
    setProgressMap(nextMap);
    saveStudentProgress(progressStorageId, nextMap);
  }, [progressStorageId]);

  const toggleSolved = (tIndex, cIndex, pIndex) => {
    const p = data[tIndex].subtopics[cIndex].problems[pIndex];
    const st = getProblemState(progressMap, p, tIndex, cIndex, pIndex);
    persistProgress(patchProgress(progressMap, p, tIndex, cIndex, pIndex, { solved: !st.solved }));
  };

  const toggleStar = (tIndex, cIndex, pIndex) => {
    const p = data[tIndex].subtopics[cIndex].problems[pIndex];
    const st = getProblemState(progressMap, p, tIndex, cIndex, pIndex);
    persistProgress(patchProgress(progressMap, p, tIndex, cIndex, pIndex, { starred: !st.starred }));
  };

  const toggleTopic = (index) => setOpenTopics((prev) => ({ ...prev, [index]: !prev[index] }));
  const toggleClass = (tIndex, cIndex) => {
    const key = `${tIndex}-${cIndex}`;
    setOpenClass((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const problemVisible = (p) => {
    const q = searchQuery.trim().toLowerCase();
    if (q && !String(p.name).toLowerCase().includes(q)) return false;
    if (difficultyFilter !== "all" && p.difficulty !== difficultyFilter) return false;
    if (studentListTab === "revision" && !p.starred) return false;
    if (solveStatusFilter === "solved" && !p.solved) return false;
    if (solveStatusFilter === "unsolved" && p.solved) return false;
    return true;
  };

  const grandTotal = data.reduce((a, t) => a + t.total, 0);
  const grandDone = data.reduce((a, t) => a + t.completed, 0);

  let easyT = 0, easyD = 0, medT = 0, medD = 0, hardT = 0, hardD = 0;
  data.forEach((topic) => {
    topic.subtopics.forEach((cls) => {
      cls.problems.forEach((p) => {
        if (p.difficulty === "Easy") { easyT++; if (p.solved) easyD++; }
        else if (p.difficulty === "Medium") { medT++; if (p.solved) medD++; }
        else if (p.difficulty === "Hard") { hardT++; if (p.solved) hardD++; }
      });
    });
  });

  return (
    <div className="mt-1 min-h-0 bg-gradient-to-b from-slate-50/80 to-white pb-8 text-slate-900">
      <div className="border-b border-slate-200/90 bg-white/95 px-4 py-3 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-600/90">
              Practice sheet
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Problem list
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/student/profile")}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            aria-label="Open student profile"
            title="Open profile"
          >
            <User className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
            Loading problem list…
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-600">No problems assigned to this batch yet.</p>
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="mb-5 rounded-2xl border border-slate-200/90 bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100 sm:px-4">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="inline-flex w-fit shrink-0 rounded-xl bg-slate-100/90 p-0.5 ring-1 ring-slate-200/80">
                <button
                  type="button"
                  onClick={() => setStudentListTab("all")}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${studentListTab === "all" ? "bg-white text-violet-700 shadow-sm ring-1 ring-violet-200/80" : "text-slate-600 hover:text-slate-900"}`}
                >
                  All problems
                </button>
                <button
                  type="button"
                  onClick={() => setStudentListTab("revision")}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${studentListTab === "revision" ? "bg-white text-violet-700 shadow-sm ring-1 ring-amber-200/90" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <Star className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Revision
                </button>
              </div>
              <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:gap-x-3 sm:pl-2">
                <div
                  ref={studentSearchWrapRef}
                  className={studentSearchExpanded ? "relative min-w-[10rem] max-w-[min(100%,20rem)] flex-1 sm:flex-initial" : "shrink-0"}
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
                  <label htmlFor="difficulty-filter" className="shrink-0 text-[11px] font-medium text-slate-500">
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
                  <label htmlFor="solve-status-filter" className="shrink-0 text-[11px] font-medium text-slate-500">
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

        {!loading && data.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-slate-200/90 bg-white px-2.5 py-2 shadow-sm ring-1 ring-slate-100 sm:gap-x-4 sm:px-3">
            <div className="flex min-w-0 items-center gap-2">
              <StudentProgressRing completed={grandDone} total={grandTotal || 0} showFractionInside={false} />
              <div className="min-w-0 leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Your progress</p>
                <p className="text-xs font-semibold tabular-nums text-slate-800">{grandDone} / {grandTotal || 0}</p>
              </div>
            </div>
            <div className="hidden h-6 w-px shrink-0 bg-slate-200/90 sm:block" aria-hidden />
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 sm:ml-auto sm:flex-1 sm:justify-end">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-emerald-50/90 px-2 py-0.5 text-[11px] ring-1 ring-emerald-200/50">
                <span className="font-medium text-emerald-800">Easy</span>
                <span className="font-bold tabular-nums text-emerald-900">{easyD} / {easyT}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-amber-50/90 px-2 py-0.5 text-[11px] ring-1 ring-amber-200/50">
                <span className="font-medium text-amber-900">Medium</span>
                <span className="font-bold tabular-nums text-amber-950">{medD} / {medT}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-rose-50/90 px-2 py-0.5 text-[11px] ring-1 ring-rose-200/50">
                <span className="font-medium text-rose-900">Hard</span>
                <span className="font-bold tabular-nums text-rose-950">{hardD} / {hardT}</span>
              </span>
            </div>
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-sm ring-1 ring-slate-100">
            {data.map((topic, tIndex) => (
              <div key={tIndex} className={tIndex > 0 ? "border-t border-slate-100" : ""}>
                <div
                  className="flex cursor-pointer items-center justify-between gap-3 bg-gradient-to-r from-slate-50/90 to-white px-4 py-3.5 transition-colors hover:from-slate-100/80 sm:px-5 sm:py-4"
                  onClick={() => toggleTopic(tIndex)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTopic(tIndex); } }}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {openTopics[tIndex]
                      ? <ChevronDown size={20} className="shrink-0 text-slate-500" aria-hidden />
                      : <ChevronRight size={20} className="shrink-0 text-slate-500" aria-hidden />
                    }
                    <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{topic.title}</h2>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <ProgressBar completed={topic.completed} total={topic.total} />
                    <span className="w-14 text-right text-sm font-semibold tabular-nums text-slate-600 sm:w-16">
                      {topic.completed}/{topic.total}
                    </span>
                  </div>
                </div>

                {openTopics[tIndex] && (
                  <div className="space-y-1 border-t border-slate-100 bg-white px-3 py-3 sm:px-5 sm:py-4">
                    {!(topic.subtopics ?? []).length ? (
                      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600">
                        No subtopics yet.
                      </p>
                    ) : (
                      topic.subtopics.map((classItem, cIndex) => {
                        const subProblems = classItem.problems ?? [];
                        const visibleProblems = subProblems.filter(problemVisible);
                        return (
                          <div key={cIndex} className="rounded-xl border border-slate-100 bg-slate-50/40">
                            <div
                              className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-slate-100/60 sm:px-4 sm:py-3"
                              onClick={() => toggleClass(tIndex, cIndex)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleClass(tIndex, cIndex); } }}
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-2">
                                {openClass[`${tIndex}-${cIndex}`]
                                  ? <ChevronDown size={16} className="shrink-0 text-slate-500" aria-hidden />
                                  : <ChevronRight size={16} className="shrink-0 text-slate-500" aria-hidden />
                                }
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
                                    Notes <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <ProgressBar completed={classItem.completed} total={classItem.total} />
                                <span className="w-14 text-right text-xs font-semibold tabular-nums text-slate-600 sm:text-sm">
                                  {classItem.completed}/{classItem.total}
                                </span>
                              </div>
                            </div>

                            {openClass[`${tIndex}-${cIndex}`] && (
                              <div className="border-t border-slate-100 bg-white px-2 pb-3 pt-1 sm:px-3 sm:pb-4">
                                {visibleProblems.length === 0 ? (
                                  <p className="py-6 text-center text-sm text-slate-500">
                                    {subProblems.length === 0
                                      ? "No problems in this subtopic."
                                      : studentListTab === "revision"
                                        ? "No starred problems here. Star items in All problems to see them in Revision."
                                        : solveStatusFilter !== "all"
                                          ? "No problems match this status."
                                          : "No problems match your search or filters."}
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto overflow-hidden rounded-lg border border-slate-200/90 shadow-inner">
                                    <table className="w-full min-w-[320px] border-collapse text-sm">
                                      <thead>
                                        <tr className="bg-slate-100/90 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                          <th className="w-12 px-2 py-2.5 text-center sm:w-14">Done</th>
                                          <th className="px-3 py-2.5 sm:px-4">Problem</th>
                                          <th className="px-3 py-2.5 sm:w-28">Platform</th>
                                          <th className="px-3 py-2.5 sm:w-32">Difficulty</th>
                                          <th className="px-3 py-2.5 sm:w-28">Practice</th>
                                          <th className="w-12 px-2 py-2.5 text-center sm:w-14">Revisit</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {subProblems.map((p, pIndex) => {
                                          if (!problemVisible(p)) return null;
                                          return (
                                            <tr
                                              key={pIndex}
                                              className={`bg-white transition-colors hover:bg-slate-50/90 ${p.solved ? "bg-emerald-50/40" : ""}`}
                                            >
                                              <td className="px-2 py-2.5 text-center align-middle sm:py-3">
                                                <input
                                                  type="checkbox"
                                                  checked={p.solved}
                                                  onChange={() => toggleSolved(tIndex, cIndex, pIndex)}
                                                  className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                                  aria-label={`Mark ${p.name} as done`}
                                                />
                                              </td>
                                              <td className={`px-3 py-2.5 font-medium sm:px-4 sm:py-3 ${p.solved ? "text-slate-600 line-through decoration-slate-400" : "text-slate-900"}`}>
                                                {p.name}
                                              </td>
                                              <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                                <span className={platformStyleClass(displayPlatform(p))} title={displayPlatform(p)}>
                                                  {displayPlatform(p)}
                                                </span>
                                              </td>
                                              <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                                <span className={difficultyBadge(p.difficulty)}>{p.difficulty}</span>
                                              </td>
                                              <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                                <a
                                                  href={p.link}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                                                >
                                                  Open <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                                                </a>
                                              </td>
                                              <td className="px-2 py-2.5 text-center align-middle sm:py-3">
                                                <button
                                                  type="button"
                                                  onClick={() => toggleStar(tIndex, cIndex, pIndex)}
                                                  className="rounded p-1 text-slate-400 hover:bg-amber-50 hover:text-amber-500"
                                                  aria-label={p.starred ? "Remove from revisit" : "Star for revisit"}
                                                >
                                                  <Star size={18} className={p.starred ? "fill-amber-400 text-amber-500" : "text-slate-300"} />
                                                </button>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
