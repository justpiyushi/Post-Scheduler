import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import * as accountController from "../controllers/accounts.controller.js";

const accountRouter = Router();

accountRouter.get("/", protect, accountController.getAccounts);
accountRouter.post("/", protect, accountController.addAccount);
accountRouter.delete("/:id", protect, accountController.disconnectAccount);

export default accountRouter;
