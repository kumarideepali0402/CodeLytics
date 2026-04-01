/** Label for UI: outline uses string `platform`; API rows may use `platform.name`. */
export function displayPlatform(problem) {
  if (!problem) return "—";
  if (typeof problem.platform === "string" && problem.platform.trim()) {
    return problem.platform.trim();
  }
  if (problem.platform?.name) return String(problem.platform.name);
  return "—";
}

/** Tailwind classes for a compact platform pill (GFG / LeetCode / Codeforces / …). */
export function platformStyleClass(platformLabel) {
  const u = String(platformLabel || "")
    .trim()
    .toLowerCase();
  const base =
    "inline-flex max-w-[7.5rem] truncate rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1";
  if (u.includes("leetcode")) return `${base} bg-orange-50 text-orange-900 ring-orange-200/80`;
  if (u.includes("gfg") || u.includes("geeksforgeeks") || u === "geeks")
    return `${base} bg-emerald-50 text-emerald-900 ring-emerald-200/80`;
  if (u.includes("codeforces") || u === "cf")
    return `${base} bg-sky-50 text-sky-900 ring-sky-200/80`;
  if (u === "—" || u === "" || u === "-")
    return `${base} bg-slate-50 text-slate-500 ring-slate-200/70`;
  return `${base} bg-violet-50 text-violet-900 ring-violet-200/80`;
}
