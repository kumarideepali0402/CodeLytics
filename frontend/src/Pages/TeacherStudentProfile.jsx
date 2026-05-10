import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Flame, ExternalLink, CheckCircle2 } from "lucide-react";
import axiosClient from "../utils/axiosClient";

const PLATFORM_META = {
  leetcode:      { favicon: "https://leetcode.com/favicon.ico",          label: "LeetCode"      },
  codeforces:    { favicon: "https://codeforces.com/favicon.ico",        label: "Codeforces"    },
  geeksforgeeks: { favicon: "https://www.geeksforgeeks.org/favicon.ico", label: "GeeksforGeeks" },
  gfg:           { favicon: "https://www.geeksforgeeks.org/favicon.ico", label: "GeeksforGeeks" },
};

function platformMeta(name = "") {
  const key = Object.keys(PLATFORM_META).find((k) => name.toLowerCase().includes(k));
  return key ? PLATFORM_META[key] : null;
}

function getPlatformUrl(name = "", handle = "") {
  const n = name.toLowerCase();
  if (n.includes("codeforces"))    return `https://codeforces.com/profile/${handle}`;
  if (n.includes("leetcode"))      return `https://leetcode.com/${handle}`;
  if (n.includes("geeksforgeeks") || n.includes("gfg"))
    return `https://www.geeksforgeeks.org/user/${handle}/`;
  return null;
}

const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

const fmt = (iso) => {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function TeacherStudentProfile() {
  const { id: batchId, studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    axiosClient
      .get(`/analytics/student/${studentId}/profile`)
      .then((res) => setStudent(res.data.student))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Loading profile…
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <p className="text-slate-400 text-sm">Student not found.</p>
        <button
          onClick={() => navigate(`/teacher/${batchId}/students`)}
          className="text-sky-600 text-sm hover:underline"
        >
          Back to students
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      {/* Back */}
      <button
        onClick={() => navigate(`/teacher/${batchId}/students`)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to students
      </button>

      {/* Identity card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-sky-50 border-b border-sky-100 px-6 py-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
            {initials(student.name)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{student.name}</h2>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-2 py-0.5">
                <Mail className="h-3 w-3" /> {student.email}
              </span>
              {student.studentEnrollmentId && (
                <span className="text-xs text-sky-700 bg-sky-50 border border-sky-200 rounded-lg px-2 py-0.5 font-medium">
                  {student.studentEnrollmentId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
          <div className="px-6 py-4 text-center">
            <p className="text-2xl font-extrabold text-teal-700">{student.solvedCount}</p>
            <p className="text-xs text-slate-400 mt-0.5">Problems Solved</p>
          </div>
          <div className="px-6 py-4 text-center">
            <p className="text-2xl font-extrabold text-orange-500 flex items-center justify-center gap-1">
              <Flame className="h-5 w-5" />{student.studentStreak ?? 0}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Platform handles */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Platform Handles
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {student.platformAccounts?.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-400">No platform handles added.</p>
          ) : (
            student.platformAccounts?.map((acc) => {
              const meta = platformMeta(acc.platform?.name ?? "");
              const url  = getPlatformUrl(acc.platform?.name ?? "", acc.handle);
              return (
                <div key={acc.id} className="flex items-center gap-3 px-5 py-3">
                  {meta ? (
                    <img src={meta.favicon} alt={meta.label} className="h-5 w-5 rounded object-contain" />
                  ) : (
                    <div className="h-5 w-5 rounded bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500">
                      {(acc.platform?.name ?? "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700">
                      {meta?.label ?? acc.platform?.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {acc.handle || <span className="italic">Not set</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400">
                      Synced {fmt(acc.lastSyncedAt)}
                    </span>
                    {acc.handle && url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {acc.handle && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
