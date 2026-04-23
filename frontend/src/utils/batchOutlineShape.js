export function normalizeOutlineShape(topics) {
  if(!Array.isArray(topics)) return [];
  topics.forEach((topic) =>{
      if(!Array.isArray(topic.subtopics)) {topic.subtopics = [];}
      topic.subtopics.forEach=((sub)=>{
        if(!Array.isArray(sub.problems)) sub.problems = [];
      });
    });
    return topics;
}

export function recomputeTopic(topic) {
  if (!Array.isArray(topic.subtopics)) topic.subtopics = [];
  let tDone = 0;
  let tAll = 0;
  topic.subtopics.forEach((sub) => {
    let subDone = 0;
    sub.problems.forEach((p) => {
      if (p.solved) subDone++;
    });
    sub.completed = subDone;
    sub.total = sub.problems.length;
    tDone += subDone;
    tAll += sub.problems.length;
  });
  topic.completed = tDone;
  topic.total = tAll;
}




export function recomputeAll(topics) {
  topics.forEach(recomputeTopic);
}
