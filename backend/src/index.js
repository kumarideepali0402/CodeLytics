import express from 'express'
import 'dotenv/config';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import prisma from './db/prisma.js';
import authRouter from './routes/auth.routes.js';
import collegeRouter from './routes/college.routes.js';
import teacherRouter from './routes/teachers.routes.js';
import studentRouter from './routes/students.routes.js';
import batchRouter from './routes/batch.routes.js';
import platformRouter from './routes/platform.routes.js';
import assignmentRouter from './routes/assignment.routes.js';
import analyticsRouter from './routes/analyticsRouter.js'

const app = express();
const PORT = process.env.PORT;

app.use(cors({
  origin: process.env.ORIGIN,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/college', collegeRouter);
app.use('/api/batch', batchRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/student', studentRouter);
app.use('/api/platform', platformRouter);
app.use('/api/assignment', assignmentRouter);
app.use('/api/analytics', analyticsRouter)

prisma.$connect()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  });