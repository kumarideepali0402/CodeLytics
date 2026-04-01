import { useState } from "react";
import { Link } from "react-router-dom";
import { Library, Sparkles, Plus, X } from "lucide-react";

const initialForm = {
  name: "",
  link: "",
  difficulty: "Easy",
  platform: "LeetCode",
};

export default function TeacherProblemsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProblem, setNewProblem] = useState(initialForm);

  const openModal = () => setIsAddModalOpen(true);
  const closeModal = () => setIsAddModalOpen(false);

  const handleAddProblem = (e) => {
    e.preventDefault();
    if (!newProblem.name?.trim() || !newProblem.link?.trim()) return;
    // TODO: POST create problem API with payload (title, link, difficulty, platformId/topic/subtopic as needed)
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
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Sparkles className="h-7 w-7" aria-hidden />
            </div>
            <p className="text-base font-semibold text-slate-800">Problem bank</p>
            <p className="mt-1 max-w-md text-sm text-slate-600">
              Wire your API here to load problems, add entries, and assign to batches.
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
        </div>
      </div>

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
                  value={newProblem.platform}
                  onChange={(e) =>
                    setNewProblem({ ...newProblem, platform: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none ring-amber-200 transition focus:border-amber-400 focus:bg-white focus:ring-2"
                >
                  <option value="GFG">GFG</option>
                  <option value="LeetCode">LeetCode</option>
                  <option value="Codeforces">Codeforces</option>
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
                  value={newProblem.name}
                  onChange={(e) =>
                    setNewProblem({ ...newProblem, name: e.target.value })
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
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
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
