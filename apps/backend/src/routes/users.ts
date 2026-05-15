import { Router, type RequestHandler } from "express";
import { getUser as getUserService, updateUser as updateUserService } from "../services/UsersService.js";

export const usersRouter = Router();

const getUser: RequestHandler = async (req, res) => {
  const user = await getUserService(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.status(200).json(user);
};

const updateUser: RequestHandler = async (req, res) => {
  const user = await updateUserService({ ...req.body, id: req.params.id });
  if (!user) {
    return res.status(500).json({ error: "Failed to update user" });
  }
  res.cookie("aid", user.id, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  res.status(200).json(user);
};

usersRouter.get("/:id", getUser);
usersRouter.put("/:id", updateUser);
