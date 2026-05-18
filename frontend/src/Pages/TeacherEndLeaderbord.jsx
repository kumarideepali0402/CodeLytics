import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import WeeklyLeaderboard from "../Components/WeeklyLeaderboard";
import OverallLeaderboard from "../Components/OverallLeaderboard";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getLastNMondays(n) {
  const mondays = [];
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    mondays.push(new Date(d));
    d.setDate(d.getDate() - 7);
  }
  return mondays;
}

const toRow = (e) => ({ name: e.name, roll: e.enrollmentId ?? "", solved: e.solved });

/* ── Constants ───────────────────────────────────────────────────────────── */
const RANK = [
  { bar: "bg-amber-400",  ring: "ring-amber-300",  avatar: "bg-amber-50  text-amber-600",  label: "text-amber-600",  h: 88, crown: true  },
  { bar: "bg-slate-400",  ring: "ring-slate-300",  avatar: "bg-slate-100 text-slate-600",  label: "text-slate-500",  h: 64, crown: false },
  { bar: "bg-orange-400", ring: "ring-orange-300", avatar: "bg-orange-50 text-orange-600", label: "text-orange-600", h: 48, crown: false },
];
const PODIUM_ORDER = [1, 0, 2];

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
              {r.crown && <span className="text-xl leading-none mb-1">👑</span>}
              <p className="text-[11px] font-semibold text-slate-700 text-center leading-tight truncate w-full px-1">
                {s?.name ?? "—"}
              </p>
              <p className={`text-[11px] font-bold ${r.label} mb-2`}>{s?.solved ?? 0}</p>
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

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function LeaderboardDashboard() {
  const { id: batchId } = useParams();
  const [active, setActive] = useState("weekly");
  const [weeklyTop3, setWeeklyTop3]     = useState([]);
  const [allTimeTop3, setAllTimeTop3]   = useState([]);
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [allTimeFull, setAllTimeFull]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!batchId) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const mondays = getLastNMondays(5);
        const [allTimeRes, ...weeklyResults] = await Promise.all([
          axiosClient.get(`/analytics/batch/${batchId}/leaderboard`),
          ...mondays.map((m) =>
            axiosClient.get(`/analytics/batch/${batchId}/leaderboard/weekly?weekStart=${m.toISOString()}`)
          ),
        ]);

        const allTime = allTimeRes.data.leaderboard ?? [];
        setAllTimeTop3(allTime.slice(0, 3).map(toRow));
        setAllTimeFull(allTime.map(toRow));

        const currentWeek = weeklyResults[0]?.data?.leaderboard ?? [];
        setWeeklyTop3(currentWeek.slice(0, 3).map(toRow));

        const history = weeklyResults
          .map((r, i) => {
            const lb = r?.data?.leaderboard ?? [];
            const start = r?.data?.weekStart ? new Date(r.data.weekStart) : mondays[i];
            const label = `Week of ${start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
            return { week: label, data: lb.slice(0, 3).map(toRow), totalSolves: lb.reduce((s, e) => s + e.solved, 0) };
          })
          .filter((w) => w.totalSolves > 0);
        setWeeklyHistory(history);
      } catch (err) {
        console.error("[LeaderboardDashboard] fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [batchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
        Loading leaderboard…
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Podium title="This week's top 3" data={weeklyTop3} />
        <Podium title="All-time top 3"    data={allTimeTop3} />
      </div>

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

      {active === "weekly"
        ? <WeeklyLeaderboard weeks={weeklyHistory} />
        : <OverallLeaderboard rows={allTimeFull} />
      }
    </div>
  );
}
