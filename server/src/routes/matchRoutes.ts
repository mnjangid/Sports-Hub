import { Router} from "express";
import * as matchController from "../controllers/matchController.js";

const router = Router();

router.post("/", matchController.createMatch);
router.get("/", matchController.listMatches);
router.get("/:id", matchController.getMatch);
router.patch("/:id", matchController.updateMatch);
router.delete("/:id", matchController.deleteMatch);

export default router;