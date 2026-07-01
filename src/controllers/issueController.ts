import type { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Repository from "../models/repo.model.js";
import Issue from "../models/issue.model.js";

interface CreateIssue {
  title: string;
  description: string;
  status: "open" | "closed";
  repository: mongoose.Types.ObjectId;
}
interface IssueParams {
  id: string;
}
export const createIssue = async (
  req: Request<{}, {}, CreateIssue>,
  res: Response,
) => {
  const { title, description, status, repository } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ error: "Issue name is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(repository)) {
      return res.status(400).json({ error: "Invalied repository" });
    }

    const newIssue = new Issue({
      title,
      description,
      status,
      repository,
    });

    await newIssue.save();
    res.status(201).json({
      message: "Repository Created",
      issueId: newIssue._id,
    });
  } catch (error) {
    console.error("Error During Creating  the Issue", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateIssueById = async (
  req: Request<IssueParams>,
  res: Response,
) => {
  const issueId = req.params.id;
  const { title, description, status } = req.body;
  const updateData: Record<string, any> = {};

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;

  try {
    const updatedIssue = await Issue.findByIdAndUpdate(issueId, updateData, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!updatedIssue) {
      res.status(404).json({
        message: "Issue Not Found",
      });
      return;
    }

    res.status(200).json({
      message: "Issue Updated Successfully",
      issue: updatedIssue,
    });
  } catch (error) {
    console.error("Error During Updating the Issue", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteIsuueById = async (
  req: Request<IssueParams>,
  res: Response,
) => {
  const issueId = req.params.id;
  try {
    const issue = await Issue.findByIdAndDelete(issueId);
    if (!issue) {
      return res.status(400).json({ error: "Issue not found" });
    }

    res.send("Issue Deleted Successfull");
  } catch (error) {
    console.error("Error During Deleting the Issue", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getAllIssue = async (req: Request, res: Response) => {
  try {
    const issues = await Issue.find({}).populate("repository");
    if (!issues) {
      return res.status(400).json({ error: "Issue not found" });
    }

    res.json(issues);
  } catch (error) {
    console.error("Error During Fetching  the Issue", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getIssueById = async (
  req: Request<IssueParams>,
  res: Response,
) => {
  const issueId = req.params.id;
  try {
    const issue = await Issue.findById(issueId).populate("repository");
    if (!issue) {
      return res.status(400).json({ error: "Issue not found" });
    }

    res.json(issue);
  } catch (error) {
    console.error("Error During Fetching   the Issue", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
