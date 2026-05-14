import prisma from "../db/prisma.js";


function getWeekBounds(weekStartParam) {
    let start;
    if (weekStartParam) {
        start = new Date(weekStartParam);
    } else {
        start = new Date();
        const day = start.getDay(); // 0=Sun … 6=Sat
        const diff = day === 0 ? -6 : 1 - day; // back to Monday
        start.setDate(start.getDate() + diff);
    }
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
}


function assignRanks(sorted) {
    let rank = 1;
    return sorted.map((item, i, arr) => {
        if (i > 0 && arr[i].solved < arr[i - 1].solved) rank = i + 1;
        return { ...item, rank };
    });
}


async function fetchBatchContext(batchId, assignmentFilter = {}) {
    const [studentBatches, assignments] = await Promise.all([
        prisma.studentBatch.findMany({
            where: { batchId },
            include: {
                student: {
                    select: {
                        id: true,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
                        name: true,
                        studentEnrollmentId: true,
                        studentStreak: true,
                    },
                },
            },
        }),
        prisma.problemAssignment.findMany({
            where: { batchId, ...assignmentFilter },
            select: { id: true },
        }),
    ]);
    return {
        studentBatches,
        studentIds: studentBatches.map((sb) => sb.studentId),
        assignmentIds: assignments.map((a) => a.id),
        totalAssigned: assignments.length,
    };
}


export const getBatchLeaderboard = async (req, res) => {
    const { batchId } = req.params;

    try {
        const { studentBatches, studentIds, assignmentIds, totalAssigned } =
            await fetchBatchContext(batchId);

        const solvedCounts = await prisma.problemStatus.groupBy({
            by: ["studentId"],
            where: {
                studentId: { in: studentIds },
                problemAssignmentId: { in: assignmentIds },
                status: "SOLVED",
            },
            _count: { id: true },
        });

        const solvedMap = {};
        solvedCounts.forEach((sc) => { solvedMap[sc.studentId] = sc._count.id; });

        const sorted = studentBatches
            .map((sb) => ({
                studentId: sb.student.id,
                name: sb.student.name,
                enrollmentId: sb.student.studentEnrollmentId,
                streak: sb.student.studentStreak,
                solved: solvedMap[sb.studentId] ?? 0,
                total: totalAssigned,
            }))
            .sort((a, b) => b.solved - a.solved);

        return res.status(200).json({ leaderboard: assignRanks(sorted) });
    } catch (error) {
        console.error("[getBatchLeaderboard]", error);
        return res.status(500).json({ msg: "Error fetching leaderboard" });
    }
};


export const getWeeklyLeaderboard = async (req, res) => {
    const { batchId } = req.params;
    const { weekStart } = req.query;
    const { start, end } = getWeekBounds(weekStart);

    try {
        const { studentBatches, studentIds, assignmentIds } =
            await fetchBatchContext(batchId);

        const solvedCounts = await prisma.problemStatus.groupBy({
            by: ["studentId"],
            where: {
                studentId: { in: studentIds },
                problemAssignmentId: { in: assignmentIds },
                status: "SOLVED",
                syncedAt: { gte: start, lt: end },
            },
            _count: { id: true },
        });

        const solvedMap = {};
        solvedCounts.forEach((sc) => { solvedMap[sc.studentId] = sc._count.id; });

        const sorted = studentBatches
            .map((sb) => ({
                studentId: sb.student.id,
                name: sb.student.name,
                enrollmentId: sb.student.studentEnrollmentId,
                solved: solvedMap[sb.studentId] ?? 0,
            }))
            .sort((a, b) => b.solved - a.solved);

        return res.status(200).json({
            weekStart: start.toISOString(),
            weekEnd: end.toISOString(),
            leaderboard: assignRanks(sorted),
        });
    } catch (error) {
        console.error("[getWeeklyLeaderboard]", error);
        return res.status(500).json({ msg: "Error fetching weekly leaderboard" });
    }
};


export const getSubtopicLeaderboard = async (req, res) => {
    const { batchId, subtopicId } = req.params;

    try {
        const { studentBatches, studentIds, assignmentIds, totalAssigned } =
            await fetchBatchContext(batchId, { subtopicId });

        if (totalAssigned === 0) {
            return res.status(200).json({
                subtopicProblems: 0,
                leaderboard: studentBatches.map((sb) => ({
                    studentId: sb.student.id,
                    name: sb.student.name,
                    enrollmentId: sb.student.studentEnrollmentId,
                    solved: 0,
                    total: 0,
                    rank: 1,
                })),
            });
        }

        const solvedCounts = await prisma.problemStatus.groupBy({
            by: ["studentId"],
            where: {
                studentId: { in: studentIds },
                problemAssignmentId: { in: assignmentIds },
                status: "SOLVED",
            },
            _count: { id: true },
        });

        const solvedMap = {};
        solvedCounts.forEach((sc) => { solvedMap[sc.studentId] = sc._count.id; });

        const sorted = studentBatches
            .map((sb) => ({
                studentId: sb.student.id,
                name: sb.student.name,
                enrollmentId: sb.student.studentEnrollmentId,
                solved: solvedMap[sb.studentId] ?? 0,
                total: totalAssigned,
            }))
            .sort((a, b) => b.solved - a.solved);

        return res.status(200).json({
            subtopicProblems: totalAssigned,
            leaderboard: assignRanks(sorted),
        });
    } catch (error) {
        console.error("[getSubtopicLeaderboard]", error);
        return res.status(500).json({ msg: "Error fetching subtopic leaderboard" });
    }
};


export const getQuestionSolvers = async(req, res) => {
    const {batchId, assignmentId} = req.params;
    try {
        const [students, solved] = await Promise.all([
             prisma.studentBatch.findMany({
                where: {batchId},
                include: {
                    student: {
                        select: {
                            id: true,
                            studentEnrollmentId: true,
                            name: true
                        }
                    }
                }
                
            }),
             prisma.problemStatus.findMany({
            where:{
                problemAssignmentId:assignmentId, 
                
                status:"SOLVED"
            },
            select:{
                id: true,
                 studentId: true,
                syncedAt: true,
                student:{
                    select:{
                        studentEnrollmentId: true,
                        name: true,
                    }
                }
                
            },
            orderBy: {syncedAt: 'asc'}
        })



        ]) ;

        const studentIds = new Set(students.map(s=> s.student.id));
        const result = solved.filter(s => studentIds.has(s.studentId))

        
        
        res.status(200).json({
            solvedStudent : result
        })


        
    } catch (error) {
        console.error("[getQuestionSolvers]", error);
        return res.status(500).json({ message: "Error fetching question solvers" });
        
    }




}
