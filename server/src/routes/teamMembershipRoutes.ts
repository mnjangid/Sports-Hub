
import { Router } from "express";
import * as teamMembershipController from "../controllers/teamMembershipController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

import {
  requireTeamSportAccess,
  requireTournamentSportAccess,
} from "../middlewares/tournamentSportAuthorization.js";

const router = Router();

// Public read-only routes
router.get("/", teamMembershipController.listTeamMembers);
router.get("/:id", teamMembershipController.getTeamMember);

// Add a player to a team
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN", "COORDINATOR"),
  requireTeamSportAccess,
  teamMembershipController.addTeamMember,
);

// Update membership
router.patch(
  "/:id",
  authMiddleware,
  requireRole("ADMIN", "COORDINATOR"),
  requireTournamentSportAccess({ resource: "membership" }),
  teamMembershipController.updateTeamMember,
);

// Remove membership (preserves membership history)
router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN", "COORDINATOR"),
  requireTournamentSportAccess({ resource: "membership" }),
  teamMembershipController.removeTeamMember,
);

export default router;
