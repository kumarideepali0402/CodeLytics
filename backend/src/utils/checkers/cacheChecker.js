import { extractPlatformId } from "../extractPlatformId.js"

export default function cacheCheck(solvedSet, assignments, platformName) {
    
    return assignments.map((a) => {
        const slug = extractPlatformId(a.problem.link, platformName);
        return {
            assignmentId: a.id,
            problemTitle: a.problem.title,
            solved: solvedSet.has(slug) ? true: false
        
        }
        
        

    })


    
}