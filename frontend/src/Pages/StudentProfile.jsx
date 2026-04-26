import { useState, useEffect } from "react";
import { Mail, Flame, ExternalLink, Pencil, Check, X, Users, ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

const STATS = {
  easy:   { solved: 84,  total: 120 },
  medium: { solved: 156, total: 280 },
  hard:   { solved: 42,  total: 95  },
};

function DonutChart({ totalSolved, totalProblems }) {
  const r    = 48;
  const circ = 2 * Math.PI * r;

  const easyLen   = (STATS.easy.solved   / totalProblems) * circ;
  const medLen    = (STATS.medium.solved / totalProblems) * circ;
  const hardLen   = (STATS.hard.solved   / totalProblems) * circ;

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
  const [profile, setProfile]     = useState(PROFILE_DEFAULT);
  const [handles, setHandles]     = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    axiosClient.get("/student/me")
      .then((res) => setProfile(res.data.profile))
      .catch(() => {});
    axiosClient.get("/student/platform-handles")
      .then((res) => setHandles(res.data.handles))
      .catch(() => {});
  }, []);

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

  const totalSolved   = STATS.easy.solved + STATS.medium.solved + STATS.hard.solved;
  const totalProblems = STATS.easy.total  + STATS.medium.total  + STATS.hard.total;

  const initials = profile.name
    .split(" ").map((p) => p[0]).join("").toUpperCase();

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

        {/* ── Problems solved ── */}
        <div className="px-6 py-5 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Problems Solved
          </p>
          <div className="flex items-center justify-center gap-8">
            <DonutChart totalSolved={totalSolved} totalProblems={totalProblems} />

            <div className="flex-1 space-y-3">
              {[
                { label: "Easy",   dot: "bg-green-500", text: "text-green-600", ...STATS.easy   },
                { label: "Medium", dot: "bg-amber-400",  text: "text-amber-600",  ...STATS.medium },
                { label: "Hard",   dot: "bg-red-500",   text: "text-red-600",   ...STATS.hard   },
              ].map(({ label, dot, text, solved, total }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                    <span className={`text-sm font-semibold ${text}`}>{label}</span>
                  </div>
                  <span className="text-sm tabular-nums text-gray-600">
                    {solved}
                    <span className="text-gray-400"> / {total}</span>
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
