import express from "express";
import logger from "./utils/logger.js";
import requestLogger from "./middlewares/requestLogger.js";
import errorHandler from "./middlewares/errorHandler.js";
import { prisma } from "./db/prisma.js";
import tournamentRoutes from "./routes/tournamentRoutes.js";
import sportRoutes from "./routes/sportRoutes.js";
import universityRoutes from "./routes/universityRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { requireRole } from "./middlewares/roleMiddleware.js";
import coordinatorAssignmentRoutes from "./routes/coordinatorAssignmentRoutes.js";

const app = express();

app.use(requestLogger);
app.use(express.json());
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/sports", sportRoutes);
app.use("/api/coordinator-assignments", coordinatorAssignmentRoutes);

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    logger.info("Health check successful: API and database are running");

    res.status(200).json({
      success: true,
      message: "SportsHub API is running",
      database: "connected",
    });
  } catch (error) {
    logger.error("Health check failed: database unavailable", error);

    res.status(503).json({
      success: false,
      message: "SportsHub API is running, but database is unavailable",
      database: "disconnected",
    });
  }
});

app.get(
  "/api/test/student",
  authMiddleware,
  requireRole("STUDENT"),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Student access granted",
    });
  },
);

app.get(
  "/api/test/admin",
  authMiddleware,
  requireRole("ADMIN"),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
    });
  },
);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

app.use(errorHandler);

export default app;
