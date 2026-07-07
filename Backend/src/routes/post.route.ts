import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import * as postController from "../controllers/post.controller.js";
import { upload } from "../config/multer.js";

const postRouter = Router();

postRouter.get("/", protect, postController.getPosts);

postRouter.get("/generations", protect, postController.getGenerations);

postRouter.post("/", protect, postController.schedulePost);

postRouter.post(
  "/generate",
  protect,
  upload.single("media"),
  postController.generatePost,
);

export default postRouter;
