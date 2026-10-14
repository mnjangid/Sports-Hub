
import type { ErrorRequestHandler } from "express";
import logger from "../utils/logger.js";

const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  _next,
) => {
  const statusCode =
    typeof err?.statusCode === "number"
      ? err.statusCode
      : typeof err?.status === "number"
        ? err.status
        : 500;

  logger.error("Request failed", {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : err instanceof Error
          ? err.message
          : "Request failed",
  });
};

export default errorHandler;
