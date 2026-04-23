/**
 * Deterministic mock: which students solved which problem (until backend provides real data).
 */

function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function problemStandingsKey(tIndex, cIndex, pIndex, problemName) {
  return `${tIndex}-${cIndex}-${pIndex}:${problemName || ""}`;
}

/**
 * @param {string} studentId
 * @param {string} key - from problemStandingsKey
 * @param {number} solveRatePct - 0-100 typical solve rate
 */
export function mockStudentSolved(studentId, key, solveRatePct = 55) {
  const h = hash32(`${studentId}|${key}`);
  return h % 100 < solveRatePct;
}

/**
 * @param {Array<{id: string, name: string}>} students
 * @param {object} outline - topics tree
 * @returns {Map<string, { solvers: Array<{id:string,name:string}>, nonSolvers: Array<{id:string,name:string}>, solvedCount: number }>}
 */
export function buildSolveMatrix(outline, students) {
  const map = new Map();
  if (!Array.isArray(outline) || !students?.length) return map;

  outline.forEach((topic, tIdx) => {
    topic.subtopics.forEach((cls, cIdx) => {
      cls.problems.forEach((p, pIdx) => {
        const key = problemStandingsKey(tIdx, cIdx, pIdx, p.name);
        const solvers = [];
        const nonSolvers = [];
        students.forEach((st) => {
          if (mockStudentSolved(st.id, key)) {
            solvers.push({ id: st.id, name: st.name });
          } else {
            nonSolvers.push({ id: st.id, name: st.name });
          }
        });
        map.set(key, {
          solvers,
          nonSolvers,
          solvedCount: solvers.length,
          totalStudents: students.length,
        });
      });
    });
  });
  return map;
}

export function getStatsForSubtopic(outline, tIndex, cIndex, matrix, students) {
  const topic = outline[tIndex];
  const cls = topic?.subtopics?.[cIndex];
  if (!cls?.problems?.length || !students?.length) {
    return { totalSolves: 0, maxSolves: 0 };
  }
  let totalSolves = 0;
  const maxSolves = cls.problems.length * students.length;
  cls.problems.forEach((p, pIdx) => {
    const key = problemStandingsKey(tIndex, cIndex, pIdx, p.name);
    const cell = matrix.get(key);
    if (cell) totalSolves += cell.solvedCount;
  });
  return { totalSolves, maxSolves };
}

/** CF-style max points per problem (by difficulty). */
export function maxPointsForProblem(p) {
  const d = p?.difficulty;
  if (d === "Easy") return 500;
  if (d === "Medium") return 1000;
  if (d === "Hard") return 1500;
  return 500;
}

/**
 * Solved cell: full points + deterministic "solve time" label (mock).
 * @returns {{ solved: boolean, points: number, timeLabel: string }}
 */
export function mockSolveCellDetail(studentId, key, maxPoints) {
  const solved = mockStudentSolved(studentId, key);
  if (!solved) return { solved: false, points: 0, timeLabel: "" };
  const h = hash32(`${studentId}|${key}|t`);
  const totalSecs = (h % 7200) + 60;
  const mm = String(Math.floor(totalSecs / 60)).padStart(2, "0");
  const ss = String(totalSecs % 60).padStart(2, "0");
  return { solved: true, points: maxPoints, timeLabel: `${mm}:${ss}` };
}

/** Mock: attempted (submit) = solved or random attempt (for "Tried" row). */
export function mockAttempted(studentId, key) {
  if (mockStudentSolved(studentId, key)) return true;
  const h = hash32(`${studentId}|${key}|try`);
  return h % 100 < 38;
}

/** Column header letter like Codeforces A, B, … */
export function problemColumnLabel(index) {
  if (index < 26) return String.fromCharCode(65 + index);
  return `P${index + 1}`;
}

/**
 * Rows sorted by number of solves; rank = 1 + count with strictly higher total (ties share rank).
 * @returns {Array<{ student: {id:string,name:string}, total: number, rank: number, cells: Array<{pk:string,solved:boolean}> }>}
 */
export function buildSubtopicCfRows(students, tIndex, cIndex, problems) {
  if (!students?.length || !problems?.length) return [];
  const rows = students.map((st) => {
    let total = 0;
    const cells = problems.map((p, pi) => {
      const pk = problemStandingsKey(tIndex, cIndex, pi, p.name);
      const solved = mockStudentSolved(st.id, pk);
      if (solved) total += 1;
      return { pk, solved };
    });
    return { student: st, total, cells };
  });
  rows.sort((a, b) => b.total - a.total);
  rows.forEach((row) => {
    row.rank = rows.filter((r) => r.total > row.total).length + 1;
  });
  return rows;
}

/** Per-problem "Tried" counts for footer row (mock). */
export function columnFooterTried(students, tIndex, cIndex, problems) {
  if (!students?.length || !problems?.length) return [];
  return problems.map((p, pi) => {
    const pk = problemStandingsKey(tIndex, cIndex, pi, p.name);
    return students.filter((st) => mockAttempted(st.id, pk)).length;
  });
}
