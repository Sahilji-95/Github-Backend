import type { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Repository from "../models/repo.model.js";
import Issue from "../models/issue.model.js";

interface RepoParams {
  id: string;
}
interface RepoParamsName {
  name: string;
}

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const createRepo = async (req: AuthRequest, res: Response) => {
  const { name, description, content, visibility, owner, issues } = req.body;

  const userId = req.user?.userId;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required" });
    }

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const newRepo = new Repository({
      name,
      description,
      content,
      visibility,
      owner: userId,
      issues,
    });

    const result = await newRepo.save();

    res.status(201).json({
      message: "Repository Created",
      repositoryId: result._id,
    });
  } catch (error) {
    console.error("Error During Create the repository", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getAllRepo = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const repos = await Repository.find({})
      .populate("owner")
      .populate("issues");

    const reposWithStarStatus = repos.map((repo) => ({
      ...repo.toObject(),
      isStarred: repo.stars.some((id) => id.toString() === userId),
      starsCount: repo.stars.length,
    }));

    res.json(reposWithStarStatus);
  } catch (error) {
    console.error("Error During Fetching the All repository", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getRepoByID = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const repoId = req.params.id;

  try {
    const repo = await Repository.findById(repoId)
      .populate("owner", "username email")
      .populate("issues");

    if (!repo) {
      res.status(404).json({
        message: "Repository Not Found",
      });
      return;
    }

    const userId = req.user?.userId;

    const isStarred = repo.stars.some((id) => id.toString() === userId);

    res.json({
      ...repo.toObject(),
      isStarred,
      starsCount: repo.stars.length,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getRepoByName = async (
  req: Request<RepoParamsName>,
  res: Response,
): Promise<void> => {
  const repoName = req.params.name;

  try {
    const result = await Repository.findOne({ name: repoName })
      .populate("owner")
      .populate("issues");
    if (!result) {
      res.status(404).json({
        message: "Repository Not Found",
      });
    }
    res.json(result);
  } catch (error) {
    console.error("Error During Fetching the repository", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getRepoForOwner = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.user?.userId;

    if (!id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const repos = await Repository.find({ owner: id })
      .populate("owner")
      .populate("issues");

    if (repos.length === 0) {
      res.status(404).json({ message: "No repositories found" });
      return;
    }

    res.status(200).json(repos);
  } catch (error) {
    console.error("Error fetching repositories for logged in user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const toggleStarRepo = async (req: AuthRequest, res: Response) => {
//   const { repoId } = req.params;

//   const repo = await Repository.findById(repoId);

//   if (!repo) {
//     return res.status(404).json({
//       message: "Repository not found",
//     });
//   }

//   const user = await User.findById(req.user?.userId);

//   if (!user) {
//     return res.status(404).json({
//       message: "user not found",
//     });
//   }

//   const alreadyStarred = user.starRepos.some((id) => id.toString() === repoId);

//   if (alreadyStarred) {
//     user.starRepos = user.starRepos.filter((id) => id.toString() !== repoId);
//   } else {
//     user.starRepos.push(repo._id);
//   }

//   await user.save();

//   return res.status(200).json({
//     success: true,
//     starred: !alreadyStarred,
//   });
// };

export const toggleStarRepo = async (req: AuthRequest, res: Response) => {
  try {
    const { repoId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const repo = await Repository.findById(repoId);

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found",
      });
    }

    const alreadyStarred = repo.stars.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyStarred) {
      repo.stars = repo.stars.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      repo.stars.push(userId as any);
    }

    await repo.save();

    return res.status(200).json({
      success: true,
      starred: !alreadyStarred,
      starsCount: repo.stars.length,
    });
  } catch (error) {
    console.error("Toggle star error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const toggleVisibiltyById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  res.send("Visibilty Toggled");
};

export const updateRepoById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
  } catch (error) {
    console.error("Error During Fetching the user repository", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteRepoById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  res.send("Your Repo deleted");
};

export const getStarredRepos = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const starredRepos = await Repository.find({
      stars: userId,
    })
      .populate("owner", "username email")
      .populate("issues");

    const reposWithStatus = starredRepos.map((repo) => ({
      ...repo.toObject(),
      isStarred: true,
      starsCount: repo.stars.length,
    }));

    res.status(200).json(reposWithStatus);
  } catch (error) {
    console.error("Error fetching starred repos:", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
