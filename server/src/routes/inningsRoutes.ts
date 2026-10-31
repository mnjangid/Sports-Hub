import { Router } from "express";
import * as inningsController from "../controllers/inningController.js";

const router = Router();

router.post("/", inningsController.createInnings);
router.get("/", inningsController.listInnings);
router.get("/:id", inningsController.getInnings);
router.patch("/:id", inningsController.updateInnings);
router.delete("/:id", inningsController.deleteInnings);

export default router;
