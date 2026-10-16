import {Router} from "express";
import * as sportController from "../controllers/sportController.js";

const router = Router();

router.post("/", sportController.createSport);
router.get("/", sportController.listSports);
router.get("/:id", sportController.getSport);
router.patch("/:id", sportController.updateSport);
router.delete("/:id", sportController.deactivateSport);

export default router;