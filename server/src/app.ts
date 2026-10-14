
import express from "express";
import logger from "./utils/logger.js";
import requestLogger from "./middlewares/requestLogger.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.use(requestLogger);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  logger.info("Health endpoint accessed");

  res.status(200).json({
    success: true,
    message: "SportsHub API is running",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

app.use(errorHandler);

export default app;
