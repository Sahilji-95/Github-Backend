import type { Request, Response, NextFunction } from "express";
import Repo from "../models/repo.model.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const isRepoOwner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { repoId } = req.params;

    const repo = await Repo.findById(repoId);

    if (!repo) {
      res.status(404).json({
        message: "Repository not found",
      });
      return;
    }

    if (repo.owner.toString() !== req.user?.id) {
      res.status(403).json({
        message: "You are not the owner of this repository",
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};
