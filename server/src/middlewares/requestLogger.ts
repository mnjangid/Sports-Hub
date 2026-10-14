
import type { RequestHandler } from "express";
import logger from "../utils/logger.js";

const requestLogger: RequestHandler = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    logger.info("HTTP request completed", {
      method: req.method,
      url: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startTime,
    });
  });

  next();
};

export default requestLogger;
