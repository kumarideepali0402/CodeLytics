import React, { useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";

const WEEKS = Array.from({ length: 15 }, (_, i) => `Week ${i + 1}`);
const STUDENTS = [
  "2401010001","2401010004","2401010005","2401010007","2401010008",
  "2401010011","2401010018","2401010020","2401010021","2401010022",
  "2401010023","2401010024","2401010026","2401010027","2401010029",
  "2401010030","2401010031","2401010032",
];

const RAW_DATA = WEEKS.map(() => STUDENTS.map(() => Math.floor(Math.random() * 20)));

// Returns Tailwind classes + inline style for bar fill
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
  const [rollFilter,  setRollFilter]  = useState("");
  const [weekFilter,  setWeekFilter]  = useState("");
  const [sortByTotal, setSortByTotal] = useState(false);

  const studentData = useMemo(() =>
    STUDENTS.map((roll, i) => ({
      roll,
      index: i,
      total: RAW_DATA.reduce((sum, row) => sum + row[i], 0),
    })), []);

  const ranks = useMemo(() => {
    const sorted = [...studentData].sort((a, b) => b.total - a.total);
    const map = {};
    sorted.forEach((s, i) => { map[s.roll] = i + 1; });
    return map;
  }, [studentData]);

  const maxTotal = Math.max(...studentData.map((s) => s.total), 1);
  const weekMax  = RAW_DATA.map((row) => Math.max(...row, 1));

  const filteredStudents = useMemo(() => {
    let s = [...studentData];
    if (rollFilter.trim()) s = s.filter((st) => st.roll.includes(rollFilter.trim()));
    if (sortByTotal) s = [...s].sort((a, b) => b.total - a.total);
    return s;
  }, [studentData, rollFilter, sortByTotal]);

  const filteredWeeks = useMemo(() => {
    const all = WEEKS.map((w, i) => ({ week: w, index: i }));
    if (!weekFilter.trim()) return all;
    return all.filter((w) => w.week.toLowerCase().includes(weekFilter.trim().toLowerCase()));
  }, [weekFilter]);

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
                {filteredStudents.map((s) => (
                  <th key={s.roll} className="px-3 py-3 text-center text-xs font-semibold text-slate-500 min-w-[84px]">
                    <div>{s.roll}</div>
                    <div className={`mt-1 mx-auto w-fit px-1.5 py-0.5 rounded text-[10px] ${rankBadge(ranks[s.roll])}`}>
                      #{ranks[s.roll]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Totals row */}
              <tr className="bg-teal-50 border-b-2 border-teal-100">
                <td className="sticky left-0 z-10 bg-teal-50 px-5 py-2.5 font-bold text-teal-700 text-xs uppercase tracking-wide min-w-[110px]">
                  Total
                </td>
                {filteredStudents.map((s) => {
                  const pct = s.total / maxTotal;
                  return (
                    <td key={s.roll} className="px-3 py-2.5 text-center min-w-[84px]">
                      <span className="font-bold text-teal-700 text-sm">{s.total}</span>
                    </td>
                  );
                })}
              </tr>

              {/* Week rows */}
              {filteredWeeks.map((w, rowIndex) => (
                <tr
                  key={w.week}
                  className={`border-t border-slate-100 transition-colors group ${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  <td
                    className={`sticky left-0 z-10 border-l-4 border-sky-300 ${
                      rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"
                    } group-hover:bg-sky-50/60 px-4 py-2.5 min-w-[110px]`}
                  >
                    <span className="text-xs font-semibold text-slate-700">{w.week}</span>
                  </td>
                  {filteredStudents.map((s) => {
                    const val = RAW_DATA[w.index][s.index];
                    const { cls } = cellStyle(val, weekMax[w.index]);
                    return (
                      <td
                        key={`${w.index}-${s.roll}`}
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
