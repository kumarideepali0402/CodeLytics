import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, ExternalLink, ShieldCheck, Search } from "lucide-react";

function difficultyBadge(difficulty) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums";
  if (difficulty === "EASY")   return `${base} bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80`;
  if (difficulty === "MEDIUM") return `${base} bg-amber-50 text-amber-900 ring-1 ring-amber-200/80`;
  return `${base} bg-rose-50 text-rose-800 ring-1 ring-rose-200/80`;
}

function ProgressBar({ completed, total }) {
  const pct = total === 0 ? 0 : (completed / total) * 100;
  return (
    <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200/90">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/**
 * Read-only assignment accordion — mirrors the student sheet UI.
 * Props:
 *   assignments: [{assignmentId, title, link, difficulty, topic, subtopic}]
 *   statuses:    { "assignmentId_studentId": "SOLVED" | other }
 *   studentId:   string
 */
export default function ReadonlyAssignmentSheet({ assignments = [], statuses = {}, studentId }) {
  const [openTopics,   setOpenTopics]   = useState({});
  const [openSubtopic, setOpenSubtopic] = useState({});
  const [searchQuery,  setSearchQuery]  = useState("");
  const [diffFilter,   setDiffFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Group flat list → topic → subtopic → problems[]
  const grouped = useMemo(() => {
    const topicMap = new Map();
    assignments.forEach((p) => {
      if (!topicMap.has(p.topic)) topicMap.set(p.topic, new Map());
      const subMap = topicMap.get(p.topic);
      if (!subMap.has(p.subtopic)) subMap.set(p.subtopic, []);
      subMap.get(p.subtopic).push(p);
    });
    return topicMap;
  }, [assignments]);

  const isSolved = (assignmentId) =>
    statuses[`${assignmentId}_${studentId}`] === "SOLVED";

  const isVisible = (p) => {
    const q = searchQuery.trim().toLowerCase();
    if (q && !p.title.toLowerCase().includes(q)) return false;
    if (diffFilter !== "all" && p.difficulty !== diffFilter) return false;
    if (statusFilter === "solved"   && !isSolved(p.assignmentId)) return false;
    if (statusFilter === "unsolved" &&  isSolved(p.assignmentId)) return false;
    return true;
  };

  const toggleTopic   = (t)    => setOpenTopics((p)   => ({ ...p, [t]: !p[t] }));
  const toggleSub     = (key)  => setOpenSubtopic((p) => ({ ...p, [key]: !p[key] }));

  if (assignments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center">
        <p className="text-sm text-slate-500">No assignments in this batch yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
        <div className="relative flex-1 min-w-[10rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search problems…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-2.5 text-xs outline-none transition focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-200"
          />
        </div>
        <select
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-6 text-xs font-medium text-slate-800 shadow-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200"
        >
          <option value="all">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-6 text-xs font-medium text-slate-800 shadow-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200"
        >
          <option value="all">All Statuses</option>
          <option value="solved">Solved</option>
          <option value="unsolved">Unsolved</option>
        </select>
      </div>

      {/* Accordion */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100">
        {[...grouped.entries()].map(([topic, subMap], tIdx) => {
          const topicProblems = [...subMap.values()].flat();
          const topicSolved   = topicProblems.filter((p) => isSolved(p.assignmentId)).length;
          return (
            <div key={topic} className={tIdx > 0 ? "border-t border-slate-100" : ""}>
              {/* Topic header */}
              <div
                className="flex cursor-pointer items-center justify-between gap-3 bg-gradient-to-r from-slate-50/90 to-white px-4 py-3.5 transition-colors hover:from-slate-100/80 sm:px-5"
                onClick={() => toggleTopic(topic)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTopic(topic); } }}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  {openTopics[topic]
                    ? <ChevronDown size={20} className="shrink-0 text-slate-500" />
                    : <ChevronRight size={20} className="shrink-0 text-slate-500" />}
                  <h2 className="truncate text-base font-semibold text-slate-900">{topic}</h2>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <ProgressBar completed={topicSolved} total={topicProblems.length} />
                  <span className="w-14 text-right text-sm font-semibold tabular-nums text-slate-600">
                    {topicSolved}/{topicProblems.length}
                  </span>
                </div>
              </div>

              {openTopics[topic] && (
                <div className="space-y-1 border-t border-slate-100 bg-white px-3 py-3 sm:px-5 sm:py-4">
                  {[...subMap.entries()].map(([subtopic, probs], sIdx) => {
                    const subKey     = `${topic}-${sIdx}`;
                    const subSolved  = probs.filter((p) => isSolved(p.assignmentId)).length;
                    const visible    = probs.filter(isVisible);
                    return (
                      <div key={subtopic} className="rounded-xl border border-slate-100 bg-slate-50/40">
                        {/* Subtopic header */}
                        <div
                          className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-slate-100/60 sm:px-4"
                          onClick={() => toggleSub(subKey)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSub(subKey); } }}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            {openSubtopic[subKey]
                              ? <ChevronDown size={16} className="shrink-0 text-slate-500" />
                              : <ChevronRight size={16} className="shrink-0 text-slate-500" />}
                            <h3 className="truncate text-sm font-semibold text-slate-800">{subtopic}</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <ProgressBar completed={subSolved} total={probs.length} />
                            <span className="w-14 text-right text-xs font-semibold tabular-nums text-slate-600">
                              {subSolved}/{probs.length}
                            </span>
                          </div>
                        </div>

                        {openSubtopic[subKey] && (
                          <div className="border-t border-slate-100 bg-white px-2 pb-3 pt-1 sm:px-3 sm:pb-4">
                            {visible.length === 0 ? (
                              <p className="py-6 text-center text-sm text-slate-500">No problems match your filters.</p>
                            ) : (
                              <div className="overflow-x-auto overflow-hidden rounded-lg border border-slate-200/90 shadow-inner">
                                <table className="w-full min-w-[320px] border-collapse text-sm">
                                  <thead>
                                    <tr className="bg-slate-100/90 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                      <th className="w-12 px-2 py-2.5 text-center">Done</th>
                                      <th className="px-3 py-2.5 sm:px-4">Problem</th>
                                      <th className="px-3 py-2.5 sm:w-32">Difficulty</th>
                                      <th className="px-3 py-2.5 sm:w-28">Link</th>
                                      <th className="w-16 px-2 py-2.5 text-center">Verified</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {probs.map((p) => {
                                      if (!isVisible(p)) return null;
                                      const solved = isSolved(p.assignmentId);
                                      return (
                                        <tr
                                          key={p.assignmentId}
                                          className={`bg-white transition-colors hover:bg-slate-50/90 ${solved ? "bg-emerald-50/40" : ""}`}
                                        >
                                          <td className="px-2 py-2.5 text-center align-middle sm:py-3">
                                            <div className={`mx-auto h-4 w-4 rounded border-2 flex items-center justify-center ${solved ? "border-emerald-500 bg-emerald-500" : "border-slate-300"}`}>
                                              {solved && <span className="text-white text-[9px] font-bold">✓</span>}
                                            </div>
                                          </td>
                                          <td className="px-3 py-2.5 font-medium sm:px-4 sm:py-3 text-slate-900">
                                            {p.title}
                                          </td>
                                          <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                            <span className={difficultyBadge(p.difficulty)}>
                                              {p.difficulty.charAt(0) + p.difficulty.slice(1).toLowerCase()}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                            {p.link ? (
                                              <a
                                                href={p.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                                              >
                                                Open <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                                              </a>
                                            ) : (
                                              <span className="text-slate-300">—</span>
                                            )}
                                          </td>
                                          <td className="px-2 py-2.5 text-center align-middle sm:py-3">
                                            {solved ? (
                                              <ShieldCheck className="mx-auto h-4 w-4 text-emerald-500" />
                                            ) : (
                                              <span className="text-slate-300">—</span>
                                            )}
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
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
