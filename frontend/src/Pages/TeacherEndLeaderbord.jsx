import React, { useEffect, useMemo, useState } from "react";

/* ================= SAMPLE DATA (replace with real data) ================= */
const weeklyTop3 = [
  { name: "Liam Carter", roll: "2401010031", solved: 68 },
  { name: "Emma Johnson", roll: "2401010127", solved: 65 },
  { name: "Noah Smith", roll: "2401010144", solved: 63 },
];

const allTimeTop3 = [
  { name: "Olivia Brown", roll: "2401010024", solved: 297 },
  { name: "Aiden Davis", roll: "2401010109", solved: 296 },
  { name: "Sophia Wilson", roll: "240101013", solved: 292 },
];

/* weeklyHistory: latest week first */
const weeklyHistory = [
  {
    week: "Week 5",
    data: [
      { rank: "🥇", name: "Aiden Davis", roll: "2401010109", solved: 61 },
      { rank: "🥈", name: "Lucas Martinez", roll: "2401010050", solved: 54 },
      { rank: "🥉", name: "Mia Anderson", roll: "2401010076", solved: 42 },
    ],
  },
  {
    week: "Week 4",
    data: [
      { rank: "🥇", name: "Lucas Martinez", roll: "2401010050", solved: 58 },
      { rank: "🥈", name: "Ella Thomas", roll: "2401010114", solved: 50 },
      { rank: "🥉", name: "Liam Carter", roll: "2401010031", solved: 38 },
    ],
  },
  {
    week: "Week 3",
    data: [
      { rank: "🥇", name: "Sophia Wilson", roll: "2401010032", solved: 40 },
      { rank: "🥈", name: "Noah Smith", roll: "2401010076", solved: 33 },
      { rank: "🥉", name: "Ethan Lee", roll: "2401010112", solved: 24 },
    ],
  },
  {
    week: "Week 2",
    data: [
      { rank: "🥇", name: "Liam Carter", roll: "2401010031", solved: 68 },
      { rank: "🥈", name: "Emma Johnson", roll: "2401010127", solved: 65 },
      { rank: "🥉", name: "Noah Smith", roll: "2401010144", solved: 63 },
    ],
  },
  {
    week: "Week 1",
    data: [
      { rank: "🥇", name: "Oliver King", roll: "2401010093", solved: 36 },
      { rank: "🥈", name: "Ava Scott", roll: "2401010089", solved: 31 },
      { rank: "🥉", name: "Emma Johnson", roll: "2401010127", solved: 31 },
    ],
  },
];

/* full all-time list (replace with your full dataset) */
const allTimeFull = [
  { name: "Olivia Brown", roll: "2401010024", solved: 297 },
  { name: "Aiden Davis", roll: "2401010109", solved: 296 },
  { name: "Sophia Wilson", roll: "240101013", solved: 292 },
  { name: "Liam Carter", roll: "2401010031", solved: 282 },
  { name: "Ethan Lee", roll: "2401010112", solved: 274 },
  { name: "Lucas Martinez", roll: "2401010050", solved: 260 },
  { name: "Mia Anderson", roll: "2401010200", solved: 240 },
  { name: "Noah Smith", roll: "2401010201", solved: 230 },
  { name: "Sophia Wilson", roll: "2401010032", solved: 220 },
  { name: "Mia Anderson", roll: "2401010076", solved: 210 },
  { name: "Olivia King", roll: "2401010999", solved: 190 },
];

/* ================= Helpers ================= */
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const highlightMatch = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
};

/* ================= Podium Component ================= */
function Podium({ title, data, accent }) {
  const heights = { 1: 72, 2: 56, 3: 44 }; // visual only

  return (
    <div className="flex flex-col items-center px-3 py-2">
      <div className="text-sm font-semibold text-indigo-700 mb-2">{title}</div>

      <div className="flex items-end justify-center gap-4">
        {/* 2nd */}
        <div className="flex flex-col items-center w-28">
          <div className="text-center mb-1 break-words">
            <div className="font-medium text-sm">{data?.[1]?.name}</div>
            <div className="text-xs text-indigo-700">{data?.[1]?.roll}</div>
            <div className="text-xs text-gray-700 font-semibold">{data?.[1]?.solved}</div>
          </div>
          <div
            className={`w-full rounded-t-md flex items-center justify-center shadow-md ${accent[2]}`}
            style={{ height: `${heights[2]}px` }}
          >
            <span className="text-white font-bold">2</span>
          </div>
        </div>

        {/* 1st */}
        <div className="flex flex-col items-center w-28">
          <div className="text-center mb-1 break-words">
            <div className="font-medium text-sm">{data?.[0]?.name}</div>
            <div className="text-xs text-indigo-700">{data?.[0]?.roll}</div>
            <div className="text-xs text-gray-700 font-semibold">{data?.[0]?.solved}</div>
          </div>
          <div
            className={`w-full rounded-t-md flex items-center justify-center transform-gpu ${accent[1]} shadow-xl`}
            style={{ height: `${heights[1]}px` }}
          >
            <span className="text-white font-bold">1</span>
          </div>
        </div>

        {/* 3rd */}
        <div className="flex flex-col items-center w-28">
          <div className="text-center mb-1 break-words">
            <div className="font-medium text-sm">{data?.[2]?.name}</div>
            <div className="text-xs text-indigo-700">{data?.[2]?.roll}</div>
            <div className="text-xs text-gray-700 font-semibold">{data?.[2]?.solved}</div>
          </div>
          <div
            className={`w-full rounded-t-md flex items-center justify-center shadow-md ${accent[3]}`}
            style={{ height: `${heights[3]}px` }}
          >
            <span className="text-white font-bold">3</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= WeeklyStack (stacked-by-week cards) ================= */
function WeeklyStack({ weeks, defaultCount = 3 }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? weeks : weeks.slice(0, defaultCount);

  return (
    <div className="w-full max-w-[780px] bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-800 to-indigo-700 text-white text-center py-3 font-bold">
        📅 Weekly Leaderboard
      </div>

      <div className="p-4 space-y-4 max-h-[460px] overflow-y-auto">
        {visible.map((w, ix) => (
          <div
            key={ix}
            className="border rounded-lg overflow-hidden bg-gradient-to-b from-white to-blue-50"
          >
            <div className="px-4 py-2 bg-indigo-50 font-semibold">{w.week}</div>

            <div className="p-3 grid grid-cols-12 gap-2 items-center">
              {w.data.map((s, i) => (
                <div
                  key={i}
                  className={`col-span-12 md:col-span-4 p-2 rounded-lg flex items-center gap-3 ${
                    i === 0 ? "bg-yellow-50" : i === 1 ? "bg-gray-50" : "bg-orange-50"
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-lg">
                    {s.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{s.name}</div>
                    <div className="text-xs text-gray-500 truncate">{s.roll}</div>
                  </div>
                  <div className="text-indigo-700 font-bold">{s.solved}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 flex justify-center border-t">
        <button
          onClick={() => setShowAll((v) => !v)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          {showAll ? "Show Less" : "View All Weeks"}
        </button>
      </div>
    </div>
  );
}

/* ================= AllTimeTable (search / filter / sort / pagination) ================= */
function AllTimeTable({ rows }) {
  const [query, setQuery] = useState("");
  const [filterRoll, setFilterRoll] = useState("");
  const [sortKey, setSortKey] = useState("solved");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // reset page when query/filter/sort changes
  useEffect(() => setPage(1), [query, filterRoll, sortKey, sortOrder]);

  // normalize roll to string
  const normalized = useMemo(
    () => rows.map((r) => ({ ...r, rollStr: String(r.roll) })),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalized.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.rollStr.toLowerCase().includes(q);
      const matchesRoll = !filterRoll || r.rollStr.includes(filterRoll.trim());
      return matchesQuery && matchesRoll;
    });
  }, [normalized, query, filterRoll]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortKey === "roll") {
        const na = Number(a.rollStr) || a.rollStr;
        const nb = Number(b.rollStr) || b.rollStr;
        if (typeof na === "number" && typeof nb === "number") {
          return sortOrder === "asc" ? na - nb : nb - na;
        }
        return sortOrder === "asc"
          ? String(na).localeCompare(String(nb))
          : String(nb).localeCompare(String(na));
      }
      // solved
      return sortOrder === "asc" ? a.solved - b.solved : b.solved - a.solved;
    });
  }, [filtered, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const pageRows = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const toggleSort = (key) => {
    if (sortKey === key) setSortOrder((s) => (s === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="w-full max-w-[780px] bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-teal-700 to-cyan-600 text-white text-center py-3 font-bold">
        🏅 All-Time Champions
      </div>

      <div className="p-4 space-y-3">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <div className="flex gap-2 w-full md:w-2/3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or roll..."
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-300"
            />
            <input
              value={filterRoll}
              onChange={(e) => setFilterRoll(e.target.value)}
              placeholder="Filter roll..."
              className="w-40 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-300"
            />
          </div>

          <div className="flex gap-2 items-center">
            <div className="text-sm text-gray-600">Sort:</div>
            <button
              onClick={() => toggleSort("name")}
              className={`px-2 py-1 rounded-md text-sm ${
                sortKey === "name" ? "bg-cyan-100" : "bg-gray-100"
              }`}
            >
              Name {sortKey === "name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </button>
            <button
              onClick={() => toggleSort("roll")}
              className={`px-2 py-1 rounded-md text-sm ${
                sortKey === "roll" ? "bg-cyan-100" : "bg-gray-100"
              }`}
            >
              Roll {sortKey === "roll" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </button>
            <button
              onClick={() => toggleSort("solved")}
              className={`px-2 py-1 rounded-md text-sm ${
                sortKey === "solved" ? "bg-cyan-100" : "bg-gray-100"
              }`}
            >
              Solved {sortKey === "solved" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Roll</th>
                <th className="px-4 py-2 text-right">Total Solved</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No results
                  </td>
                </tr>
              ) : (
                pageRows.map((r, idx) => {
                  const globalIndex = (page - 1) * rowsPerPage + idx + 1;
                  return (
                    <tr
                      key={r.roll + idx}
                      className={`border-t hover:bg-gray-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3">{globalIndex}</td>
                      <td className="px-4 py-3 max-w-[320px]">{highlightMatch(r.name, query)}</td>
                      <td className="px-4 py-3">{highlightMatch(String(r.roll), query)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-indigo-700">
                        {r.solved}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: counts + pagination */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {pageRows.length} of {filtered.length} matched
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
              disabled={page === 1}
            >
              Previous
            </button>
            <div className="text-sm">
              Page {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== Main Dashboard ===================== */
export default function LeaderboardDashboard() {
  const [active, setActive] = useState("weekly");

  const weeklyAccent = { 1: "bg-gradient-to-r from-indigo-500 to-blue-500", 2: "bg-yellow-400", 3: "bg-orange-400" };
  const allTimeAccent = { 1: "bg-gradient-to-r from-emerald-500 to-teal-500", 2: "bg-gray-400", 3: "bg-pink-500" };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center">
      <header className="max-w-6xl w-full">
        {/* <h1 className="text-3xl md:text-4xl font-extrabold text-center text-indigo-600 mb-6">
          Leaderboard
        </h1> */}

        {/* Podiums */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-lg">
            <Podium title="Weekly Top 3" data={weeklyTop3} accent={weeklyAccent} />
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-lg">
            <Podium title="All-Time Top 3" data={allTimeTop3} accent={allTimeAccent} />
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setActive("weekly")}
            className={`px-4 py-2 rounded-md font-semibold ${
              active === "weekly" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-gray-700"
            }`}
          >
            Weekly Leaderboard
          </button>
          <button
            onClick={() => setActive("alltime")}
            className={`px-4 py-2 rounded-md font-semibold ${
              active === "alltime" ? "bg-emerald-600 text-white shadow-md" : "bg-white text-gray-700"
            }`}
          >
            All-Time Champions
          </button>
        </nav>
      </header>

      <main className="max-w-5xl w-full">
        {active === "weekly" ? (
          <div className="flex justify-center">
            <WeeklyStack weeks={weeklyHistory} defaultCount={3} />
          </div>
        ) : (
          <div className="flex justify-center">
            <AllTimeTable rows={allTimeFull} />
          </div>
        )}
      </main>
    </div>
  );
}



