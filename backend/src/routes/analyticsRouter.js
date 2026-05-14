import express from 'express';
import { getStandings, getBatchStudents, getStudentProfile } from '../controllers/analytics.controller.js';
import {
    getBatchLeaderboard,
    getWeeklyLeaderboard,
    getSubtopicLeaderboard,
    getQuestionSolvers,
} from '../controllers/standings.controller.js';
import { authDynamic, authTeacherOrCollege } from '../middlewares/auth.middleware.js';

const analyticsRouter = express.Router();

analyticsRouter.get('/batch/:batchId/standings', authDynamic, authTeacherOrCollege, getStandings);
analyticsRouter.get('/batch/:batchId/students',  authDynamic, authTeacherOrCollege, getBatchStudents);
analyticsRouter.get('/student/:studentId/profile', authDynamic, authTeacherOrCollege, getStudentProfile);

// Standings / leaderboard
analyticsRouter.get('/batch/:batchId/leaderboard', authDynamic, authTeacherOrCollege, getBatchLeaderboard);
analyticsRouter.get('/batch/:batchId/leaderboard/weekly', authDynamic, authTeacherOrCollege, getWeeklyLeaderboard);
analyticsRouter.get('/batch/:batchId/leaderboard/subtopic/:subtopicId', authDynamic, authTeacherOrCollege, getSubtopicLeaderboard);
analyticsRouter.get('/batch/:batchId/assignment/:assignmentId/solvers', authDynamic, authTeacherOrCollege, getQuestionSolvers);

export default analyticsRouter;