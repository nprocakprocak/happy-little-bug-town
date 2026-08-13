import cookieParser from "cookie-parser";
import cors from "cors";

import "dotenv/config";

import express from "express";

import { loadAuthEnv } from "./config/authEnv.js";
import { loadServerEnv } from "./config/serverEnv.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRateLimit, authRateLimit } from "./middleware/rateLimits.js";
import { authRouter } from "./routes/auth.js";
import { bugsRouter } from "./routes/bugs.js";
import { gridRouter } from "./routes/grid.js";
import { itemsRouter } from "./routes/items.js";
import { stacksRouter } from "./routes/stacks.js";
import { structuresRouter } from "./routes/structures.js";
import { usersRouter } from "./routes/users.js";

const { railwayPublicDomain, corsOrigin, port } = loadServerEnv();
const { sessionSecret } = loadAuthEnv();

const app = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(cookieParser(sessionSecret));
app.use(express.json({ limit: "32kb" }));
app.use("/api", apiRateLimit);
app.use("/api/auth/google", authRateLimit);
app.use("/api/users/register", authRateLimit);
app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/grid", gridRouter);
app.use("/api/structures", structuresRouter);
app.use("/api/stacks", stacksRouter);
app.use("/api/users", usersRouter);
app.use("/api/bugs", bugsRouter);
app.use(errorHandler);

app.listen(port, (error?: Error) => {
  if (error) {
    throw error;
  }
  console.log(`Backend is running at ${railwayPublicDomain}:${port}`);
});
