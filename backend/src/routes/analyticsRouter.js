import express from 'express';
import { getStandings, getBatchStudents, getStudentProfile } from '../controllers/analytics.controller.js';
import { authDynamic, authTeacherOrCollege } from '../middlewares/auth.middleware.js';

const analyticsRouter = express.Router();

analyticsRouter.get('/batch/:batchId/standings', authDynamic, authTeacherOrCollege, getStandings);
analyticsRouter.get('/batch/:batchId/students',  authDynamic, authTeacherOrCollege, getBatchStudents);
analyticsRouter.get('/student/:studentId/profile', authDynamic, authTeacherOrCollege, getStudentProfile);

export default analyticsRouter;