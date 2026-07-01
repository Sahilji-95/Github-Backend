import express from "express";
import {
  getAllRepo,
  createRepo,
  getRepoByID,
  getRepoByName,
  getRepoForOwner,
  toggleVisibiltyById,
  updateRepoById,
  deleteRepoById,
  toggleStarRepo,
  getStarredRepos,
} from "../controllers/repoController.js";

import { isAuthenticated } from "../middlewares/isAuthenticate.js";
import { isRepoOwner } from "../middlewares/isRepoOwner.js";
const repoRouter = express.Router();

repoRouter.get("/repo/all", isAuthenticated, getAllRepo);
repoRouter.post("/repo/create", isAuthenticated, createRepo);
repoRouter.post("/repo/:repoId/star", isAuthenticated, toggleStarRepo);
repoRouter.get("/repo/id/:id", isAuthenticated, getRepoByID);
repoRouter.get("/repo/name/:name", getRepoByName);
repoRouter.get("/repo/user/:userId", isAuthenticated, getRepoForOwner);
repoRouter.get("/repo/starred", isAuthenticated, getStarredRepos);
repoRouter.patch(
  "/repo/toggle/:id",
  isAuthenticated,
  isRepoOwner,
  toggleVisibiltyById,
);
repoRouter.put(
  "/repo/update/:id",
  isAuthenticated,
  isRepoOwner,
  updateRepoById,
);
repoRouter.delete(
  "/repo/delete/:id",
  isAuthenticated,
  isRepoOwner,
  deleteRepoById,
);

export default repoRouter;
