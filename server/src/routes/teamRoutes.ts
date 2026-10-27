// import { Router } from "express";
// import * as teamController from "../controllers/teamController.js";

// const router = Router();

// router.post("/", teamController.createTeam);
// router.get("/", teamController.listTeams);
// router.get("/:id", teamController.getTeam);
// router.patch("/:id", teamController.updateTeam);
// router.delete("/:id", teamController.deleteTeam);

// export default router;



//
import { Router } from "express";
import * as teamController from "../controllers/teamController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { requireTournamentSportAccess } from "../middlewares/tournamentSportAuthorization.js";
import { requireSportAssignment } from "../middlewares/sportAuthorization.js";

const router = Router();

// Public read-only routes
router.get("/", teamController.listTeams);
router.get("/:id", teamController.getTeam);

// Create team: authenticated ADMIN or assigned COORDINATOR
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN", "COORDINATOR"),
  requireSportAssignment,
  teamController.createTeam,
);

// Update team: verify permission using the existing team's sport
router.patch(
  "/:id",
  authMiddleware,
  requireRole("ADMIN", "COORDINATOR"),
  requireTournamentSportAccess({ resource: "team" }),
  teamController.updateTeam,
);

// Delete team: verify permission using the existing team's sport
router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN", "COORDINATOR"),
  requireTournamentSportAccess({ resource: "team" }),
  teamController.deleteTeam,
);

export default router;

