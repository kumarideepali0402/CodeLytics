import { Router } from "express";
import { checkUser, handleLogin, handleLogout, handleRefreshToken } from "../controllers/auth.controller.js";
import { authDynamic } from "../middlewares/auth.middleware.js";

const authRouter=Router();

authRouter.post("/login",handleLogin)
authRouter.post("/logout",authDynamic,handleLogout)
authRouter.get("/check",authDynamic,checkUser)
authRouter.post("/refresh",handleRefreshToken)

export default authRouter;