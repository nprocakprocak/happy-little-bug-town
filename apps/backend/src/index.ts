import cors from "cors";
import cookieParser from "cookie-parser";

import { AID_HEADER } from "./constants/aid.js";

import "dotenv/config";

import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";

import { loadAuthEnv } from "./config/authEnv.js";
import { loadServerEnv } from "./config/serverEnv.js";
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

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    allowedHeaders: ["Content-Type", AID_HEADER],
  }),
);
app.use(cookieParser(sessionSecret));
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/grid", gridRouter);
app.use("/api/structures", structuresRouter);
app.use("/api/stacks", stacksRouter);
app.use("/api/users", usersRouter);
app.use("/api/bugs", bugsRouter);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`Backend is running at ${railwayPublicDomain}:${port}`);
});
