import { useState, useEffect, useMemo } from "react";
import { Mail, ExternalLink, Pencil, Check, X, Users, ArrowLeft, User, CheckCircle2 } from "lucide-react";
import ReadonlyAssignmentSheet from "../Components/ReadonlyAssignmentSheet";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import { handleError } from "../utils/notification";

function getPlatformUrl(platformName, handle) {
  const name = platformName.toLowerCase();
  if (name.includes("codeforces")) return `https://codeforces.com/profile/${handle}`;
  if (name.includes("leetcode"))   return `https://leetcode.com/${handle}`;
  if (name.includes("geeksforgeeks") || name.includes("gfg")) return `https://www.geeksforgeeks.org/user/${handle}/`;
  return null;
}

const PLATFORM_META = {
  leetcode:      { favicon: "https://leetcode.com/favicon.ico",              label: "LeetCode"      },
  codeforces:    { favicon: "https://codeforces.com/favicon.ico",            label: "Codeforces"    },
  geeksforgeeks: { favicon: "https://www.geeksforgeeks.org/favicon.ico",     label: "GeeksforGeeks" },
  gfg:           { favicon: "https://www.geeksforgeeks.org/favicon.ico",     label: "GeeksforGeeks" },
};

function PlatformIcon({ platformName }) {
  const key   = Object.keys(PLATFORM_META).find((k) => platformName.toLowerCase().includes(k));
  const meta  = key ? PLATFORM_META[key] : null;

  if (meta) {
    return (
      <img
        src={meta.favicon}
        alt={meta.label}
        title={meta.label}
        className="h-5 w-5 rounded object-contain"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    );
  }

  return (
    <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-[9px] font-bold text-gray-600">
      {platformName.toUpperCase()}
    </span>
  );
}

const PROFILE_DEFAULT = { name: "", email: "",  batch: "—" };
const STATS_DEFAULT = { EASY: { solved: 0, total: 0 }, MEDIUM: { solved: 0, total: 0 }, HARD: { solved: 0, total: 0 } };

function DonutChart({ stats }) {
  const r    = 48;
  const circ = 2 * Math.PI * r;
  const totalSolved   = stats.EASY.solved + stats.MEDIUM.solved + stats.HARD.solved;
  const totalProblems = stats.EASY.total  + stats.MEDIUM.total  + stats.HARD.total;

  const easyLen  = totalProblems > 0 ? (stats.EASY.solved   / totalProblems) * circ : 0;
  const medLen   = totalProblems > 0 ? (stats.MEDIUM.solved / totalProblems) * circ : 0;
  const hardLen  = totalProblems > 0 ? (stats.HARD.solved   / totalProblems) * circ : 0;

  const segments = [
    { len: easyLen,  color: "#22c55e", offset: 0 },
    { len: medLen,   color: "#f59e0b", offset: easyLen },
    { len: hardLen,  color: "#ef4444", offset: easyLen + medLen },
  ];

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <g transform="rotate(-90 60 60)">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
          {segments.map(({ len, color, offset }, i) => (
            <circle
              key={i}
              cx="60" cy="60" r={r}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeDasharray={`${len} ${circ}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-gray-900 leading-none">{totalSolved}</span>
        <span className="text-xs text-gray-400 mt-0.5">/ {totalProblems}</span>
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const navigate = useNavigate();
  const { id, batchId: collegeBatchId, studentId } = useParams();
  const batchId    = id ?? collegeBatchId;
  const backPath   = id ? `/teacher/${batchId}/students` : `/batch/${batchId}/students`;
  const teacherMode = Boolean(studentId);

  const [profile, setProfile]     = useState(PROFILE_DEFAULT);
  const [handles, setHandles]     = useState([]);
  const [stats, setStats]         = useState(STATS_DEFAULT);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving]       = useState(false);
  const [syncToken, setSyncToken] = useState("");
  const [copied, setCopied]       = useState(false);

  // Teacher/college view extras
  const [assignments, setAssignments] = useState([]);   // [{assignmentId, title, link, difficulty, topic, subtopic}]
  const [statuses, setStatuses]       = useState({});   // { assignmentId_studentId: "SOLVED"|other }
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (teacherMode) {
      setLoadingProfile(true);
      Promise.all([
        axiosClient.get(`/analytics/student/${studentId}/profile`),
        axiosClient.get(`/analytics/batch/${batchId}/solve-status`),
      ])
        .then(([profileRes, statusRes]) => {
          const s = profileRes.data.student;
          setProfile({ name: s.name, email: s.email, batch: s.studentEnrollmentId || "—" });
          setHandles(
            (s.platformAccounts ?? []).map((acc) => ({
              platformId:   acc.id,
              platformName: acc.platform?.name ?? "",
              handle:       acc.handle ?? "",
              lastSyncedAt: acc.lastSyncedAt ?? null,
            }))
          );
          setAssignments(statusRes.data.problems ?? []);
          setStatuses(statusRes.data.statuses ?? {});
        })
        .catch(() => {})
        .finally(() => setLoadingProfile(false));
    } else {
      axiosClient.get("/student/me")
        .then((res) => setProfile(res.data.profile))
        .catch(() => {});
      axiosClient.get("/student/platform-handles")
        .then((res) => setHandles(res.data.handles))
        .catch(() => {});
      axiosClient.get("/student/problem-stats")
        .then((res) => { console.log("[problem-stats]", res.data); setStats(res.data.stats); })
        .catch((err) => console.error("[problem-stats error]", err?.response?.status, err?.response?.data));
    }
  }, [teacherMode, studentId, batchId]);

  // Computed for teacher/college view — must be at top level (Rules of Hooks)
  const diffStats = useMemo(() => {
    const map = { EASY: { solved: 0, total: 0 }, MEDIUM: { solved: 0, total: 0 }, HARD: { solved: 0, total: 0 } };
    assignments.forEach((p) => {
      const d = p.difficulty;
      if (!map[d]) return;
      map[d].total++;
      if (statuses[`${p.assignmentId}_${studentId}`] === "SOLVED") map[d].solved++;
    });
    return map;
  }, [assignments, statuses, studentId]);

  const generateToken = async() => {
    try {
      const res = await axiosClient.post('/student/generate-sync-token');
      setSyncToken(res.data.syncToken);
      
    } catch (error) {
      handleError(error.response?.data?.msg);
      
    }
  }

  const copyToken = () => {
    navigator.clipboard.writeText(syncToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000)

  }

  const startEdit  = (id, cur) => { setEditingId(id); setEditValue(cur ?? ""); };
  const cancelEdit = ()         => { setEditingId(null); setEditValue(""); };

  const saveHandle = async (platformId) => {
    setSaving(true);
    try {
      await axiosClient.post("/student/platform-handles", { platformId, handle: editValue });
      setHandles((prev) =>
        prev.map((h) => h.platformId === platformId ? { ...h, handle: editValue } : h)
      );
      setEditingId(null);
    } catch (e) {
      handleError(e.response?.data?.msg ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.name
    .split(" ").map((p) => p[0]).join("").toUpperCase();

  /* ── Teacher / College view ── */
  if (teacherMode) {
    const ini     = profile.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    const fmtDate = (iso) => iso
      ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "Never";

    const totalSolved = Object.values(diffStats).reduce((a, d) => a + d.solved, 0);
    const totalAssigned = assignments.length;

    const diffRows = [
      { key: "EASY",   label: "Easy",   dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50"  },
      { key: "MEDIUM", label: "Medium", dot: "bg-amber-400",  text: "text-amber-700", bg: "bg-amber-50"  },
      { key: "HARD",   label: "Hard",   dot: "bg-red-500",   text: "text-red-700",   bg: "bg-red-50"    },
    ];

    return (
      <div className="space-y-5 max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(backPath)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to students
        </button>

        {loadingProfile ? (
          <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
        ) : (
          <>
            {/* ── Identity + Handles · Problems — single row card ── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">

                {/* Left: Identity + Platform Handles */}
                <div className="flex items-start gap-4 px-5 py-5">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-bold shrink-0">
                    {ini || <User className="h-6 w-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-slate-900 truncate">{profile.name || "—"}</h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <Mail className="h-3 w-3 shrink-0" />{profile.email || "—"}
                    </p>
                    {profile.batch && profile.batch !== "—" && (
                      <p className="text-xs text-slate-600 font-medium mt-0.5">{profile.batch}</p>
                    )}

                    {/* Platform Handles */}
                    {handles.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {handles.map((h) => {
                          const metaKey = Object.keys(PLATFORM_META).find((k) => h.platformName.toLowerCase().includes(k));
                          const meta    = metaKey ? PLATFORM_META[metaKey] : null;
                          const url     = getPlatformUrl(h.platformName, h.handle);
                          return (
                            <div key={h.platformId} className="flex items-center gap-2">
                              {meta ? (
                                <img src={meta.favicon} alt={meta.label} className="h-4 w-4 rounded object-contain shrink-0" />
                              ) : (
                                <div className="h-4 w-4 rounded bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0">
                                  {(h.platformName || "?")[0].toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                {h.handle && url ? (
                                  <a href={url} target="_blank" rel="noreferrer"
                                    className="text-xs text-sky-600 hover:underline font-medium truncate block">
                                    {h.handle}
                                  </a>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">Not set</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">{fmtDate(h.lastSyncedAt)}</span>
                              {h.handle && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Problems Solved */}
                <div className="px-5 py-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Problems Solved · {totalSolved}/{totalAssigned}
                  </p>
                  <div className="flex items-center gap-4">
                    <DonutChart stats={diffStats} />
                    <div className="flex-1 space-y-2">
                      {diffRows.map(({ key, label, dot, text }) => {
                        const d = diffStats[key];
                        const pct = d.total > 0 ? Math.round((d.solved / d.total) * 100) : 0;
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`h-2 w-2 rounded-full ${dot}`} />
                                <span className={`text-xs font-semibold ${text}`}>{label}</span>
                              </div>
                              <span className="text-xs tabular-nums text-slate-600">
                                {d.solved}<span className="text-slate-400">/{d.total}</span>
                              </span>
                            </div>
                            <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                              <div className={`h-full rounded-full ${dot}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Assignment Sheet (read-only student view) ── */}
            <ReadonlyAssignmentSheet
              assignments={assignments}
              statuses={statuses}
              studentId={studentId}
            />
          </>
        )}
      </div>
    );
  }

  /* ── Student view (unchanged) ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="px-6 pt-5">
        <button
          onClick={() => navigate("/student/assignment")}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-white hover:text-gray-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignment
        </button>
      </div>

      <div className="flex justify-center p-8 pt-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-md border border-gray-200 overflow-hidden">

        {/* ── Identity ── */}
        <div className="flex flex-col items-center gap-2 px-6 pt-5 pb-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white shadow-md">
            {initials || <User className="h-8 w-8" />}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{profile.name || "—"}</h1>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
              <Mail className="h-3 w-3 shrink-0" />{profile.email || "—"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
              <Users className="h-3 w-3 shrink-0" />{profile.batch || "—"}
            </span>
            
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── Coding profiles ── */}
        <div className="px-6 py-5 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Coding Profiles
          </p>
          {handles.length === 0 && (
            <p className="text-sm text-gray-400">No platforms linked yet.</p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            {handles.map((h) => (
              <div key={h.platformId}>
                {editingId === h.platformId ? (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5">
                    <PlatformIcon platformName={h.platformName} />
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 bg-transparent text-xs outline-none placeholder:text-gray-400"
                      placeholder="Enter handle"
                    />
                    <button
                      onClick={() => saveHandle(h.platformId)}
                      disabled={saving || !editValue.trim()}
                      className="text-green-600 hover:text-green-700 disabled:opacity-40"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="group inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 px-3 py-1.5 hover:border-gray-300 hover:shadow-sm transition">
                    <PlatformIcon platformName={h.platformName} />
                    {h.handle ? (
                      <a
                        href={getPlatformUrl(h.platformName, h.handle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        {h.handle}
                      </a>
                    ) : (
                      <span className="text-xs italic text-gray-400">Not set</span>
                    )}
                    <button
                      onClick={() => startEdit(h.platformId, h.handle)}
                      className="text-gray-300 hover:text-blue-500 transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── Extension Sync Token ── */}
        <div className="px-6 py-5 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Extension Sync Token
          </p>
          {syncToken ? (
            <div className="flex items-center justify-center gap-2">
              <code className="rounded bg-gray-100 px-3 py-1.5 text-xs text-gray-700 font-mono truncate max-w-[200px]">
                {syncToken}
              </code>
              <button onClick={copyToken} className="text-xs text-blue-600 hover:underline">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          ) : (
            <button
              onClick={generateToken}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Generate Sync Token
            </button>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* ── Problems solved ── */}
        <div className="px-6 py-5 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Problems Solved
          </p>
          <div className="flex items-center justify-center gap-8">
            <DonutChart stats={stats} />

            <div className="flex-1 space-y-3">
              {[
                { label: "Easy",   key: "EASY",   dot: "bg-green-500", text: "text-green-600" },
                { label: "Medium", key: "MEDIUM", dot: "bg-amber-400",  text: "text-amber-600" },
                { label: "Hard",   key: "HARD",   dot: "bg-red-500",   text: "text-red-600"  },
              ].map(({ label, key, dot, text }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                    <span className={`text-sm font-semibold ${text}`}>{label}</span>
                  </div>
                  <span className="text-sm tabular-nums text-gray-600">
                    {stats[key].solved}
                    <span className="text-gray-400"> / {stats[key].total}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
