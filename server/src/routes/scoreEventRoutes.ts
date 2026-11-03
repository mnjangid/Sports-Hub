import { Router } from "express";
import * as scoreEventController from "../controllers/scoreEventController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { requireTournamentSportAccess } from "../middlewares/tournamentSportAuthorization.js";

const router = Router();

// Create a score event
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN", "COORDINATOR"),
  requireTournamentSportAccess({
    resource: "innings",
    source: "body",
    fieldName: "inningsId",
  }),
  scoreEventController.createScoreEventController
);

// Correct an existing score event
router.patch(
  "/:id/correct",
  authMiddleware,
  requireRole("ADMIN", "COORDINATOR"),
  requireTournamentSportAccess({
    resource: "scoreEvent",
  }),
  scoreEventController.correctScoreEventController
);

export default router;