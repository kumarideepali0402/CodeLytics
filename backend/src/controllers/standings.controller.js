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


// Not currently used by the frontend — reserved for future insights (e.g. per-subtopic completion rates, at-risk students)
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


export const getWeeklyProgress = async (req, res) => {
    const { batchId } = req.params;
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;

    function toMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
        d.setHours(0, 0, 0, 0);
        return d;
    }

    try {
        const [{ studentBatches, studentIds, assignmentIds }, firstAssignment] = await Promise.all([
            fetchBatchContext(batchId),
            prisma.problemAssignment.findFirst({
                where: { batchId },
                orderBy: { assignedDate: "asc" },
                select: { assignedDate: true },
            }),
        ]);

        if (assignmentIds.length === 0 || !firstAssignment) {
            return res.status(200).json({ weeks: [], students: [] });
        }

        const firstMonday = toMonday(firstAssignment.assignedDate);
        const currentMonday = toMonday(new Date());

        const numWeeks = Math.floor((currentMonday - firstMonday) / msPerWeek) + 1;

        const weeks = [];
        for (let i = 0; i < numWeeks; i++) {
            const start = new Date(firstMonday);
            start.setDate(firstMonday.getDate() + i * 7);
            const end = new Date(start);
            end.setDate(start.getDate() + 7);
            weeks.push({ weekStart: start, weekEnd: end });
        }

        const since = weeks[0].weekStart;
        const until = weeks[numWeeks - 1].weekEnd;

        const solvedStatuses = await prisma.problemStatus.findMany({
            where: {
                studentId: { in: studentIds },
                problemAssignmentId: { in: assignmentIds },
                status: "SOLVED",
                syncedAt: { gte: since, lt: until },
            },
            select: { studentId: true, syncedAt: true },
        });

        const countMap = {};
        for (const { studentId, syncedAt } of solvedStatuses) {
            const weekIdx = Math.floor((syncedAt.getTime() - since.getTime()) / msPerWeek);
            if (weekIdx < 0 || weekIdx >= numWeeks) continue;
            if (!countMap[studentId]) countMap[studentId] = new Array(numWeeks).fill(0);
            countMap[studentId][weekIdx]++;
        }

        const students = studentBatches
            .map((sb) => {
                const weeklySolved = countMap[sb.studentId] ?? new Array(numWeeks).fill(0);
                return {
                    studentId: sb.student.id,
                    name: sb.student.name,
                    enrollmentId: sb.student.studentEnrollmentId,
                    total: weeklySolved.reduce((s, v) => s + v, 0),
                    weeklySolved,
                };
            })
            .sort((a, b) => b.total - a.total);

        return res.status(200).json({
            weeks: weeks.map((w, i) => ({
                label: `Week ${i + 1}`,
                weekStart: w.weekStart.toISOString(),
                weekEnd: w.weekEnd.toISOString(),
            })),
            students,
        });
    } catch (error) {
        console.error("[getWeeklyProgress]", error);
        return res.status(500).json({ msg: "Error fetching weekly progress" });
    }
};


// Not currently used — intended for the "Who solved this?" problem modal to show solvers in chronological order (syncedAt)
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
