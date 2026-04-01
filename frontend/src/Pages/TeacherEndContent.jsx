import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  BookOpen,
  Library,
  ExternalLink,
  ChevronRight,
  ListTree,
  Eye,
  X,
  Loader2,
  PenLine,
} from "lucide-react";
import { displayPlatform, platformStyleClass } from "../utils/problemDisplay";
import axios from "axios";
import { handleError } from "../utils/notification";

const diffBadge = (d) => {
  const base = "text-xs font-semibold px-2 py-0.5 rounded-full shrink-0";
  if (d === "Easy") return `${base} bg-emerald-100 text-emerald-800`;
  if (d === "Medium") return `${base} bg-orange-100 text-orange-800`;
  return `${base} bg-rose-100 text-rose-800`;
};

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default function TeacherEndContent() {
  const { id: batchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacherBatch =
    Boolean(batchId) && /\/teacher\//i.test(location.pathname);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [data, setData] = useState([]);
  const [batchName, setBatchName] = useState(null);

  // ── Topic selection (by ID, not index) ────────────────────────────────────
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // ── New-topic form ─────────────────────────────────────────────────────────
  const [newTopicMode, setNewTopicMode] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");

  // ── New-subtopic form ──────────────────────────────────────────────────────
  const [addSubtopicForTopic, setAddSubtopicForTopic] = useState(false);
  const [newSubtopic, setNewSubtopic] = useState({ name: "" });

  // ── Subtopic accordion  ─────────────────────────────────
  const [expandedSubtopicId, setExpandedSubtopicId] = useState(null);

  // ── Create-problem modal ───────────────────────────────────────────────────
  const [createProblemTarget, setCreateProblemTarget] = useState(null); 
  const [createProblemForm, setCreateProblemForm] = useState({
    title: "",
    link: "",
    difficulty: "EASY",
    platformId: "",
  });
  const [platforms, setPlatforms] = useState([]);
  const [platformsLoading, setPlatformsLoading] = useState(false);
  const [createProblemSubmitting, setCreateProblemSubmitting] = useState(false);

  // ── Derived: find selected topic by ID ────────────────────────────────────
  const topic = data.find((t) => t.serverTopicId === selectedTopicId) ?? null;
  const topicSubtopics = topic?.subtopics ?? [];

  // ── Fetch batch name ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!batchId || !isTeacherBatch) {
      setBatchName(null);
      return;
    }
    
    const fetchBatchName = async () => {
      try {
        const res = await api.get("/teacher/get-batch");
        const batches = res.data?.batches ?? [];
        const matched = batches.find((b) => String(b.id) === String(batchId));
        setBatchName(matched?.name ?? null);
      } catch {
        setBatchName(null);
      }
    };
    fetchBatchName();
  }, [batchId, isTeacherBatch]);

  // ── Auto-select first topic when data loads ────────────────────────────────
  useEffect(() => {
    if (data.length > 0 && !selectedTopicId) {
      setSelectedTopicId(data[0].serverTopicId);
    }
  }, [data]);

  // ── Collapse subtopics when switching topics ───────────────────────────────
  useEffect(() => {
    setExpandedSubtopicId(null);
  }, [selectedTopicId]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleSubtopicExpanded = (subtopicId) =>
    setExpandedSubtopicId((prev) => (prev === subtopicId ? null : subtopicId));

  
  const addTopic = async () => {
    const t = newTopicTitle.trim();
    if (!t) {
      handleError("Topic name is required");
      return;
    }
    try {
      const res = await api.post("/assignment/create-topic", { name: t });
      const created = res.data?.topic; // { id, name, createdBy }
      const newTopic = {
        serverTopicId: created.id,
        title: created.name,
        subtopics: [],         
      };

      setData((prev) => [...prev, newTopic]);
      setSelectedTopicId(created.id); // point directly at the new topic
      setNewTopicTitle("");
      setNewTopicMode(false);
    } catch (err) {
      handleError(err?.response?.data?.msg || "Failed to create topic");
    }
  };

  const addSubtopic = async() => {
    if (!newSubtopic.name.trim() || !selectedTopicId) return;
      try {
        const res = await api.post("/assignment/create-subtopic",{
          topicId: selectedTopicId,
          name : newSubtopic.name 
        })
        const subtopic = res.data?.subTopic;
      setData((prev) => 
        
        prev.map((t) => 
        (
            t.serverTopicId === selectedTopicId ? {
            ...t,
             subtopics: [
              ...t.subtopics,
              {
                serverSubtopicId: subtopic.id,
                name : subtopic.name,
                problems: []
              }

                
             ]

          } : t
        )
      ) 
          
        )
        setNewSubtopic({ name: "" });
        setAddSubtopicForTopic(false);
        
      } catch (error) {
        handleError(error?.response?.data?.msg || "Error creating the subtopic")
        
      } 
      
  };

  const goAssignProblems = (topicId, subtopicId) => {
    if (!batchId) return;
    navigate("/teacher/problems", {
      state: {
        assignMode: true,
        batchId,
        returnPath: `/teacher/${batchId}/content`,
        topicId,     
        subtopicId,
      },
    });
  };

  const openCreateProblemModal = (topicId, subtopicId) => {
    setCreateProblemForm({ title: "", link: "", difficulty: "EASY", platformId: "" });
    setCreateProblemTarget({ topicId, subtopicId }); // ✅ store IDs
    // TODO: fetch platforms
  };

  const closeCreateProblemModal = () => {
    setCreateProblemTarget(null);
    setCreateProblemSubmitting(false);
  };

  const handleCreateProblemSubmit = async (e) => {
    e.preventDefault();
    if (!createProblemTarget) return;
    try {
      const res = await api.post('/assignment/',{


      })
      
    } catch (error) {
      
    }


  
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-0 bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Top bar */}
      <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-amber-800">
              <Library className="h-5 w-5 shrink-0" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Batch workspace
              </span>
              {batchName && (
                <span className="truncate text-sm font-semibold text-slate-800">
                  · {batchName}
                </span>
              )}
            </div>
            {isTeacherBatch && batchId && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/teacher/problems")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <ListTree className="h-3.5 w-3.5" />
                  My Problem List
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/teacher/${batchId}/problemslist`)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Open batch problem list
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 lg:px-6">
        {(Boolean(batchId) || data.length > 0) && (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">

            {/* ── Topics sidebar ── */}
            <aside className="w-full shrink-0 lg:w-52 xl:w-56">
              <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <p className="px-1.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Topics
                </p>
                <nav className="space-y-0.5">
                  {data.map((t) => (
                    // ✅ key is now the stable DB id, not the array index
                    <button
                      key={t.serverTopicId}
                      type="button"
                      onClick={() => setSelectedTopicId(t.serverTopicId)}
                      title={`${t.subtopics?.length ?? 0} subtopics`}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition ${
                        selectedTopicId === t.serverTopicId
                          ? "bg-amber-50 ring-1 ring-amber-200"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate font-medium text-slate-900">
                        {t.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {t.subtopics?.length ?? 0} st
                      </span>
                    </button>
                  ))}
                </nav>

                {isTeacherBatch && (
                  <div className="mt-2 border-t border-slate-100 pt-2">
                    {!newTopicMode ? (
                      <button
                        type="button"
                        onClick={() => setNewTopicMode(true)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-700 hover:border-amber-400 hover:bg-amber-50/50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        New topic
                      </button>
                    ) : (
                      <div className="space-y-2 rounded-lg bg-slate-50 p-2">
                        <input
                          type="text"
                          placeholder="Topic title"
                          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                          value={newTopicTitle}
                          onChange={(e) => setNewTopicTitle(e.target.value)}
                          autoFocus
                        />
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={addTopic}
                            className="flex-1 rounded-md bg-slate-900 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => { setNewTopicMode(false); setNewTopicTitle(""); }}
                            className="rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* ── Main workspace ── */}
            <main className="min-w-0 flex-1">
              {data.length === 0 && isTeacherBatch && (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 text-center">
                  <BookOpen className="mx-auto h-9 w-9 text-slate-300" />
                  <p className="mt-3 text-base font-medium text-slate-800">No topics yet</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Use <strong>New topic</strong> in the sidebar to start this batch.
                  </p>
                </div>
              )}

              {topic && (
                <>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{topic.title}</h2>
                    {isTeacherBatch && (
                      <button
                        type="button"
                        onClick={() => setAddSubtopicForTopic(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-600"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add subtopic
                      </button>
                    )}
                  </div>

                  {/* New-subtopic form */}
                  {isTeacherBatch && addSubtopicForTopic && (
                    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="text-xs font-semibold text-slate-800">New subtopic</h3>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Name (e.g. Lecture 1: Sorting)"
                          className="rounded-md border border-slate-200 px-2 py-1.5 text-sm sm:col-span-2"
                          value={newSubtopic.name}
                          onChange={(e) =>
                            setNewSubtopic({ ...newSubtopic, name: e.target.value })
                          }
                        />
                        
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={addSubtopic}
                          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                        >
                          Save subtopic
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddSubtopicForTopic(false);
                            setNewSubtopic({ name: ""});
                          }}
                          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Subtopics list */}
                  <div className="space-y-3">
                    {topicSubtopics.length === 0 && !addSubtopicForTopic && (
                      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-5 text-center text-xs text-slate-600">
                        No subtopics yet. Add one above, then assign problems from your bank.
                      </p>
                    )}

                    {topicSubtopics.map((sub) => {
                      // ✅ expanded check uses subtopic ID, not array index
                      const expanded = expandedSubtopicId === sub.serverSubtopicId;
                      return (
                        <section
                          key={sub.serverSubtopicId}
                          className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm"
                        >
                          <div className="flex flex-wrap items-stretch gap-2 bg-slate-50/80 px-3 py-2.5 sm:px-4">
                            <div
                              role="button"
                              tabIndex={0}
                              aria-expanded={expanded}
                              onClick={() => toggleSubtopicExpanded(sub.serverSubtopicId)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  toggleSubtopicExpanded(sub.serverSubtopicId);
                                }
                              }}
                              className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-lg outline-none ring-amber-400 focus-visible:ring-2"
                            >
                              <ChevronRight
                                className={`mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                                  expanded ? "rotate-90" : ""
                                }`}
                                aria-hidden
                              />
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-slate-900">
                                  {sub.name}
                                </h3>
                                
                              </div>
                            </div>

                            {isTeacherBatch && (
                              <div
                                className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-200/80 pt-3 sm:border-t-0 sm:pt-0 sm:pl-2 sm:border-l sm:border-slate-200/80"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    openCreateProblemModal(topic.serverTopicId, sub.serverSubtopicId)
                                  }
                                  className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
                                >
                                  <PenLine className="h-3.5 w-3.5" aria-hidden />
                                  Create problem
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    goAssignProblems(topic.serverTopicId, sub.serverSubtopicId)
                                  }
                                  className="rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-50"
                                >
                                  Assign from bank
                                </button>
                              </div>
                            )}
                          </div>

                          {expanded && (
                            <div className="border-t border-slate-100 p-3">
                              {sub.problems.length === 0 ? (
                                <p className="py-3 text-center text-xs text-slate-500">
                                  No problems yet.{" "}
                                  <strong className="text-slate-700">Create problem</strong>{" "}
                                  (new) or{" "}
                                  <strong className="text-slate-700">Assign from bank</strong>.
                                </p>
                              ) : (
                                <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/40">
                                  {sub.problems.map((p) => (
                                    // ✅ key uses stable problemId not array index
                                    <li
                                      key={p.problemId}
                                      className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm sm:flex-nowrap"
                                    >
                                      <span className={diffBadge(p.difficulty)}>
                                        {p.difficulty}
                                      </span>
                                      <span
                                        className={platformStyleClass(displayPlatform(p))}
                                        title={displayPlatform(p)}
                                      >
                                        {displayPlatform(p)}
                                      </span>
                                      <span className="min-w-0 flex-1 font-medium text-slate-900">
                                        {p.name}
                                      </span>
                                      <a
                                        href={p.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
                                      >
                                        Open
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                </>
              )}
            </main>
          </div>
        )}
      </div>

      {/* ── Create-problem modal ── */}
      {createProblemTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center"
          role="presentation"
          onClick={closeCreateProblemModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-problem-modal-title"
          >
            <div className="flex items-start justify-between gap-3">
              <h2
                id="create-problem-modal-title"
                className="text-lg font-bold text-slate-900"
              >
                Create problem in this subtopic
              </h2>
              <button
                type="button"
                onClick={closeCreateProblemModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProblemSubmit} className="mt-5 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Title</label>
                <input
                  type="text"
                  value={createProblemForm.title}
                  onChange={(e) =>
                    setCreateProblemForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">URL</label>
                <input
                  type="url"
                  value={createProblemForm.link}
                  onChange={(e) =>
                    setCreateProblemForm((p) => ({ ...p, link: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="https://…"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Difficulty</label>
                <select
                  value={createProblemForm.difficulty}
                  onChange={(e) =>
                    setCreateProblemForm((p) => ({ ...p, difficulty: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Platform</label>
                {platformsLoading ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Loading platforms…
                  </div>
                ) : (
                  <select
                    value={createProblemForm.platformId}
                    onChange={(e) =>
                      setCreateProblemForm((p) => ({ ...p, platformId: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select platform</option>
                    {platforms.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeCreateProblemModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProblemSubmitting || platformsLoading || !platforms.length}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createProblemSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Saving…
                    </>
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}