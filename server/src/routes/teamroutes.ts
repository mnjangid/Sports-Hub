import { Router } from "express";
import * as teamController from "../controllers/teamcontroller.js";

const router = Router();

router.post("/", teamController.createTeam);
router.get("/", teamController.listTeams);
router.get("/:id", teamController.getTeam);
router.patch("/:id", teamController.updateTeam);
router.delete("/:id", teamController.deleteTeam);

export default router;
