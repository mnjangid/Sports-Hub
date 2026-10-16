import { Router } from "express";
import * as universityController from "../controllers/university.controller.js";

const router = Router();

router.post("/", universityController.createUniversity);
router.get("/", universityController.listUniversities);
router.get("/:id", universityController.getUniversity);
router.patch("/:id", universityController.updateUniversity);
router.delete("/:id", universityController.deactivateUniversity);

export default router;
