import React, { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

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

export default function OverallLeaderboard({ rows }) {
  const [query,      setQuery]      = useState("");
  const [filterRoll, setFilterRoll] = useState("");
  const [sortKey,    setSortKey]    = useState("solved");
  const [sortDir,    setSortDir]    = useState("desc");
  const [page,       setPage]       = useState(1);
  const PER = 10;

  useEffect(() => setPage(1), [query, filterRoll, sortKey, sortDir]);

  const maxSolved = Math.max(...rows.map((r) => r.solved), 1);

  const normalized = useMemo(() => rows.map((r) => ({ ...r, rollStr: String(r.roll ?? "") })), [rows]);

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
    if (sortKey === "name") return dir * a.name.localeCompare(b.name);
    if (sortKey === "roll") return dir * (Number(a.rollStr) - Number(b.rollStr) || a.rollStr.localeCompare(b.rollStr));
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
