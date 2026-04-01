import { displayPlatform } from "./problemDisplay.js";

/**
 * In-memory topic tree helpers (topics → classes/subtopics → problems).
 * Wire load/save to your API at the page level; these do not persist.
 */

/** Ensure nested arrays exist so UI never crashes on partial API payloads. */
export function normalizeOutlineShape(topics) {
  if (!Array.isArray(topics)) return [];
  topics.forEach((topic) => {
    if (!Array.isArray(topic.classes)) topic.classes = [];
    topic.classes.forEach((cls) => {
      if (!Array.isArray(cls.problems)) cls.problems = [];
      cls.problems.forEach((p) => {
        p.platform = displayPlatform(p);
      });
    });
  });
  return topics;
}

export function recomputeTopic(topic) {
  if (!Array.isArray(topic.classes)) topic.classes = [];
  let tDone = 0;
  let tAll = 0;
  topic.classes.forEach((c) => {
    let cDone = 0;
    c.problems.forEach((p) => {
      if (p.solved) cDone++;
    });
    c.completed = cDone;
    c.total = c.problems.length;
    tDone += cDone;
    tAll += c.problems.length;
  });
  topic.completed = tDone;
  topic.total = tAll;
}

export function recomputeAll(topics) {
  topics.forEach(recomputeTopic);
}
