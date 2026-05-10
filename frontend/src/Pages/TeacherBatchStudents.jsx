import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Flame, User } from "lucide-react";
import axiosClient from "../utils/axiosClient";

const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

export default function TeacherBatchStudents() {
  const { id: batchId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    if (!batchId) return;
    axiosClient
      .get(`/analytics/batch/${batchId}/students`)
      .then((res) => setStudents(res.data.students ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [batchId]);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.studentEnrollmentId?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Loading students…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            placeholder="Search name, roll or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:outline-none w-72"
          />
        </div>
        <span className="ml-auto text-xs text-slate-400">
          {filtered.length} student{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-sky-50 border-b-2 border-sky-100">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Student
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Roll No.
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                Streak
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                Solved
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-sm">
                  No students found.
                </td>
              </tr>
            ) : (
              filtered.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-t border-slate-100 hover:bg-sky-50/40 transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                  }`}
                >
                  {/* Name + email */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {initials(s.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Roll */}
                  <td className="px-4 py-3 text-slate-500 text-xs font-medium">
                    {s.studentEnrollmentId || "—"}
                  </td>

                  {/* Streak */}
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600">
                      <Flame className="h-3.5 w-3.5" />
                      {s.studentStreak ?? 0}
                    </span>
                  </td>

                  {/* Solved */}
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-teal-700">{s.solvedCount}</span>
                    <span className="text-slate-400 text-xs">/{s.totalAssigned}</span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/teacher/${batchId}/students/${s.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
                    >
                      <User className="h-3.5 w-3.5" />
                      View Profile
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
