export function problemStandingsKey(tIndex, sIndex, pIndex, problemName) {
  return `${tIndex}-${sIndex}-${pIndex}:${problemName || ""}`;
}

export function buildRealSolveMatrix(outline, students, statusMap) {
  const map = new Map();
  if (!Array.isArray(outline) || !students?.length || !statusMap) return map;

  outline.forEach((topic, tIdx) => {
    topic.subtopics.forEach((subtopic, sIdx) => {
      subtopic.problems.forEach((p, pIdx) => {
        const key = problemStandingsKey(tIdx, sIdx, pIdx, p.name);
        const solvers = [];
        const nonSolvers = [];
        students.forEach((st) => {
          if (statusMap[`${p.assignmentId}_${st.id}`] === "SOLVED") { // key: assignmentId_studentId → "SOLVED"
            solvers.push({ id: st.id, name: st.name });
          } else {
            nonSolvers.push({ id: st.id, name: st.name });
          }
        });
        map.set(key, { solvers, nonSolvers, solvedCount: solvers.length, totalStudents: students.length });
      });
    });
  });
  return map;
}

export function problemColumnLabel(index) { // A, B, C… like Codeforces; fallback P{n} after 26
  if (index < 26) return String.fromCharCode(65 + index);
  return `P${index + 1}`;
}

export function buildSubtopicRows(students, tIndex, sIndex, problems, solveMatrix) {
  if (!students?.length || !problems?.length) return [];
  const rows = students.map((st) => {
    let total = 0;
    const cells = problems.map((p, pi) => {
      const pk = problemStandingsKey(tIndex, sIndex, pi, p.name);
      const solved = solveMatrix?.get(pk)?.solvers?.some((s) => s.id === st.id) ?? false;
      if (solved) total += 1;
      return { pk, solved };
    });
    return { student: st, total, cells };
  });
  rows.sort((a, b) => b.total - a.total);
  rows.forEach((row) => {
    row.rank = rows.filter((r) => r.total > row.total).length + 1; // ties share the same rank
  });
  return rows;
}

