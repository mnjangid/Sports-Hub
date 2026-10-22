
import { Router } from "express";
import * as sportController from "../controllers/sportController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = Router();

// Public endpoints: anyone can view sports.
router.get("/", sportController.listSports);
router.get("/:id", sportController.getSport);

// Admin-only endpoints.
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  sportController.createSport,
);

router.patch(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  sportController.updateSport,
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  sportController.deactivateSport,
);

export default router;
