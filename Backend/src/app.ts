import express, { urlencoded, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import socialAuthRouter from "./routes/socialAuth.route.js";
import accountRouter from "./routes/account.route.js";
import postRouter from "./routes/post.route.js";

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(morgan("dev"));
app.use(cors());
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is running !!");
});

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/oauth", socialAuthRouter);

app.use("/api/v1/accounts", accountRouter);

app.use("/api/v1/posts", postRouter);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).send(err?.response?.data?.message || err?.message);
});

export default app;
