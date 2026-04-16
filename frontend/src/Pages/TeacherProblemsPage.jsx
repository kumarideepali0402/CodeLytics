import { useState , useEffect} from "react";
import { Link } from "react-router-dom";
import { Library, Sparkles, Plus, X } from "lucide-react";
import axiosClient from "../utils/axiosClient"

const initialForm = {
  title: "",
  link: "",
  difficulty: "EASY",
  platformId: "",
};

export default function TeacherProblemsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddPlatformOpen, setIsAddPlatformOpen] = useState(false);
  const [newProblem, setNewProblem] = useState(initialForm);
  const [platformName, setPlatformName] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [problems, setProblems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());



  const openModal = () => setIsAddModalOpen(true);
  const closeModal = () => setIsAddModalOpen(false);


  useEffect (()=>{
     const fetchPlatforms =  async() => {
    const fetchedPlatform = await axiosClient.get('/platform/all');
    setPlatforms(fetchedPlatform.data.platforms);

  }
  fetchPlatforms()
   


  }, [])
  useEffect(() => {
     const handleGetProblems = async() => {
      try {
        const fetchedProblems = await axiosClient.get('/assignment/get-all-problems');
        setProblems(fetchedProblems.data?.problems);
      } catch (error) {
        console.log(error);

        
      }
    }
    handleGetProblems();
  }, [])
 

  const handleAddProblem = async(e) => {
    console.log("reached");
    
    e.preventDefault();
    if (!newProblem.title?.trim() || !newProblem.link?.trim() || !newProblem.platformId) return;
    const createdProblem = await axiosClient.post('/assignment/create-problem', newProblem);
    console.log("problem created");
    setProblems((prev) => [...prev, createdProblem.data.problem]);
    setNewProblem(initialForm);
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        <header className="mb-6 flex flex-col gap-4 border-b border-slate-200/90 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-amber-800">
              <Library className="h-5 w-5 shrink-0" aria-hidden />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Problem bank
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Your problems
            </h1>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddPlatformOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add platform
            </button>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add problem
            </button>
            <Link
              to="/teacher-dashboard"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Back to dashboard
            </Link>
          </div>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100">
          {problems.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Sparkles className="h-7 w-7" aria-hidden />
              </div>
              <p className="text-base font-semibold text-slate-800">No problems yet</p>
              <p className="mt-1 max-w-md text-sm text-slate-600">
                Add your first problem to get started.
              </p>
              <button
                type="button"
                onClick={openModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-amber-950 shadow-sm hover:bg-amber-400"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add problem
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 accent-amber-500"
                      checked={selectedIds.size === problems.length}
                      onChange={(e) =>
                        setSelectedIds(
                          e.target.checked ? new Set(problems.map((p) => p.id)) : new Set()
                        )
                      }
                    />
                  </th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {problems.map((problem) => {
                  const platformName =
                    platforms.find((pl) => pl.id === problem.platformId)?.name ?? "—";
                  const difficultyStyles = {
                    EASY: "bg-emerald-50 text-emerald-700 ring-emerald-200",
                    MEDIUM: "bg-amber-50 text-amber-700 ring-amber-200",
                    HARD: "bg-red-50 text-red-700 ring-red-200",
                  };
                  return (
                    <tr
                      key={problem.id}
                      className="transition hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 accent-amber-500"
                          checked={selectedIds.has(problem.id)}
                          onChange={(e) => {
                            const next = new Set(selectedIds);
                            e.target.checked ? next.add(problem.id) : next.delete(problem.id);
                            setSelectedIds(next);
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {problem.title}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{platformName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${difficultyStyles[problem.difficulty] ?? ""}`}
                        >
                          {problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={problem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-500 hover:underline"
                        >
                          Open
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isAddPlatformOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center"
          role="presentation"
          onClick={() => { setIsAddPlatformOpen(false); setPlatformName(""); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-platform-title"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 id="add-platform-title" className="text-lg font-bold text-slate-900">
                Add platform
              </h3>
              <button
                type="button"
                onClick={() => { setIsAddPlatformOpen(false); setPlatformName(""); }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={async(e) => {
                e.preventDefault();
                try {
                  const platform = await axiosClient.post('/platform/create', {
                    name : platformName
                  })
                  setPlatforms([...platforms, platform.data.platform])
                  setPlatformName("");
                  setIsAddPlatformOpen(false);
                } catch (error) {
                  handleError(error?.response?.data?.msg);
                  
                }
              }}
              className="mt-5 flex flex-col gap-4"
            >
              <div>
                <label
                  htmlFor="platform-name"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  Platform name
                </label>
                <input
                  id="platform-name"
                  type="text"
                  placeholder="e.g. LeetCode"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-amber-200 transition focus:border-amber-400 focus:bg-white focus:ring-2"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddPlatformOpen(false); setPlatformName(""); }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center"
          role="presentation"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-problem-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="add-problem-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Add problem
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Submit connects to your create-problem API when wired.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddProblem} className="mt-5 flex flex-col gap-4">
              <div>
                <label
                  htmlFor="pb-platform"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  Platform
                </label>
                <select
                  id="pb-platform"
                  value={newProblem.platformId}
                  label = "platformId"
                  onChange={(e) =>
                    setNewProblem({ ...newProblem, platformId: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none ring-amber-200 transition focus:border-amber-400 focus:bg-white focus:ring-2"
                >
                  <option value="">Select Platform</option>

                  {platforms.map((p)=>(
                    <option key = {p.id}value={p.id}>{p.name}</option>

                  ))}
        
                </select>
              </div>
              <div>
                <label
                  htmlFor="pb-name"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  Title
                </label>
                <input
                  id="pb-name"
                  type="text"
                  placeholder="e.g. Two Sum"
                  value={newProblem.title}
                  onChange={(e) =>
                    setNewProblem({ ...newProblem, title: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-amber-200 transition focus:border-amber-400 focus:bg-white focus:ring-2"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="pb-link"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  URL
                </label>
                <input
                  id="pb-link"
                  type="text"
                  placeholder="https://…"
                  value={newProblem.link}
                  onChange={(e) =>
                    setNewProblem({ ...newProblem, link: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-amber-200 transition focus:border-amber-400 focus:bg-white focus:ring-2"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="pb-difficulty"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  Difficulty
                </label>
                <select
                  id="pb-difficulty"
                  value={newProblem.difficulty}
                  onChange={(e) =>
                    setNewProblem({ ...newProblem, difficulty: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm font-medium outline-none ring-amber-200 transition focus:border-amber-400 focus:bg-white focus:ring-2"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
