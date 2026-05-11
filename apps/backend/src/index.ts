import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { loadServerEnv } from "./config/serverEnv.js";
import { getPedestriansFor, saveVisitsFor } from "./services/DatabaseService.js";
import { itemsRouter } from "./routes/items.js";
import { gridRouter } from "./routes/grid.js";

const { railwayPublicDomain, corsOrigin, port } = loadServerEnv();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/items", itemsRouter);
app.use("/api/grid", gridRouter);

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
