import { Router } from "express";
import * as teamMembershipController from "../controllers/teamMembershipController.js";

const router = Router();

router.post("/", teamMembershipController.addTeamMember);
router.get("/", teamMembershipController.listTeamMembers);
router.get("/:id", teamMembershipController.getTeamMember);
router.patch("/:id", teamMembershipController.updateTeamMember);
router.delete("/:id", teamMembershipController.removeTeamMember);

export default router;
