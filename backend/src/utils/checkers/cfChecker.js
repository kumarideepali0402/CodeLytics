import { extractPlatformId } from "../extractPlatformId.js";

export async function cfCheck(handle, assignments) {
    const url = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=1000`;
    const res = await fetch(url);
    const data = await res.json();

    if(data.status !== "OK") {
        throw new Error(data.comment ?? "CF API error");
    }

    const solved = new Set();
    for (const sub of data.result) {
        if (sub.verdict === 'OK') {
            solved.add(`${sub.problem.contestId}/${sub.problem.index}`);
        }
    }

    return assignments.map((a)=>{
        const pid = extractPlatformId(a.problem.link, "codeforces");
        return {
            assignmentId: a.id,
            problemTitle: a.problem.title,
            solved: pid ? solved.has(pid) : false,
        };
    });
}