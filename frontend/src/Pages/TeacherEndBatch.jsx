import { useMemo, useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config/apiBase";
import { LayoutGrid, Trophy, BarChart3, ListChecks } from "lucide-react";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const navItems = [
  {
    key: "content",
    label: "Content",
    path: "content",
    icon: LayoutGrid,
    description: "Topics & assignments",
  },
  {
    key: "problemslist",
    label: "Problem list",
    path: "problemslist",
    icon: ListChecks,
    description: "Batch standings (class view)",
  },
  {
    key: "leaderboard",
    label: "Leaderboard",
    path: "leaderboard",
    icon: Trophy,
    description: "Rankings",
  },
  {
    key: "analytics",
    label: "Analytics",
    path: "analytics",
    icon: BarChart3,
    description: "Charts & tables",
  },
];

function sectionFromPath(pathname) {
  if (pathname.includes("/problemslist")) return "problemslist";
  if (pathname.includes("/leaderboard")) return "leaderboard";
  if (pathname.includes("/analytics")) return "analytics";
  return "content";
}

export default function TeacherEndBatch() {
  const { id: batchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [batchName, setBatchName] = useState(null);

  const activeKey = useMemo(
    () => sectionFromPath(location.pathname),
    [location.pathname]
  );

  useEffect(() => {
    if (!batchId) {
      setBatchName(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/teacher/get-batch");
        const list = res.data?.batches ?? [];
        const b = Array.isArray(list)
          ? list.find((x) => String(x?.id) === String(batchId))
          : null;
        if (!cancelled) setBatchName(b?.name ?? null);
      } catch {
        if (!cancelled) setBatchName(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [batchId]);

  const batchTitle = batchName ?? batchId ?? "";

  return (
    <div className="z-10 flex min-h-0 flex-col md:flex-row md:gap-0">
      {/* Side rail: vertical on md+, horizontal scroll on small screens */}
      <nav
        className="shrink-0 border-b border-gray-200 bg-white md:w-56 md:border-b-0 md:border-r md:py-4"
        aria-label="Batch sections"
      >
        <p
          className="truncate border-b border-gray-100 bg-gray-50/80 px-3 py-2 text-sm font-bold leading-snug text-gray-900 md:border-b-0 md:bg-transparent md:px-4 md:pb-2 md:pt-0"
          title={batchTitle || undefined}
        >
          {batchTitle || "…"}
        </p>
        <ul className="flex gap-1 overflow-x-auto px-2 py-2 md:flex-col md:gap-0.5 md:px-2 md:py-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeKey === item.key;
            return (
              <li key={item.key} className="shrink-0 md:w-full">
                <button
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition md:py-2.5 ${
                    isActive
                      ? "bg-amber-100 text-amber-900 shadow-sm ring-1 ring-amber-200/80"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${isActive ? "text-amber-700" : "text-gray-400"}`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-tight">
                      {item.label}
                    </span>
                    <span className="hidden text-xs text-gray-500 md:block">
                      {item.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-2 md:p-4">
        <Outlet />
      </div>
    </div>
  );
}
