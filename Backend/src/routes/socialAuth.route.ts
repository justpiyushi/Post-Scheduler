import { Router } from "express";
import * as socialAuthController from "../controllers/socialAuth.controller.js";
import * as authMiddleware from "../middlewares/auth.middleware.js";

const socialAuthRouter = Router();

socialAuthRouter.get(
  "/:platform/url",
  authMiddleware.protect,
  socialAuthController.generateURL,
);

socialAuthRouter.get(
  "/sync",
  authMiddleware.protect,
  socialAuthController.syncAccounts,
);

export default socialAuthRouter;
