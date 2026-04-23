import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Search,
  Users,
  LayoutGrid,
} from "lucide-react";
import { normalizeOutlineShape, recomputeAll } from "../utils/batchOutlineShape";
import { displayPlatform, platformStyleClass } from "../utils/problemDisplay";
import {
  buildSolveMatrix,
  getStatsForSubtopic,
  problemStandingsKey,
} from "../utils/teacherBatchStandings";
import ClassStandingsModal from "../components/ClassStandingsModal";
import ProblemStandingsModal from "../components/ProblemStandingsModal"
import axiosClient from "../utils/axiosClient";
import { handleError } from "../utils/notification";

const MOCK_BATCH_STUDENTS = [
  { id: "demo-1", name: "Aarav Sharma" },
  { id: "demo-2", name: "Priya Nair" },
  { id: "demo-3", name: "Rahul Verma" },
  { id: "demo-4", name: "Sneha Iyer" },
  { id: "demo-5", name: "Karan Mehta" },
  { id: "demo-6", name: "Ananya Das" },
  { id: "demo-7", name: "Vikram Singh" },
  { id: "demo-8", name: "Meera Krishnan" },
];

const DUMMY_OUTLINE = [
  {
    title: "Arrays & Strings",
    subtopics: [
      {
        title: "Sliding Window",
        problems: [
          { name: "Longest Substring Without Repeating Characters", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Maximum Sum Subarray of Size K", link: "https://leetcode.com/problems/maximum-average-subarray-i/", difficulty: "Easy", platform: "LeetCode" },
          { name: "Minimum Window Substring", link: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "Hard", platform: "LeetCode" },
          { name: "Permutation in String", link: "https://leetcode.com/problems/permutation-in-string/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Fruit Into Baskets", link: "https://leetcode.com/problems/fruit-into-baskets/", difficulty: "Medium", platform: "LeetCode" },
        ],
      },
      {
        title: "Two Pointers",
        problems: [
          { name: "Two Sum II", link: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Container With Most Water", link: "https://leetcode.com/problems/container-with-most-water/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Trapping Rain Water", link: "https://leetcode.com/problems/trapping-rain-water/", difficulty: "Hard", platform: "LeetCode" },
          { name: "3Sum", link: "https://leetcode.com/problems/3sum/", difficulty: "Medium", platform: "LeetCode" },
        ],
      },
      {
        title: "Prefix Sum",
        problems: [
          { name: "Range Sum Query", link: "https://leetcode.com/problems/range-sum-query-immutable/", difficulty: "Easy", platform: "LeetCode" },
          { name: "Subarray Sum Equals K", link: "https://leetcode.com/problems/subarray-sum-equals-k/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Product of Array Except Self", link: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "Medium", platform: "LeetCode" },
        ],
      },
      {
        title: "Binary Search on Array",
        problems: [
          { name: "Search in Rotated Sorted Array", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Find Minimum in Rotated Sorted Array", link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Median of Two Sorted Arrays", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/", difficulty: "Hard", platform: "LeetCode" },
        ],
      },
    ],
  },
  {
    title: "Dynamic Programming",
    subtopics: [
      {
        title: "1D DP",
        problems: [
          { name: "Climbing Stairs", link: "https://leetcode.com/problems/climbing-stairs/", difficulty: "Easy", platform: "LeetCode" },
          { name: "House Robber", link: "https://leetcode.com/problems/house-robber/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Coin Change", link: "https://leetcode.com/problems/coin-change/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Word Break", link: "https://leetcode.com/problems/word-break/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Decode Ways", link: "https://leetcode.com/problems/decode-ways/", difficulty: "Medium", platform: "LeetCode" },
        ],
      },
      {
        title: "2D DP",
        problems: [
          { name: "Unique Paths", link: "https://leetcode.com/problems/unique-paths/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Longest Common Subsequence", link: "https://leetcode.com/problems/longest-common-subsequence/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Edit Distance", link: "https://leetcode.com/problems/edit-distance/", difficulty: "Hard", platform: "LeetCode" },
          { name: "Interleaving String", link: "https://leetcode.com/problems/interleaving-string/", difficulty: "Medium", platform: "LeetCode" },
        ],
      },
      {
        title: "Knapsack",
        problems: [
          { name: "Partition Equal Subset Sum", link: "https://leetcode.com/problems/partition-equal-subset-sum/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Target Sum", link: "https://leetcode.com/problems/target-sum/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Ones and Zeroes", link: "https://leetcode.com/problems/ones-and-zeroes/", difficulty: "Medium", platform: "LeetCode" },
        ],
      },
    ],
  },
  {
    title: "Graphs",
    subtopics: [
      {
        title: "BFS & DFS",
        problems: [
          { name: "Number of Islands", link: "https://leetcode.com/problems/number-of-islands/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Rotten Oranges", link: "https://leetcode.com/problems/rotting-oranges/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Word Ladder", link: "https://leetcode.com/problems/word-ladder/", difficulty: "Hard", platform: "LeetCode" },
          { name: "Clone Graph", link: "https://leetcode.com/problems/clone-graph/", difficulty: "Medium", platform: "LeetCode" },
        ],
      },
      {
        title: "Shortest Path",
        problems: [
          { name: "Network Delay Time", link: "https://leetcode.com/problems/network-delay-time/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Cheapest Flights Within K Stops", link: "https://leetcode.com/problems/cheapest-flights-within-k-stops/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Path With Minimum Effort", link: "https://leetcode.com/problems/path-with-minimum-effort/", difficulty: "Medium", platform: "LeetCode" },
        ],
      },
      {
        title: "Topological Sort",
        problems: [
          { name: "Course Schedule", link: "https://leetcode.com/problems/course-schedule/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Course Schedule II", link: "https://leetcode.com/problems/course-schedule-ii/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Alien Dictionary", link: "https://leetcode.com/problems/alien-dictionary/", difficulty: "Hard", platform: "LeetCode" },
        ],
      },
    ],
  },
  {
    title: "Trees & BST",
    subtopics: [
      {
        title: "Tree Traversals",
        problems: [
          { name: "Binary Tree Inorder Traversal", link: "https://leetcode.com/problems/binary-tree-inorder-traversal/", difficulty: "Easy", platform: "LeetCode" },
          { name: "Binary Tree Level Order Traversal", link: "https://leetcode.com/problems/binary-tree-level-order-traversal/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Binary Tree Zigzag Level Order", link: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/", difficulty: "Medium", platform: "LeetCode" },
        ],
      },
      {
        title: "BST Operations",
        problems: [
          { name: "Validate Binary Search Tree", link: "https://leetcode.com/problems/validate-binary-search-tree/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Kth Smallest Element in BST", link: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", difficulty: "Medium", platform: "LeetCode" },
          { name: "Lowest Common Ancestor of BST", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", difficulty: "Medium", platform: "LeetCode" },
        ],
      },
    ],
  },
];

function difficultyBadge(difficulty) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums";
  if (difficulty === "Easy") return `${base} bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80`;
  if (difficulty === "Medium") return `${base} bg-amber-50 text-amber-900 ring-1 ring-amber-200/80`;
  return `${base} bg-rose-50 text-rose-800 ring-1 ring-rose-200/80`;
}

export default function TeacherProblemList() {
  const { id: batchId } = useParams();
  const [rawOutline, setRawOutline] = useState([]);
  const [loading, setLoading] = useState(true); // ADDED: loading state for fetch lifecycle
  const [batchStudents] = useState([...MOCK_BATCH_STUDENTS]);
  const [openTopics, setOpenTopics] = useState({});
  const [openSubtopics, setOpenSubtopics] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [standingsModal, setStandingsModal] = useState(null);
  const [cfBoardModal, setCfBoardModal] = useState(null);

  useEffect(() => {
    if (!batchId) return;
    const fetchContentOutline = async () => {
      setLoading(true); 
      try {
        const res = await axiosClient.get(`/assignment/batch-outline/${batchId}`);
        const contentOutline = res.data?.outline ?? []; // CHANGED: fallback to [] so rawOutline stays an array
        setRawOutline(contentOutline);
      } catch (error) {
        console.error("Error fetching content outline", error);
        // CHANGED: was error.response.data?.msg which crashes on network errors (no response object)
        handleError(error.response?.data?.msg ?? "Failed to load problem list");
      } finally {
        setLoading(false); // ADDED: always clear loading, success or failure
      }
    };
    fetchContentOutline();
  }, [batchId]);

  const data = useMemo(() => {
    if (!rawOutline.length) return [];
    const normalized = structuredClone(rawOutline);
    normalizeOutlineShape(normalized);
    recomputeAll(normalized);
    return normalized;
  }, [rawOutline]);


  //TODO: understand it later
  const solveMatrix = useMemo(() => buildSolveMatrix(data, batchStudents), [data, batchStudents]);

  const toggleTopic = (topicId) => setOpenTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  const toggleSubtopic = (topicId, subtopicId) => {
    const key = `${topicId}-${subtopicId}`;
    setOpenSubtopics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const problemVisible = (p) => {
    const q = searchQuery.trim().toLowerCase();
    if (q && !String(p.name).toLowerCase().includes(q)) return false;
    if (difficultyFilter !== "all" && p.difficulty !== difficultyFilter) return false;
    return true;
  };


  // TODO: understand later
  const totalProblemSlots = useMemo(() => {
    let n = 0;
    data.forEach((t) => t.subtopics.forEach((c) => { n += c.problems.length; }));
    return n;
  }, [data]);

  // TODO: understand later
  const totalSolves = useMemo(() => {
    let n = 0;
    solveMatrix.forEach((v) => { n += v.solvedCount; });
    return n;
  }, [solveMatrix]);

  return (
    <div className="mt-1 min-h-0 bg-gradient-to-b from-slate-50/80 to-white pb-8 text-slate-900">
      <div className="border-b border-slate-200/90 bg-white/95 px-4 py-3 shadow-sm sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-700">
            Batch standings
          </p>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Problem list
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
        {/* ADDED: loading spinner shown while the outline is being fetched */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
            Loading problem list…
          </div>
        )}

        {/* ADDED: empty state shown after a successful fetch with no assignments yet */}
        {!loading && data.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-600">No problems assigned to this batch yet.</p>
            <p className="mt-1 text-xs text-slate-400">Assign problems from the Content tab to see them here.</p>
          </div>
        )}

        {/* CHANGED: added !loading guard so these panels don't flash on first render */}
        {!loading && data.length > 0 && (
          <div className="mb-2 flex flex-col gap-2 rounded-lg border border-slate-200/90 bg-white px-2.5 py-2 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:py-1.5">
            <div className="relative min-w-0 flex-1 sm:min-w-[12rem]">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search problems…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-2 text-xs outline-none ring-sky-200 transition focus:border-sky-300 focus:bg-white focus:ring-1"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label htmlFor="difficulty-filter-teacher" className="shrink-0 text-[11px] font-medium text-slate-500">
                Difficulty
              </label>
              <select
                id="difficulty-filter-teacher"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="rounded-md border border-slate-200 bg-white py-1.5 pl-2 pr-7 text-xs font-medium text-slate-800 outline-none ring-sky-200 transition focus:border-sky-400 focus:ring-1"
              >
                <option value="all">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <p className="flex items-center gap-1 text-[11px] text-slate-500 sm:ml-auto sm:shrink-0">
              <Users className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              <span>
                <span className="font-semibold tabular-nums text-slate-800">{batchStudents.length}</span> students (demo)
              </span>
            </p>
          </div>
        )}

        {/* CHANGED: added !loading guard to match the pattern above */}
        {!loading && data.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-slate-200/80 bg-slate-50/90 px-2.5 py-1.5 text-[11px] text-slate-600">
            <span className="font-semibold uppercase tracking-wide text-slate-500">Class solves (demo)</span>
            <span className="font-bold tabular-nums text-slate-900">
              {totalSolves}
              <span className="font-semibold text-slate-400"> / </span>
              {totalProblemSlots * batchStudents.length || 0}
            </span>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>|</span>
            <span><span className="text-slate-500">Problems</span> <strong className="tabular-nums text-slate-900">{totalProblemSlots}</strong></span>
            <span className="text-slate-300">·</span>
            <span><span className="text-slate-500">Students</span> <strong className="tabular-nums text-slate-900">{batchStudents.length}</strong></span>
          </div>
        )}

       
        {!loading && data.length > 0 && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-sm ring-1 ring-slate-100">
            {data.map((topic, tIndex) => (
              <div key={topic.id} className={tIndex > 0 ? "border-t border-slate-100" : ""}>
                <div
                  className="flex cursor-pointer items-center justify-between gap-3 bg-gradient-to-r from-slate-50/90 to-white px-4 py-3.5 transition-colors hover:from-slate-100/80 sm:px-5 sm:py-4"
                  onClick={() => toggleTopic(topic.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTopic(topic.id); } }}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {openTopics[topic.id]
                      ? <ChevronDown size={20} className="shrink-0 text-slate-500" aria-hidden />
                      : <ChevronRight size={20} className="shrink-0 text-slate-500" aria-hidden />
                    }
                    <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{topic.title}</h2>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    {(topic.subtopics ?? []).reduce((a, c) => a + (c.problems?.length ?? 0), 0)} problems
                  </span>
                </div>

                {openTopics[topic.id] && (
                  <div className="space-y-1 border-t border-slate-100 bg-white px-3 py-3 sm:px-5 sm:py-4">
                    {!(topic.subtopics ?? []).length ? (
                      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600">
                        No subtopics under this topic yet. Add subtopics in the{" "}
                        <strong className="text-slate-800">Content</strong> tab, then assign problems.
                      </p>
                    ) : (
                      topic.subtopics.map((subtopic, sIndex) => {
                        const subProblems = subtopic.problems ?? [];
                        const visibleProblems = subProblems.filter(problemVisible);
                        const subStats = getStatsForSubtopic(data, tIndex, sIndex, solveMatrix, batchStudents);

                        return (
                          <div key={subtopic.id} className="rounded-xl border border-slate-100 bg-slate-50/40">
                            <div
                              className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-slate-100/60 sm:px-4 sm:py-3"
                              onClick={() => toggleSubtopic(topic.id, subtopic.id)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSubtopic(topic.id, subtopic.id); } }}
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-2">
                                {openSubtopics[`${topic.id}-${subtopic.id}`]
                                  ? <ChevronDown size={16} className="shrink-0 text-slate-500" aria-hidden />
                                  : <ChevronRight size={16} className="shrink-0 text-slate-500" aria-hidden />
                                }
                                <h3 className="truncate text-sm font-semibold text-slate-800 sm:text-[15px]">
                                  {subtopic.title}
                                </h3>
                                {subtopic.notesLink && subtopic.notesLink !== "#" && (
                                  <a
                                    href={classItem.notesLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-1 inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Notes <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                              <div className="flex shrink-0 flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (subProblems.length > 0) setCfBoardModal({ tIndex, sIndex });
                                  }}
                                  disabled={subProblems.length === 0}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                                >
                                  <LayoutGrid className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                  Class standings
                                </button>
                                <span className="text-xs font-medium text-sky-800">
                                  {subStats?.totalSolves ?? 0} class solves · {subProblems.length} problems
                                </span>
                              </div>
                            </div>

                            {openSubtopics[`${topic.id}-${subtopic.id}`] && (
                              <div className="border-t border-slate-100 bg-white px-2 pb-3 pt-1 sm:px-3 sm:pb-4">
                                {visibleProblems.length === 0 ? (
                                  <p className="py-6 text-center text-sm text-slate-500">
                                    {subProblems.length === 0
                                      ? "No problems in this subtopic."
                                      : "No problems match your search or filters."}
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto overflow-hidden rounded-lg border border-slate-200/90 shadow-inner">
                                    <table className="w-full min-w-[320px] border-collapse text-sm">
                                      <thead>
                                        <tr className="bg-slate-100/90 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                          <th className="px-3 py-2.5 sm:px-4">Problem</th>
                                          <th className="px-3 py-2.5 sm:w-28">Platform</th>
                                          <th className="px-3 py-2.5 sm:w-32">Difficulty</th>
                                          <th className="px-3 py-2.5 sm:w-28">Practice</th>
                                          <th className="px-3 py-2.5 text-right sm:w-36">Class</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {subProblems.map((p, pIndex) => {
                                          if (!problemVisible(p)) return null;
                                          const pk = problemStandingsKey(tIndex, sIndex, pIndex, p.name);
                                          const cell = solveMatrix.get(pk);
                                          return (
                                            <tr key={pIndex} className="bg-white transition-colors hover:bg-slate-50/90">
                                              <td className="px-3 py-2.5 font-medium text-slate-900 sm:px-4 sm:py-3">{p.name}</td>
                                              <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                                <span className={platformStyleClass(displayPlatform(p))} title={displayPlatform(p)}>
                                                  {displayPlatform(p)}
                                                </span>
                                              </td>
                                              <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                                <span className={difficultyBadge(p.difficulty)}>{p.difficulty}</span>
                                              </td>
                                              <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                                <a
                                                  href={p.link}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                                                >
                                                  Open <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                                                </a>
                                              </td>
                                              <td className="px-3 py-2.5 text-right sm:py-3">
                                                <button
                                                  type="button"
                                                  onClick={() => setStandingsModal({ tIndex, sIndex, pIndex, problem: p, cell })}
                                                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-900 hover:bg-sky-100"
                                                >
                                                  <Users className="h-3.5 w-3.5" />
                                                  {cell ? `${cell.solvedCount}/${cell.totalStudents}` : "—"}
                                                </button>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ClassStandingsModal
        cfBoardModal={cfBoardModal}
        setCfBoardModal={setCfBoardModal}
        setStandingsModal={setStandingsModal}
        data={data}
        solveMatrix={solveMatrix}
        batchStudents={batchStudents}
      />

      <ProblemStandingsModal
        standingsModal={standingsModal}
        setStandingsModal={setStandingsModal}
      />
    </div>
  );
}
