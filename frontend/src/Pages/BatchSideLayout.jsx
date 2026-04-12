import { NavLink, Outlet, useParams } from "react-router-dom";
import {
  BarChart2,
  Users,
  School,
  ListChecks,
  GraduationCap,
} from "lucide-react";
import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";

const navItems = [
  {
    to: "dashboard",
    label: "Dashboard",
    icon: BarChart2,
    end: true,
  },
  { to: "students", label: "Students", icon: Users },
  { to: "teachers", label: "Teachers", icon: School },
  {
    to: "problemslist",
    label: "Problem list",
    icon: ListChecks,
    title: "Class standings & problem bank",
  },
];

function navLinkClass({ isActive }) {
  return [
    "flex min-w-[9.5rem] shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition md:min-w-0 md:w-full",
    isActive
      ? "bg-sky-50 text-sky-900 shadow-sm ring-1 ring-sky-200/90"
      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
  ].join(" ");
}

export default function BatchSideLayout() {
  const [batchName, setBatchName] = useState("");
  const [loadError, setLoadError] = useState(false);
  const { batchId } = useParams();

  useEffect(() => {
    if (!batchId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosClient.get(`/batch/get/${batchId}`);
        const name = res.data?.batch?.name;
        if (!cancelled) {
          setBatchName(name ?? "");
          setLoadError(false);
        }
      } catch {
        if (!cancelled) {
          setBatchName("");
          setLoadError(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [batchId]);

  const title = batchName || (loadError ? "Batch" : "Loading…");

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/90 md:flex-row">
      {/* Sidebar: icon rail on mobile scroll, full sidebar on md+ */}
      <aside className="shrink-0 border-b border-slate-200 bg-white shadow-sm md:w-56 md:border-b-0 md:border-r md:shadow-none">
        <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-3 md:flex-col md:items-stretch md:px-0 md:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 md:px-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/80">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 md:min-w-0">
              <p className="truncate text-sm font-bold leading-tight text-slate-900">
                {title}
              </p>
              <p className="truncate font-mono text-[10px] text-slate-400">
                {batchId ? `ID ${batchId}` : ""}
              </p>
            </div>
          </div>
        </div>

        <nav
          className="flex gap-1 overflow-x-auto px-2 py-2 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-col md:gap-0.5 md:overflow-visible md:px-2 md:pb-4 md:pt-0 [&::-webkit-scrollbar]:hidden"
          aria-label="Batch sections"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={item.title}
                className={navLinkClass}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 shrink-0 ${isActive ? "text-sky-700" : "text-slate-400"}`}
                      aria-hidden
                    />
                    <span className="whitespace-nowrap text-sm font-semibold">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-50">
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
