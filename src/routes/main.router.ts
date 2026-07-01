import express from "express";
import type { Request, Response } from "express";
import userRouter from "./user.router.js";
import repoRouter from "./repo.router.js";
import issueRouter from "./issue.router.js";

const mainRouter = express.Router();

mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);

export default mainRouter.get("/", (req: Request, res: Response) => {
  res.send("Home Route");
});
