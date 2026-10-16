
import { Router } from "express";
import { getTournaments, getTournamentByIdController, createTournamentController } from "../controllers/tournamentController.js";


const router = Router();

router.get("/", getTournaments);
router.get("/:id", getTournamentByIdController);
router.post("/", createTournamentController);

export default router;
