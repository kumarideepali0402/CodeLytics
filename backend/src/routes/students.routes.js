import Router from "express";
import { authCollege, authDynamic, authStudent } from "../middlewares/auth.middleware.js";
import { createStudent, getBatchStudent, getMyBatchOutline } from "../controllers/students.controller.js";

const studentRouter = Router();

studentRouter.post("/create", authDynamic, authCollege, createStudent);
studentRouter.get("/get/:id", authDynamic, authCollege, getBatchStudent);
studentRouter.get("/my-batch-outline", authDynamic, authStudent, getMyBatchOutline);

export default studentRouter;