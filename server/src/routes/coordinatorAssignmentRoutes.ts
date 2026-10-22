
import { Router } from "express";
import { assignCoordinator } from "../controllers/coordinatorAssignmentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = Router();

// Only authenticated admins can assign coordinators.
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  assignCoordinator,
);

export default router;
