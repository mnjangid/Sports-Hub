
import { Router } from "express";
import { getTournaments, getTournamentByIdController, createTournamentController } from "../controllers/tournamentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { requireSportAssignment } from "../middlewares/sportAuthorization.js";


const router = Router();

router.get("/", getTournaments);
router.get("/:id", getTournamentByIdController);
router.post("/", authMiddleware, requireRole("ADMIN"), requireSportAssignment, createTournamentController);

export default router;
