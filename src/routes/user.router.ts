import express from "express";
import {
  getAllUsers,
  singup,
  login,
  deleteUserProfile,
  updateUserProfile,
  getUserProfile,
  getUser,
} from "../controllers/userController.js";

import { isAuthenticated } from "../middlewares/isAuthenticate.js";
const userRouter = express.Router();

userRouter.get("/allUsers", getAllUsers);
userRouter.get("/me", isAuthenticated, getUser);
userRouter.post("/signup", singup);
userRouter.post("/login", login);
userRouter.get("/userProfile/:id", getUserProfile);
userRouter.put("/updateProfile/:id", updateUserProfile);
userRouter.delete("/deleteProfile/:id", deleteUserProfile);

export default userRouter;
