import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Search, ArrowUpDown } from "lucide-react";
import axiosClient from "../utils/axiosClient";

const cellStyle = (val, weekMax) => {
  if (val == null) return { cls: "text-slate-300" };
  if (val === 0)   return { cls: "bg-rose-50 text-rose-400" };
  const pct = weekMax > 0 ? val / weekMax : 0;
  if (pct >= 0.75) return { cls: "bg-emerald-50 text-emerald-700 font-semibold" };
  if (pct >= 0.4)  return { cls: "bg-amber-50 text-amber-700" };
  return { cls: "text-slate-500" };
};

const rankBadge = (rank) => {
  if (rank === 1) return "bg-amber-100 text-amber-700 ring-1 ring-amber-300";
  if (rank === 2) return "bg-slate-100 text-slate-600 ring-1 ring-slate-300";
  if (rank === 3) return "bg-orange-100 text-orange-700 ring-1 ring-orange-300";
  return "bg-slate-50 text-slate-400";
};

export default function TableWeekly() {
  const { id, batchId: batchIdParam } = useParams();
  const batchId = id ?? batchIdParam;
  const [weeks, setWeeks]       = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [rollFilter,  setRollFilter]  = useState("");
  const [weekFilter,  setWeekFilter]  = useState("");
  const [sortByTotal, setSortByTotal] = useState(false);

  useEffect(() => {
    if (!batchId) return;
    setLoading(true);
    axiosClient
      .get(`/analytics/batch/${batchId}/weekly-progress`)
      .then((res) => {
        setWeeks(res.data.weeks ?? []);
        setStudents(res.data.students ?? []);
      })
      .catch((err) => {
        console.error("[TableWeekly] fetch error", err);
        setError("Failed to load weekly progress.");
      })
      .finally(() => setLoading(false));
  }, [batchId]);

  const ranks = useMemo(() => {
    const map = {};
    [...students]
      .sort((a, b) => b.total - a.total)
      .forEach((s, i) => { map[s.enrollmentId ?? s.studentId] = i + 1; });
    return map;
  }, [students]);

  const maxTotal = Math.max(...students.map((s) => s.total), 1);
  const weekMax  = weeks.map((_, wi) =>
    Math.max(...students.map((s) => s.weeklySolved[wi] ?? 0), 1)
  );

  const filteredStudents = useMemo(() => {
    let s = [...students];
    if (rollFilter.trim())
      s = s.filter((st) => (st.enrollmentId ?? "").includes(rollFilter.trim()));
    if (sortByTotal) s = s.sort((a, b) => b.total - a.total);
    return s;
  }, [students, rollFilter, sortByTotal]);

  const filteredWeeks = useMemo(() => {
    if (!weekFilter.trim()) return weeks.map((w, i) => ({ ...w, index: i }));
    return weeks
      .map((w, i) => ({ ...w, index: i }))
      .filter((w) => w.label.toLowerCase().includes(weekFilter.trim().toLowerCase()));
  }, [weeks, weekFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
        Loading weekly progress…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24 text-rose-400 text-sm">
        {error}
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
            placeholder="Filter by week…"
            value={weekFilter}
            onChange={(e) => setWeekFilter(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setSortByTotal((p) => !p)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
            sortByTotal
              ? "bg-teal-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortByTotal ? "Sorted by Total" : "Sort by Total"}
        </button>
        <span className="ml-auto text-xs text-slate-400">
          {filteredWeeks.length} weeks · {filteredStudents.length} students
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="border-collapse w-full text-sm" style={{ minWidth: "500px" }}>
            <thead>
              <tr className="bg-sky-50 border-b-2 border-sky-100">
                <th className="sticky left-0 z-20 bg-sky-50 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 min-w-[110px]">
                  Week
                </th>
                {filteredStudents.map((s) => {
                  const key = s.enrollmentId ?? s.studentId;
                  return (
                    <th key={s.studentId} className="px-3 py-3 text-center text-xs font-semibold text-slate-500 min-w-[84px]">
                      <div>{s.enrollmentId }</div>
                      <div>{ s.name}</div>
                      <div className={`mt-1 mx-auto w-fit px-1.5 py-0.5 rounded text-[10px] ${rankBadge(ranks[key])}`}>
                        #{ranks[key]}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Totals row */}
              <tr className="bg-teal-50 border-b-2 border-teal-100">
                <td className="sticky left-0 z-10 bg-teal-50 px-5 py-2.5 font-bold text-teal-700 text-xs uppercase tracking-wide min-w-[110px]">
                  Total
                </td>
                {filteredStudents.map((s) => (
                  <td key={s.studentId} className="px-3 py-2.5 text-center min-w-[84px]">
                    <span className="font-bold text-teal-700 text-sm">{s.total}</span>
                  </td>
                ))}
              </tr>

              {/* Week rows */}
              {filteredWeeks.map((w, rowIndex) => (
                <tr
                  key={w.weekStart}
                  className={`border-t border-slate-100 transition-colors group ${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  <td
                    className={`sticky left-0 z-10 border-l-4 border-sky-300 ${
                      rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"
                    } group-hover:bg-sky-50/60 px-4 py-2.5 min-w-[110px]`}
                  >
                    <span className="text-xs font-semibold text-slate-700">{w.label}</span>
                  </td>
                  {filteredStudents.map((s) => {
                    const val = s.weeklySolved[w.index] ?? 0;
                    const { cls } = cellStyle(val, weekMax[w.index]);
                    return (
                      <td
                        key={`${w.index}-${s.studentId}`}
                        className={`px-3 py-2.5 text-center text-xs min-w-[84px] ${cls}`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-slate-100 bg-slate-50/60">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Key</span>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-700">
            <span className="w-3 h-3 rounded-sm bg-emerald-100 inline-block" /> High (≥ 75%)
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-amber-700">
            <span className="w-3 h-3 rounded-sm bg-amber-100 inline-block" /> Mid (40–74%)
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-3 h-3 rounded-sm bg-slate-100 inline-block" /> Low
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-rose-400">
            <span className="w-3 h-3 rounded-sm bg-rose-100 inline-block" /> Zero
          </span>
        </div>
      </div>
    </div>
  );
}
