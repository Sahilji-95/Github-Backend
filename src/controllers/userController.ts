import "dotenv/config";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

interface RegisterUser {
  username: string;
  email: string;
  password: string;
}

interface LoginUser {
  email: string;
  password: string;
}

interface UserParams {
  id: string;
}

interface UpdateUser {
  email: string;
  password: string;
  id: string;
}

const uri = process.env.MONGODB_URI!;

let client: MongoClient | null = null;

async function connectClient(): Promise<MongoClient> {
  if (!client) {
    client = new MongoClient(uri);
  }
  await client.connect();
  return client;
}

export const singup = async (
  req: Request<{}, {}, RegisterUser>,
  res: Response,
): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    const client = await connectClient();
    const db = client.db("github");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        message: "User already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await usersCollection.insertOne({
      username,
      email,
      password: hashedPassword,
      repositories: [],
      followedUsers: [],
      starRepos: [],
      createdAt: new Date(),
    });

    const token = jwt.sign(
      {
        userId: result.insertedId,
        email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );

    res.status(201).json({
      message: "User created successfully",
      token,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const login = async (
  req: Request<{}, {}, LoginUser>,
  res: Response,
): Promise<void> => {
  const { email, password } = req.body;
  try {
    const client = await connectClient();
    const db = client.db("github");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email });

    if (!existingUser) {
      res.status(400).json({
        message: "Invalid credential",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      res.status(400).json({
        message: "Invalid credential",
      });
      return;
    }

    const token = jwt.sign(
      {
        userId: existingUser._id.toString(),
        email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );

    res.status(201).json({
      message: "User Logged in  successfully",
      token,
      userId: existingUser._id,
    });
  } catch (error) {
    console.error("Error During login ", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const client = await connectClient();
    const db = client.db("github");
    const usersCollection = db.collection("users");

    const users = await usersCollection.find({}).toArray();
    res.json(users);
  } catch (error) {
    console.error(" Error During Data Fetching", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getUserProfile = async (
  req: Request<UserParams>,
  res: Response,
): Promise<void> => {
  const currId = req.params.id;

  try {
    const client = await connectClient();
    const db = client.db("github");

    const usersCollection = db.collection("users");
    const reposCollection = db.collection("repositories");

    if (!ObjectId.isValid(currId)) {
      res.status(400).json({
        message: "Invalid User ID",
      });
      return;
    }

    console.log("currId:", currId);

    const user = await usersCollection.findOne(
      {
        _id: new ObjectId(currId),
      },
      {
        projection: {
          password: 0,
        },
      },
    );

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const repos = await reposCollection
      .find({
        owner: new ObjectId(currId),
      })
      .toArray();

    res.status(200).json({
      user,
      repos,
      stats: {
        repoCount: repos.length,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        starredCount: user.starRepos?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error During Data Fetching", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateUserProfile = async (
  req: Request<UpdateUser>,
  res: Response,
): Promise<void> => {
  const currId = req.params.id;
  const { password, email } = req.body;
  try {
    const client = await connectClient();
    const db = client.db("github");
    const usersCollection = db.collection("users");

    const updatedFields: Record<string, string> = { email };
    if (password) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(currId) },
      { $set: updatedFields },
      { returnDocument: "after" },
    );

    if (!result) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.send("updating user Profile");
  } catch (error) {
    console.error(" Error During Updating User Profile", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteUserProfile = async (
  req: Request<UserParams>,
  res: Response,
): Promise<void> => {
  const currId = req.params.id;
  try {
    const client = await connectClient();
    const db = client.db("github");
    const usersCollection = db.collection("users");

    const result = await usersCollection.findOneAndDelete({
      _id: new ObjectId(currId),
    });
    if (!result) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.send("User Deleted Successfully");
  } catch (error) {
    console.error(" Error During Deleting User Profile", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.userId;
  try {
    const client = await connectClient();
    const db = client.db("github");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    res.json(user);
  } catch (error) {
    console.error(" Error During Data Fetching", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
