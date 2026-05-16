import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { loadServerEnv } from "./config/serverEnv.js";
import { gridRouter } from "./routes/grid.js";
import { itemsRouter } from "./routes/items.js";
import { usersRouter } from "./routes/users.js";
import { minesRouter } from "./routes/mines.js";
import { stacksRouter } from "./routes/stacks.js";

const { railwayPublicDomain, corsOrigin, port } = loadServerEnv();

const app = express();

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use("/api/items", itemsRouter);
app.use("/api/grid", gridRouter);
app.use("/api/mines", minesRouter);
app.use("/api/stacks", stacksRouter);
app.use("/api/users", usersRouter);

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
