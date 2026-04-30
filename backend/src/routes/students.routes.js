import Router from "express";
import { authCollege, authDynamic, authStudent } from "../middlewares/auth.middleware.js";
import { createStudent, getBatchStudent, getMyBatchOutline, getMyProfile } from "../controllers/students.controller.js";
import { getHandles,upsertHandle, deleteHandle, generateSyncToken, syncCF,extSync } from "../controllers/platformHandle.controller.js";

const studentRouter = Router();

studentRouter.post("/create", authDynamic, authCollege, createStudent);
studentRouter.get("/get/:id", authDynamic, authCollege, getBatchStudent);
studentRouter.get("/my-batch-outline", authDynamic, authStudent, getMyBatchOutline);
studentRouter.get("/me", authDynamic, authStudent, getMyProfile);
studentRouter.get("/platform-handles", authDynamic, authStudent, getHandles);
studentRouter.post("/platform-handles", authDynamic, authStudent, upsertHandle);
studentRouter.delete("/platform-handles/:platformId", authDynamic, authStudent, deleteHandle);
studentRouter.post("/generate-sync-token", authDynamic, authStudent, generateSyncToken);
studentRouter.post("/sync/codeforces", authDynamic, authStudent, syncCF);
studentRouter.post("/ext-sync",  extSync);


export default studentRouter;