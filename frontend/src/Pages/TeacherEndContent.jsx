import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  BookOpen,
  Library,
  ExternalLink,
  ChevronRight,
  ListTree,
  Eye,
} from "lucide-react";
import { displayPlatform, platformStyleClass } from "../utils/problemDisplay";
import { handleError } from "../utils/notification";
import axiosClient from "../utils/axiosClient";

const diffBadge = (d) => {
  const base = "text-xs font-semibold px-2 py-0.5 rounded-full shrink-0";
  if (d === "Easy") return `${base} bg-emerald-100 text-emerald-800`;
  if (d === "Medium") return `${base} bg-orange-100 text-orange-800`;
  return `${base} bg-rose-100 text-rose-800`;
};


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
  const [selectedTopicId, setSelectedTopicId] = useState(location.state?.selectedTopicId ?? null);
  const pendingExpandSubtopicIds = useRef(
    location.state?.expandedSubtopicIds?.length ? new Set(location.state.expandedSubtopicIds) : null
  );

  // ── New-topic form ─────────────────────────────────────────────────────────
  const [newTopicMode, setNewTopicMode] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");

  // ── New-subtopic form ──────────────────────────────────────────────────────
  const [addSubtopicForTopic, setAddSubtopicForTopic] = useState(false);
  const [newSubtopic, setNewSubtopic] = useState({ name: "" });

  // ── Subtopic accordion  ─────────────────────────────────
  const [expandedSubtopicIds, setExpandedSubtopicIds] = useState(new Set());

  // ── Loading states ────────────────────────────────────────────────────────
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingSubtopicsTopicId, setLoadingSubtopicsTopicId] = useState(null);
  const [loadingProblemIds, setLoadingProblemIds] = useState(new Set());

  // ── Track which topics/subtopics have already been fetched ────────────────
  const loadedTopicIds = useRef(new Set());
  const loadedSubtopicIds = useRef(new Set());

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
        const res = await axiosClient.get("/teacher/get-batch");
        const batches = res.data?.batches ?? [];
        const matched = batches.find((b) => String(b.id) === String(batchId));
        setBatchName(matched?.name ?? null);
      } catch {
        setBatchName(null);
      }
    };
    fetchBatchName();
  }, [batchId, isTeacherBatch]);

  useEffect(()=>{
    const fetchTopics = async() => {
      try {
        const fetchedTopics = await axiosClient('/assignment/get-all-topics');
        setData(fetchedTopics.data.topics.map(t => ({serverTopicId: t.id, title: t.name, subtopics:[]})));
      } finally {
        setLoadingTopics(false);
      }
    }
    fetchTopics();
  }, [])
  useEffect(() => {
    if (data.length > 0 && !selectedTopicId) {
      setSelectedTopicId(data[0].serverTopicId);
    }
  }, [data]);

  // Restore previously expanded subtopics on return navigation
  useEffect(() => {
    if (!pendingExpandSubtopicIds.current) return;
    if (topicSubtopics.length === 0) return;
    const pending = pendingExpandSubtopicIds.current;
    pendingExpandSubtopicIds.current = null;
    topicSubtopics.forEach((s) => {
      if (pending.has(s.serverSubtopicId)) toggleSubtopicExpanded(s.serverSubtopicId);
    });
  }, [topicSubtopics]);

   useEffect(() => {
    setExpandedSubtopicIds(new Set());
    if (!selectedTopicId) return;
    if (loadedTopicIds.current.has(selectedTopicId)) return; // already fetched, skip

    const fetchSubtopics = async () => {
      setLoadingSubtopicsTopicId(selectedTopicId);
      try {
        const res = await axiosClient.get(`/assignment/get-all-subtopics/${selectedTopicId}`);
        loadedTopicIds.current.add(selectedTopicId);
        setData((prev) =>
          prev.map((t) =>
            t.serverTopicId === selectedTopicId
              ? {
                  ...t,
                  subtopics: res.data.subTopics.map((s) => ({
                    serverSubtopicId: s.id,
                    name: s.name,
                    problems: [],
                  })),
                }
              : t
          )
        );
      } catch (e) {
        console.log(e);
      } finally {
        setLoadingSubtopicsTopicId(null);
      }
    };
    fetchSubtopics();
  }, [selectedTopicId]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleSubtopicExpanded = async (subtopicId) => {
    const isExpanding = !expandedSubtopicIds.has(subtopicId);
    setExpandedSubtopicIds((prev) => {
      const next = new Set(prev);
      isExpanding ? next.add(subtopicId) : next.delete(subtopicId);
      return next;
    });

    if (isExpanding && batchId && !loadedSubtopicIds.current.has(subtopicId)) {
      loadedSubtopicIds.current.add(subtopicId);
      setLoadingProblemIds((prev) => new Set(prev).add(subtopicId));
      try {
        const res = await axiosClient.get(
          `/assignment/get-assigned-problems/${batchId}/${subtopicId}`
        );
        const fetched = res.data?.problems ?? [];
        setData((prev) =>
          prev.map((t) => ({
            ...t,
            subtopics: t.subtopics.map((s) =>
              s.serverSubtopicId === subtopicId ? { ...s, problems: fetched } : s
            ),
          }))
        );
      } catch (e) {
        console.log(e);
        loadedSubtopicIds.current.delete(subtopicId);
      } finally {
        setLoadingProblemIds((prev) => {
          const next = new Set(prev);
          next.delete(subtopicId);
          return next;
        });
      }
    }
  };

  
  const addTopic = async () => {
    const t = newTopicTitle.trim();
    if (!t) {
      handleError("Topic name is required");
      return;
    }
    try {
      const res = await axiosClient.post("/assignment/create-topic", { name: t });
      const created = res.data?.topic; // { id, name, createdBy }
      const newTopic = {
        id: created.id,
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
        const res = await axiosClient.post("/assignment/create-subtopic",{
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
              ...(t.subtopics ?? []),
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
        expandedSubtopicIds: [...expandedSubtopicIds],
      },
    });
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
                  My Problem Bank
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/teacher/${batchId}/problemslist`)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Assigned Problems
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
                  {loadingTopics ? (
                    <div className="flex items-center justify-center gap-1 py-4 text-xs text-slate-400">
                      <span className="animate-bounce [animation-delay:0ms]">·</span>
                      <span className="animate-bounce [animation-delay:150ms]">·</span>
                      <span className="animate-bounce [animation-delay:300ms]">·</span>
                    </div>
                  ) : null}
                  {!loadingTopics && data.map((t) => (
                    // Fixed: key, onClick, and active-class check were all using t.id
                    // which doesn't exist — topics are stored with serverTopicId.
                    // Using t.id was setting selectedTopicId to undefined on click,
                    // so the subtopic fetch guard bailed and nothing rendered.
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
                    {loadingSubtopicsTopicId === selectedTopicId ? (
                      <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-5 text-center text-xs text-slate-500 justify-center">
                        <span className="inline-flex gap-1">
                          <span className="animate-bounce [animation-delay:0ms]">·</span>
                          <span className="animate-bounce [animation-delay:150ms]">·</span>
                          <span className="animate-bounce [animation-delay:300ms]">·</span>
                        </span>
                        Loading subtopics
                      </div>
                    ) : topicSubtopics.length === 0 && !addSubtopicForTopic && (
                      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-5 text-center text-xs text-slate-600">
                        No subtopics yet. Add one above, then assign problems from your bank.
                      </p>
                    )}

                    {topicSubtopics.map((sub) => {
                      // ✅ expanded check uses subtopic ID, not array index
                      const expanded = expandedSubtopicIds.has(sub.serverSubtopicId);
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
                            <div className="border-t border-slate-100 bg-gradient-to-br from-slate-100/80 via-white/60 to-indigo-50/60 p-3">
                              {loadingProblemIds.has(sub.serverSubtopicId) ? (
                                <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-500">
                                  <span className="inline-flex gap-1">
                                    <span className="animate-bounce [animation-delay:0ms]">·</span>
                                    <span className="animate-bounce [animation-delay:150ms]">·</span>
                                    <span className="animate-bounce [animation-delay:300ms]">·</span>
                                  </span>
                                  Loading problems
                                </div>
                              ) : sub.problems.length === 0 ? (
                                <p className="py-3 text-center text-xs text-slate-500">
                                  No problems yet. Use{" "}
                                  <strong className="text-slate-700">Assign from bank</strong>{" "}
                                  to add problems.
                                </p>
                              ) : (
                                <ul className="space-y-2">
                                  {sub.problems.map((p) => (
                                    <li
                                      key={p.problemId}
                                      className="flex items-center gap-3 rounded-xl border border-white/60 bg-white/40 px-4 py-2.5 text-sm shadow-sm backdrop-blur-md backdrop-saturate-150"
                                    >
                                      <span className="min-w-0 flex-1 font-medium text-slate-900 truncate">
                                        {p.name}
                                      </span>
                                      <div className="flex shrink-0 items-center gap-2">
                                        <span className={diffBadge(p.difficulty)}>
                                          {p.difficulty}
                                        </span>
                                        <span
                                          className={platformStyleClass(displayPlatform(p))}
                                          title={displayPlatform(p)}
                                        >
                                          {displayPlatform(p)}
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
                                      </div>
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

    </div>
  );
}