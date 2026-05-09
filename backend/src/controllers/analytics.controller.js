import prisma from "../db/prisma.js";


export const getStandings = async(req, res) => {
    const id = req.user?.id;
    const batchId = req.params.batchId;

    if(!batchId) {
        return res.status(401).json({ msg:  "Unauthorized"});
    }

    try {
        const students = await prisma.studentBatch.findMany({
            where: {batchId},
            include: {
                student: {
                    select:{
                    id: true,
                    studentEnrollmentId: true,
                    name: true,
                    collegeId: true
    
                    
                }
                }
                
            }
        });
    
        const assignments = await prisma.problemAssignment.findMany({
            where:{ batchId },
            include: {
                topic: {
                    select:{
                        id: true,
                        name: true,
                    }
                },
    
                subtopic: {
                    select: {
                        id: true,
                        name: true,
                        topicId: true
                    }
                },
                
                problem : {
                    select: {
                        id: true,
                        title: true,
                        link :true,
                        difficulty: true,
                        platformId: true
    
                    }
                }
            }
        });
    
        const assignmentIds = assignments.map((a) => a.id);
    
        const statuses = await prisma.problemStatus.findMany({
            where: { problemAssignmentId: {in: assignmentIds}},
            select: { problemAssignmentId: true, status: true, studentId: true }
        })
    
        const statusMap = {};
        statuses.map((s) => {
            statusMap[`${s.problemAssignmentId}_${s.studentId}`] = s.status  // ✅
    
        })
        return res.status(200).json({
            students: students.map(sb => sb.student),
            problems: assignments.map(a => ({
                assignmentId: a.id,
                title: a.problem.title,
                link: a.problem.link,
                difficulty: a.problem.difficulty,
                topic: a.topic.name,
                subtopic: a.subtopic.name,
    
            })),
            statuses: statusMap
        });
    
    } catch (error) {
        console.error("[getStandings]", error)
        return res.status(500).json({ msg: "Error fetching standings" })

        
    }

} 