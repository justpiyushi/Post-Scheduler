import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = Router();

// Register User
authRouter.post("/register", authController.registerUser);

// Login User
authRouter.post("/register", authController.loginUser);

export default authRouter;
