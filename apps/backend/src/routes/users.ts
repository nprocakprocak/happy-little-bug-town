import { Router, type RequestHandler } from "express";

import { requireAid } from "../middleware/requireAid.js";
import {
  ensureUser
} from "../services/usersService.js";

export const usersRouter = Router();

usersRouter.use(requireAid);

const registerUser: RequestHandler = async (req, res) => {
  const anonymousId = req.authorId!;
  const user = await ensureUser(anonymousId);
  res.status(200).json(user);
};

usersRouter.post("/register", registerUser);
