import { Router} from "express";
import * as matchController from "../controllers/matchController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { requireTournamentSportAccess } from "../middlewares/tournamentSportAuthorization.js";

const router = Router();
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN", "COORDINATOR"),
  requireTournamentSportAccess({
    resource: "match",
    source: "body",
    fieldName: "tournamentId",
  }),
  matchController.createMatch
);

router.get("/", matchController.listMatches);

router.get("/:id", matchController.getMatch);

router.patch(
  "/:id",
  authMiddleware,
  requireRole("ADMIN", "COORDINATOR"),
  requireTournamentSportAccess({
    resource: "match",
  }),
  matchController.updateMatch
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN", "COORDINATOR"),
  requireTournamentSportAccess({
    resource: "match",
  }),
  matchController.deleteMatch
);

export default router;