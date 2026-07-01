import express from "express";
import {
  createIssue,
  updateIssueById,
  deleteIsuueById,
  getAllIssue,
  getIssueById,
} from "../controllers/issueController.js";
const issueRouter = express.Router();

issueRouter.post("/issue/create", createIssue);
issueRouter.get("/issue/id/:id", getIssueById);
issueRouter.get("/issue/all", getAllIssue);
issueRouter.put("/issue/update/:id", updateIssueById);
issueRouter.delete("/issue/delete/:id", deleteIsuueById);

export default issueRouter;
