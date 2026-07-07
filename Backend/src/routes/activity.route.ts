import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import * as activityController from "../controllers/activity.controller.js";

const activityRouter = Router();

activityRouter.get("/", protect, activityController.getActivity);

export default activityRouter;
