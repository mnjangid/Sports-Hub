import { Router } from "express";
import universityRoutes from "./universityRoutes.js";
import sportRoutes from "./sportRoutes.js";
import teamRoutes from "./teamroutes.js";
import teamMembershipRoutes from "./teamMembershiproutes.js";

const router = Router();

router.use("/universities", universityRoutes);
router.use("/sports", sportRoutes);
router.use("/teams", teamRoutes);
router.use("/team-memberships", teamMembershipRoutes);


export default router;
