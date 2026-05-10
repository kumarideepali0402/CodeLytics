import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Table() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Master Table", path: "mastertable" },
    { label: "Weekly Progress", path: "weeklyprogresstable" },
  ];

  const isWeekly = location.pathname.includes("weeklyprogresstable");
  const active = (path) =>
    path === "mastertable"
      ? !isWeekly   // master is active whenever weekly isn't
      : isWeekly;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              active(tab.path)
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
