import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import axiosClient from "../utils/axiosClient";

const diffBadge = (d) => {
  const base = "text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap";
  if (d === "EASY")   return `${base} bg-emerald-100 text-emerald-700`;
  if (d === "MEDIUM") return `${base} bg-amber-100 text-amber-700`;
  return `${base} bg-rose-100 text-rose-700`;
};

// Cycles through accent colors per topic
const TOPIC_ACCENTS = [
  "border-l-4 border-sky-400",
  "border-l-4 border-violet-400",
  "border-l-4 border-amber-400",
  "border-l-4 border-rose-400",
  "border-l-4 border-teal-400",
  "border-l-4 border-orange-400",
];

export default function BatchTable() {
  const [problems, setProblems] = useState([]);
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [totals,   setTotals]   = useState({});
  const [loading,  setLoading]  = useState(true);

  const [rollFilter,       setRollFilter]       = useState("");
  const [textFilter,       setTextFilter]       = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const { id: batchId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axiosClient.get(`/analytics/batch/${batchId}/standings`);
        setProblems(res.data.problems);
        setStatuses(res.data.statuses);
        setStudents(res.data.students);
        const totalObj = {};
        res.data.students.forEach((s) => {
          totalObj[s.id] = res.data.problems.filter(
            (p) => res.data.statuses[`${p.assignmentId}_${s.id}`] === "SOLVED"
          ).length;
        });
        setTotals(totalObj);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [batchId]);

  const filteredStudents = students.filter((s) =>
    !rollFilter.trim() ||
    s.studentEnrollmentId?.toLowerCase().includes(rollFilter.toLowerCase())
  );

  const filteredProblems = problems.filter((p) => {
    const matchesText = p.title?.toLowerCase().includes(textFilter.toLowerCase());
    const matchesDiff =
      difficultyFilter === "All" || p.difficulty === difficultyFilter.toUpperCase();
    return matchesText && matchesDiff;
  });

  // Build flat row list with rowspan metadata
  const rows = useMemo(() => {
    // topic → subtopic → problems[]
    const grouped = new Map();
    filteredProblems.forEach((p) => {
      if (!grouped.has(p.topic)) grouped.set(p.topic, new Map());
      const sub = grouped.get(p.topic);
      if (!sub.has(p.subtopic)) sub.set(p.subtopic, []);
      sub.get(p.subtopic).push(p);
    });

    const result = [];
    let topicIndex = 0;
    for (const [topicName, subtopicMap] of grouped) {
      const topicSpan = [...subtopicMap.values()].reduce((s, p) => s + p.length, 0);
      let isFirstTopicRow = true;

      for (const [subtopicName, probs] of subtopicMap) {
        let isFirstSubtopicRow = true;

        for (const problem of probs) {
          result.push({
            problem,
            topicName:    isFirstTopicRow    ? topicName    : null,
            topicSpan:    isFirstTopicRow    ? topicSpan    : 0,
            subtopicName: isFirstSubtopicRow ? subtopicName : null,
            subtopicSpan: isFirstSubtopicRow ? probs.length : 0,
            accentClass:  TOPIC_ACCENTS[topicIndex % TOPIC_ACCENTS.length],
          });
          isFirstTopicRow    = false;
          isFirstSubtopicRow = false;
        }
      }
      topicIndex++;
    }
    return result;
  }, [filteredProblems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Loading standings…
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            placeholder="Filter by roll…"
            value={rollFilter}
            onChange={(e) => setRollFilter(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:outline-none"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            placeholder="Search problem…"
            value={textFilter}
            onChange={(e) => setTextFilter(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:outline-none"
          />
        </div>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:outline-none"
        >
          <option>All</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <span className="ml-auto text-xs text-slate-400">
          {filteredProblems.length} problems · {filteredStudents.length} students
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="border-collapse w-full text-sm" style={{ minWidth: "560px" }}>
            <thead>
              <tr className="bg-sky-50 border-b-2 border-sky-100">
                <th className="sticky left-0 z-20 bg-sky-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 min-w-[130px]">
                  Topic
                </th>
                <th className="sticky left-[130px] z-20 bg-sky-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 min-w-[150px]">
                  Subtopic
                </th>
                <th className="sticky left-[280px] z-20 bg-sky-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 min-w-[200px]">
                  Problem
                </th>
                <th className="bg-sky-50 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 min-w-[80px]">
                  Diff
                </th>
                {filteredStudents.map((s) => (
                  <th key={s.id} className="px-3 py-3 text-center text-xs font-semibold text-slate-500 min-w-[80px]">
                    <button
                      onClick={() => navigate(`/teacher/${batchId}/students/${s.id}`)}
                      className="hover:text-sky-600 hover:underline transition-colors cursor-pointer"
                    >
                      {s.studentEnrollmentId || s.name}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Totals row */}
              <tr className="bg-teal-50 border-b-2 border-teal-100">
                <td className="sticky left-0 z-10 bg-teal-50 px-4 py-2 font-bold text-teal-700 min-w-[130px]">
                  TOTAL
                </td>
                <td className="sticky left-[130px] z-10 bg-teal-50 px-4 py-2 min-w-[150px]" />
                <td className="sticky left-[280px] z-10 bg-teal-50 px-4 py-2 min-w-[200px]" />
                <td className="px-4 py-2 min-w-[80px]" />
                {filteredStudents.map((s) => (
                  <td key={s.id} className="px-3 py-2 text-center min-w-[80px]">
                    <span className="font-bold text-teal-700">{totals[s.id] ?? 0}</span>
                    <span className="text-slate-400 text-[11px]">/{filteredProblems.length}</span>
                  </td>
                ))}
              </tr>

              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4 + filteredStudents.length} className="px-4 py-10 text-center text-slate-400 text-sm">
                    No problems match your filters.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.problem.assignmentId}
                    className="group border-t border-slate-100 hover:bg-sky-50/50 transition-colors"
                  >
                    {/* Topic cell — only on first row of each topic */}
                    {row.topicName !== null && (
                      <td
                        rowSpan={row.topicSpan}
                        className={`sticky left-0 z-10 bg-white px-4 py-2.5 align-top min-w-[130px] font-semibold text-xs text-slate-800 ${row.accentClass}`}
                      >
                        {row.topicName}
                      </td>
                    )}

                    {/* Subtopic cell — only on first row of each subtopic */}
                    {row.subtopicName !== null && (
                      <td
                        rowSpan={row.subtopicSpan}
                        className="sticky left-[130px] z-10 bg-white px-4 py-2.5 align-top min-w-[150px] text-xs text-slate-500 font-medium border-l border-slate-100"
                      >
                        {row.subtopicName}
                      </td>
                    )}

                    {/* Problem */}
                    <td className="sticky left-[280px] z-10 bg-white group-hover:bg-sky-50/50 px-4 py-2.5 min-w-[200px] border-l border-slate-100">
                      <a
                        href={row.problem.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-600 hover:underline text-xs font-medium line-clamp-2 leading-snug"
                      >
                        {row.problem.title}
                      </a>
                    </td>

                    {/* Difficulty */}
                    <td className="px-4 py-2.5 text-center min-w-[80px]">
                      <span className={diffBadge(row.problem.difficulty)}>
                        {row.problem.difficulty}
                      </span>
                    </td>

                    {/* Student cells */}
                    {filteredStudents.map((s) => {
                      const solved = statuses[`${row.problem.assignmentId}_${s.id}`] === "SOLVED";
                      return (
                        <td
                          key={s.id}
                          className={`px-3 py-2.5 text-center min-w-[80px] ${solved ? "bg-emerald-50 group-hover:bg-emerald-100/60" : ""}`}
                        >
                          {solved ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-bold text-xs">
                              ✓
                            </span>
                          ) : (
                            <span className="text-slate-300 text-base">–</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
