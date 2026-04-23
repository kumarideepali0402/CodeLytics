import { Router } from "express";
import { authDynamic, authTeacher, authTeacherOrCollege } from "../middlewares/auth.middleware.js";
import { createTopic, getAllTopics, createSubtopic, getAllSubtopics, createProblem, getAllProblems, assignHomework, getAssignedProblems, getBatchOutline }  from "../controllers/assignment.controller.js"
 

const assignmentRouter=Router();

assignmentRouter.post('/create-topic', authDynamic, authTeacher, createTopic);
assignmentRouter.get('/get-all-topics',authDynamic,authTeacher, getAllTopics)

assignmentRouter.post('/create-subtopic', authDynamic, authTeacher, createSubtopic );
assignmentRouter.get('/get-all-subtopics/:topic_id', authDynamic, authTeacher, getAllSubtopics);

assignmentRouter.post('/create-problem',authDynamic,authTeacher,createProblem)
assignmentRouter.get('/get-all-problems',authDynamic,authTeacher,getAllProblems)

assignmentRouter.post('/assign-homework', authDynamic, authTeacher, assignHomework);
assignmentRouter.get('/get-assigned-problems/:batch_id/:subtopic_id', authDynamic, authTeacher, getAssignedProblems);
assignmentRouter.get('/batch-outline/:batch_id' ,authDynamic, authTeacherOrCollege, getBatchOutline)




export default assignmentRouter;
 