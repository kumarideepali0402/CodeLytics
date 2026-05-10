import React, { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

/* ── Sample data ─────────────────────────────────────────────────────────── */
const weeklyTop3 = [
  { name: "Liam Carter",    roll: "2401010031", solved: 68 },
  { name: "Emma Johnson",   roll: "2401010127", solved: 65 },
  { name: "Noah Smith",     roll: "2401010144", solved: 63 },
];
const allTimeTop3 = [
  { name: "Olivia Brown",   roll: "2401010024", solved: 297 },
  { name: "Aiden Davis",    roll: "2401010109", solved: 296 },
  { name: "Sophia Wilson",  roll: "240101013",  solved: 292 },
];
const weeklyHistory = [
  { week: "Week 5", data: [
    { name: "Aiden Davis",    roll: "2401010109", solved: 61 },
    { name: "Lucas Martinez", roll: "2401010050", solved: 54 },
    { name: "Mia Anderson",   roll: "2401010076", solved: 42 },
  ]},
  { week: "Week 4", data: [
    { name: "Lucas Martinez", roll: "2401010050", solved: 58 },
    { name: "Ella Thomas",    roll: "2401010114", solved: 50 },
    { name: "Liam Carter",    roll: "2401010031", solved: 38 },
  ]},
  { week: "Week 3", data: [
    { name: "Sophia Wilson",  roll: "2401010032", solved: 40 },
    { name: "Noah Smith",     roll: "2401010076", solved: 33 },
    { name: "Ethan Lee",      roll: "2401010112", solved: 24 },
  ]},
  { week: "Week 2", data: [
    { name: "Liam Carter",    roll: "2401010031", solved: 68 },
    { name: "Emma Johnson",   roll: "2401010127", solved: 65 },
    { name: "Noah Smith",     roll: "2401010144", solved: 63 },
  ]},
  { week: "Week 1", data: [
    { name: "Oliver King",    roll: "2401010093", solved: 36 },
    { name: "Ava Scott",      roll: "2401010089", solved: 31 },
    { name: "Emma Johnson",   roll: "2401010127", solved: 31 },
  ]},
];
const allTimeFull = [
  { name: "Olivia Brown",   roll: "2401010024", solved: 297 },
  { name: "Aiden Davis",    roll: "2401010109", solved: 296 },
  { name: "Sophia Wilson",  roll: "240101013",  solved: 292 },
  { name: "Liam Carter",    roll: "2401010031", solved: 282 },
  { name: "Ethan Lee",      roll: "2401010112", solved: 274 },
  { name: "Lucas Martinez", roll: "2401010050", solved: 260 },
  { name: "Mia Anderson",   roll: "2401010200", solved: 240 },
  { name: "Noah Smith",     roll: "2401010201", solved: 230 },
  { name: "Sophia Wilson",  roll: "2401010032", solved: 220 },
  { name: "Mia Anderson",   roll: "2401010076", solved: 210 },
  { name: "Olivia King",    roll: "2401010999", solved: 190 },
];

/* ── Constants ───────────────────────────────────────────────────────────── */
const RANK = [
  { bar: "bg-amber-400",  ring: "ring-amber-300",  avatar: "bg-amber-50  text-amber-600",  label: "text-amber-600",  h: 88, crown: true  },
  { bar: "bg-slate-400",  ring: "ring-slate-300",  avatar: "bg-slate-100 text-slate-600",  label: "text-slate-500",  h: 64, crown: false },
  { bar: "bg-orange-400", ring: "ring-orange-300", avatar: "bg-orange-50 text-orange-600", label: "text-orange-600", h: 48, crown: false },
];
const MEDAL = ["🥇", "🥈", "🥉"];
// visual order: silver | gold | bronze
const PODIUM_ORDER = [1, 0, 2];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const highlight = (text, q) => {
  if (!q) return text;
  const re = new RegExp(`(${escapeRe(q)})`, "gi");
  return text.split(re).map((p, i) =>
    re.test(p) ? <mark key={i} className="bg-amber-100 rounded px-0.5">{p}</mark> : p
  );
};

const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

/* ── Podium ──────────────────────────────────────────────────────────────── */
function Podium({ title, data }) {
  return (
    <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm px-6 pt-5 pb-0 overflow-hidden">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center mb-5">
        {title}
      </p>

      <div className="flex items-end justify-center gap-3">
        {PODIUM_ORDER.map((i) => {
          const s = data?.[i];
          const r = RANK[i];
          return (
            <div key={i} className="flex flex-col items-center w-[88px]">
              {/* Crown for 1st */}
              {r.crown && <span className="text-xl leading-none mb-1">👑</span>}
              {/* Name & score */}
              <p className="text-[11px] font-semibold text-slate-700 text-center leading-tight truncate w-full px-1">
                {s?.name}
              </p>
              <p className={`text-[11px] font-bold ${r.label} mb-2`}>{s?.solved}</p>
              {/* Bar */}
              <div
                className={`w-full ${r.bar} rounded-t-lg flex items-center justify-center shadow-inner`}
                style={{ height: r.h }}
              >
                <span className="text-white font-extrabold text-base">{i + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Weekly stack ────────────────────────────────────────────────────────── */
const CARD_BG = [
  "bg-amber-50  border-amber-200  text-amber-700",
  "bg-slate-50  border-slate-200  text-slate-600",
  "bg-orange-50 border-orange-200 text-orange-700",
];

function WeeklyStack({ weeks, defaultCount = 3 }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? weeks : weeks.slice(0, defaultCount);

  return (
    <div className="space-y-3">
      {visible.map((w, ix) => (
        <div key={ix} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Week label */}
          <div className="px-4 py-2 bg-sky-50 border-b border-sky-100">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {w.week}
            </span>
          </div>

          {/* 3 entries */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {w.data.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                {/* Medal + rank number */}
                <div className={`w-9 h-9 rounded-xl border flex flex-col items-center justify-center shrink-0 ${CARD_BG[i]}`}>
                  <span className="text-base leading-none">{MEDAL[i]}</span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{s.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{s.roll}</p>
                </div>
                {/* Solved count */}
                <span className="text-sm font-bold text-teal-600 shrink-0">{s.solved}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-center pt-1">
        <button
          onClick={() => setShowAll((v) => !v)}
          className="px-5 py-2 text-sm font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          {showAll ? "Show less" : `View all ${weeks.length} weeks`}
        </button>
      </div>
    </div>
  );
}

/* ── All-time table ──────────────────────────────────────────────────────── */
function AllTimeTable({ rows }) {
  const [query,      setQuery]      = useState("");
  const [filterRoll, setFilterRoll] = useState("");
  const [sortKey,    setSortKey]    = useState("solved");
  const [sortDir,    setSortDir]    = useState("desc");
  const [page,       setPage]       = useState(1);
  const PER = 10;

  useEffect(() => setPage(1), [query, filterRoll, sortKey, sortDir]);

  const maxSolved = Math.max(...rows.map((r) => r.solved), 1);

  const normalized = useMemo(() => rows.map((r) => ({ ...r, rollStr: String(r.roll) })), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalized.filter(
      (r) =>
        (!q || r.name.toLowerCase().includes(q) || r.rollStr.includes(q)) &&
        (!filterRoll || r.rollStr.includes(filterRoll.trim()))
    );
  }, [normalized, query, filterRoll]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name")   return dir * a.name.localeCompare(b.name);
    if (sortKey === "roll")   return dir * (Number(a.rollStr) - Number(b.rollStr) || a.rollStr.localeCompare(b.rollStr));
    return dir * (a.solved - b.solved);
  }), [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER));
  const pageRows   = sorted.slice((page - 1) * PER, page * PER);

  const toggleSort = (k) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const Pill = ({ k, label }) => (
    <button
      onClick={() => toggleSort(k)}
      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
        sortKey === k
          ? "bg-sky-100 text-sky-700 ring-1 ring-sky-200"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {label} {sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </button>
  );

  const rankStyle = (rank) => {
    if (rank === 1) return "bg-amber-100 text-amber-700 ring-1 ring-amber-300";
    if (rank === 2) return "bg-slate-100 text-slate-600 ring-1 ring-slate-300";
    if (rank === 3) return "bg-orange-100 text-orange-700 ring-1 ring-orange-300";
    return "";
  };

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
      {/* Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or roll…"
            className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:outline-none w-52"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={filterRoll}
            onChange={(e) => setFilterRoll(e.target.value)}
            placeholder="Filter roll…"
            className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:outline-none w-36"
          />
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-slate-400">Sort:</span>
          <Pill k="solved" label="Solved" />
          <Pill k="name"   label="Name"   />
          <Pill k="roll"   label="Roll"   />
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-sky-50 border-b-2 border-sky-100">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 w-14">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Roll</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 min-w-[160px]">Solved</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center text-slate-400 text-sm">No results.</td>
            </tr>
          ) : pageRows.map((r, idx) => {
            const rank = (page - 1) * PER + idx + 1;
            const rs = rankStyle(rank);
            return (
              <tr
                key={r.roll + idx}
                className={`border-t border-slate-100 hover:bg-sky-50/40 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
              >
                <td className="px-4 py-3">
                  {rank <= 3
                    ? <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${rs}`}>{rank}</span>
                    : <span className="text-slate-400 text-xs pl-1">{rank}</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0">
                      {initials(r.name)}
                    </div>
                    <span className="font-medium text-slate-700">{highlight(r.name, query)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{highlight(r.rollStr, query)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-400 rounded-full"
                        style={{ width: `${(r.solved / maxSolved) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-teal-700 text-sm w-10 text-right">{r.solved}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/60">
        <span className="text-xs text-slate-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-slate-500 w-14 text-center">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function LeaderboardDashboard() {
  const [active, setActive] = useState("weekly");

  return (
    <div className="p-6 space-y-6">
      {/* Podiums */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Podium title="This week's top 3" data={weeklyTop3} />
        <Podium title="All-time top 3"    data={allTimeTop3} />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[{ key: "weekly", label: "Weekly" }, { key: "alltime", label: "All-Time" }].map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              active === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {active === "weekly"
        ? <WeeklyStack weeks={weeklyHistory} />
        : <AllTimeTable rows={allTimeFull} />
      }
    </div>
  );
}
