import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Search,
  Users,
  LayoutGrid,
} from "lucide-react";
import { normalizeOutlineShape, recomputeAll } from "../utils/batchOutlineShape";
import { displayPlatform, platformStyleClass } from "../utils/problemDisplay";
import {
  buildRealSolveMatrix,
  problemStandingsKey,
} from "../utils/teacherBatchStandings";
import SubtopicStandingsModal from "../Components/SubtopicStandingsModal";
import ProblemStandingsModal from "../Components/ProblemStandingsModal"
import axiosClient from "../utils/axiosClient";
import { handleError } from "../utils/notification";



function difficultyBadge(difficulty) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums";
  if (difficulty === "Easy") return `${base} bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80`;
  if (difficulty === "Medium") return `${base} bg-amber-50 text-amber-900 ring-1 ring-amber-200/80`;
  return `${base} bg-rose-50 text-rose-800 ring-1 ring-rose-200/80`;
}

export default function TeacherProblemList() {
  const { id, batchId: batchIdParam } = useParams();
  const batchId = id ?? batchIdParam;
  const [rawOutline, setRawOutline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchStudents, setBatchStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [standingsLoading, setStandingsLoading] = useState(true);
  const [openTopics, setOpenTopics] = useState({});
  const [openSubtopics, setOpenSubtopics] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [standingsModal, setStandingsModal] = useState(null);
  const [boardModal, setBoardModal] = useState(null);

  useEffect(() => {
    if (!batchId) return;

    // Load outline first so the page renders immediately
    axiosClient.get(`/assignment/batch-outline/${batchId}`)
      .then((res) => setRawOutline(res.data?.outline ?? []))
      .catch((err) => handleError(err.response?.data?.msg ?? "Failed to load problem list"))
      .finally(() => setLoading(false));

    // Load solve-status in the background — only needed for standings buttons
    axiosClient.get(`/analytics/batch/${batchId}/solve-status`)
      .then((res) => {
        setBatchStudents(res.data?.students ?? []);
        setStatusMap(res.data?.statuses ?? {});
      })
      .catch((err) => console.error("Error fetching solve status", err))
      .finally(() => setStandingsLoading(false));
  }, [batchId]);

  const data = useMemo(() => {
    if (!rawOutline.length) return [];
    const normalized = structuredClone(rawOutline);
    normalizeOutlineShape(normalized);
    recomputeAll(normalized);
    return normalized;
  }, [rawOutline]);


  const solveMatrix = useMemo(
    () => buildRealSolveMatrix(data, batchStudents, statusMap),
    [data, batchStudents, statusMap]
  );

  const toggleTopic = (topicId) => setOpenTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  const toggleSubtopic = (topicId, subtopicId) => {
    const key = `${topicId}-${subtopicId}`;
    setOpenSubtopics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const problemVisible = (p) => {
    const q = searchQuery.trim().toLowerCase();
    if (q && !String(p.name).toLowerCase().includes(q)) return false;
    if (difficultyFilter !== "all" && p.difficulty !== difficultyFilter) return false;
    return true;
  };



  return (
    <div className="mt-1 min-h-0 bg-gradient-to-b from-slate-50/80 to-white pb-8 text-slate-900">
      <div className="border-b border-slate-200/90 bg-white/95 px-4 py-3 shadow-sm sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-700">
            Batch standings
          </p>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Problem list
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
        {/* ADDED: loading spinner shown while the outline is being fetched */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
            Loading problem list…
          </div>
        )}

        {/* ADDED: empty state shown after a successful fetch with no assignments yet */}
        {!loading && data.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-600">No problems assigned to this batch yet.</p>
            <p className="mt-1 text-xs text-slate-400">Assign problems from the Content tab to see them here.</p>
          </div>
        )}

        {!loading && data.length > 0 && (
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
              <label htmlFor="difficulty-filter-teacher" className="shrink-0 text-[11px] font-medium text-slate-500">
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
              <LayoutGrid className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              <span>
                <span className="font-semibold tabular-nums text-slate-800">{data.length}</span> topics
              </span>
            </p>
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-sm ring-1 ring-slate-100">
            {data.map((topic, tIndex) => (
              <div key={topic.id} className={tIndex > 0 ? "border-t border-slate-100" : ""}>
                <div
                  className="flex cursor-pointer items-center justify-between gap-3 bg-gradient-to-r from-slate-50/90 to-white px-4 py-3.5 transition-colors hover:from-slate-100/80 sm:px-5 sm:py-4"
                  onClick={() => toggleTopic(topic.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTopic(topic.id); } }}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {openTopics[topic.id]
                      ? <ChevronDown size={20} className="shrink-0 text-slate-500" aria-hidden />
                      : <ChevronRight size={20} className="shrink-0 text-slate-500" aria-hidden />
                    }
                    <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{topic.title}</h2>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    {(topic.subtopics ?? []).length} subtopics · {(topic.subtopics ?? []).reduce((a, c) => a + (c.problems?.length ?? 0), 0)} problems
                  </span>
                </div>

                {openTopics[topic.id] && (
                  <div className="space-y-1 border-t border-slate-100 bg-white px-3 py-3 sm:px-5 sm:py-4">
                    {!(topic.subtopics ?? []).length ? (
                      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600">
                        No subtopics under this topic yet. Add subtopics in the{" "}
                        <strong className="text-slate-800">Content</strong> tab, then assign problems.
                      </p>
                    ) : (
                      topic.subtopics.map((subtopic, sIndex) => {
                        const subProblems = subtopic.problems ?? [];
                        const visibleProblems = subProblems.filter(problemVisible);

                        return (
                          <div key={subtopic.id} className="rounded-xl border border-slate-100 bg-slate-50/40">
                            <div
                              className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-slate-100/60 sm:px-4 sm:py-3"
                              onClick={() => toggleSubtopic(topic.id, subtopic.id)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSubtopic(topic.id, subtopic.id); } }}
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-2">
                                {openSubtopics[`${topic.id}-${subtopic.id}`]
                                  ? <ChevronDown size={16} className="shrink-0 text-slate-500" aria-hidden />
                                  : <ChevronRight size={16} className="shrink-0 text-slate-500" aria-hidden />
                                }
                                <h3 className="truncate text-sm font-semibold text-slate-800 sm:text-[15px]">
                                  {subtopic.title}
                                </h3>
                                
                              </div>
                              <div className="flex shrink-0 flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (subProblems.length > 0) setBoardModal({ tIndex, sIndex });
                                  }}
                                  disabled={subProblems.length === 0 || standingsLoading}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                                >
                                  <LayoutGrid className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                  Class standings
                                </button>
                                <span className="text-xs font-medium text-sky-800">
                                  {subProblems.length} problems
                                </span>
                              </div>
                            </div>

                            {openSubtopics[`${topic.id}-${subtopic.id}`] && (
                              <div className="border-t border-slate-100 bg-white px-2 pb-3 pt-1 sm:px-3 sm:pb-4">
                                {visibleProblems.length === 0 ? (
                                  <p className="py-6 text-center text-sm text-slate-500">
                                    {subProblems.length === 0
                                      ? "No problems in this subtopic."
                                      : "No problems match your search or filters."}
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto overflow-hidden rounded-lg border border-slate-200/90 shadow-inner">
                                    <table className="w-full min-w-[320px] border-collapse text-sm">
                                      <thead>
                                        <tr className="bg-slate-100/90 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                          <th className="px-3 py-2.5 sm:px-4">Problem</th>
                                          <th className="px-3 py-2.5 sm:w-28">Platform</th>
                                          <th className="px-3 py-2.5 sm:w-32">Difficulty</th>
                                          <th className="px-3 py-2.5 sm:w-28">Practice</th>
                                          <th className="px-3 py-2.5 text-right sm:w-36">Class</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {subProblems.map((p, pIndex) => {
                                          if (!problemVisible(p)) return null;
                                          const pk = problemStandingsKey(tIndex, sIndex, pIndex, p.name);
                                          const cell = solveMatrix.get(pk);
                                          return (
                                            <tr key={pIndex} className="bg-white transition-colors hover:bg-slate-50/90">
                                              <td className="px-3 py-2.5 font-medium text-slate-900 sm:px-4 sm:py-3">{p.name}</td>
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
                                              <td className="px-3 py-2.5 text-right sm:py-3">
                                                <button
                                                  type="button"
                                                  onClick={() => setStandingsModal({ tIndex, sIndex, pIndex, problem: p, cell })}
                                                  disabled={standingsLoading}
                                                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-900 hover:bg-sky-100 disabled:opacity-50 disabled:cursor-wait"
                                                >
                                                  <Users className="h-3.5 w-3.5" />
                                                  {standingsLoading ? "…" : cell ? `${cell.solvedCount}/${cell.totalStudents}` : "—"}
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

      <SubtopicStandingsModal
        boardModal={boardModal}
        setBoardModal={setBoardModal}
        data={data}
        solveMatrix={solveMatrix}
        batchStudents={batchStudents}
      />

      <ProblemStandingsModal
        standingsModal={standingsModal}
        setStandingsModal={setStandingsModal}
      />
    </div>
  );
}
