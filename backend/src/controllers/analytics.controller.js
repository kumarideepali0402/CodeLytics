import prisma from "../db/prisma.js";


export const getStandings = async(req, res) => {
    const id = req.user?.id;
    const batchId = req.params.batchId;

    if(!batchId) {
        return res.status(401).json({ msg:  "Unauthorized"});
    }

    try {
        const [students, assignments] = await Promise.all([
            prisma.studentBatch.findMany({
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
            }),
            prisma.problemAssignment.findMany({
                where:{ batchId },
                include: {
                    topic: { select:{ id: true, name: true } },
                    subtopic: { select: { id: true, name: true, topicId: true } },
                    problem : { select: { id: true, title: true, link :true, difficulty: true, platformId: true } }
                }
            })
        ]);

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
        return res.status(500).json({ msg: "Error fetching standings" });
    }
};

export const getBatchStudents = async (req, res) => {
    const batchId = req.params.batchId;
    if (!batchId) return res.status(400).json({ msg: "batchId required" });

    try {
        const [studentBatches, assignments] = await Promise.all([
            prisma.studentBatch.findMany({
                where: { batchId },
                include: {
                    student: {
                        select: {
                            id: true, name: true, email: true,
                            studentEnrollmentId: true, studentStreak: true,
                        }
                    }
                },
                orderBy: { student: { name: "asc" } }
            }),
            prisma.problemAssignment.findMany({
                where: { batchId }, select: { id: true }
            })
        ]);

        const studentIds = studentBatches.map(sb => sb.studentId);
        const assignmentIds = assignments.map(a => a.id);

        const solvedCounts = await prisma.problemStatus.groupBy({
            by: ["studentId"],
            where: { studentId: { in: studentIds }, problemAssignmentId: { in: assignmentIds }, status: "SOLVED" },
            _count: { id: true }
        });

        const solvedMap = {};
        solvedCounts.forEach(sc => { solvedMap[sc.studentId] = sc._count.id; });

        const students = studentBatches.map(sb => ({
            ...sb.student,
            solvedCount: solvedMap[sb.studentId] ?? 0,
            totalAssigned: assignmentIds.length
        }));

        return res.status(200).json({ students });
    } catch (error) {
        console.error("[getBatchStudents]", error);
        return res.status(500).json({ msg: "Error fetching students" });
    }
};

export const getStudentProfile = async (req, res) => {
    const { studentId } = req.params;
    if (!studentId) return res.status(400).json({ msg: "studentId required" });

    try {
        const [student, solvedCount] = await Promise.all([
            prisma.user.findUnique({
                where: { id: studentId },
                select: {
                    id: true, name: true, email: true,
                    studentEnrollmentId: true, studentStreak: true,
                    platformAccounts: {
                        select: {
                            id: true, handle: true, lastSyncedAt: true,
                            platform: { select: { id: true, name: true } }
                        }
                    }
                }
            }),
            prisma.problemStatus.count({
                where: { studentId, status: "SOLVED" }
            })
        ]);

        if (!student) return res.status(404).json({ msg: "Student not found" });

        return res.status(200).json({ student: { ...student, solvedCount } });
    } catch (error) {
        console.error("[getStudentProfile]", error);
        return res.status(500).json({ msg: "Error fetching student profile" });
    }
};