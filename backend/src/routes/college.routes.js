import { Router } from "express";
import { createCollege, registerCollege, getColleges } from "../controllers/college.controller.js";

const collegeRouter = Router();

collegeRouter.get("/", getColleges);
collegeRouter.post("/register", registerCollege);
collegeRouter.post("/create", createCollege);

export default collegeRouter;