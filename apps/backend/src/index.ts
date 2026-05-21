import cors from "cors";
import { AID_HEADER } from "./constants/aid.js";
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { loadServerEnv } from "./config/serverEnv.js";
import { gridRouter } from "./routes/grid.js";
import { itemsRouter } from "./routes/items.js";
import { usersRouter } from "./routes/users.js";
import { structuresRouter } from "./routes/structures.js";
import { stacksRouter } from "./routes/stacks.js";

const { railwayPublicDomain, corsOrigin, port } = loadServerEnv();

const app = express();

app.use(
  cors({
    origin: corsOrigin,
    allowedHeaders: ["Content-Type", AID_HEADER],
  }),
);
app.use(express.json());
app.use("/api/items", itemsRouter);
app.use("/api/grid", gridRouter);
app.use("/api/structures", structuresRouter);
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
