import { Router } from "express";
import * as inningsController from "../controllers/inningController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { requireTournamentSportAccess } from "../middlewares/tournamentSportAuthorization.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN", "COORDINATOR"),
  requireTournamentSportAccess({
    resource: "innings",
    source: "body",
    fieldName: "matchId",
  }),
  inningsController.createInnings
);

router.get("/", inningsController.listInnings);

router.get("/:id", inningsController.getInnings);

router.patch(
  "/:id",
  authMiddleware,
  requireRole("ADMIN", "COORDINATOR"),
  requireTournamentSportAccess({
    resource: "innings",
  }),
  inningsController.updateInnings
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN", "COORDINATOR"),
  requireTournamentSportAccess({
    resource: "innings",
  }),
  inningsController.deleteInnings
);

export default router;
