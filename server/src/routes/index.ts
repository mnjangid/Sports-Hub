import { Router } from "express";
import universityRoutes from "./universityRoutes.js";
import sportRoutes from "./sportRoutes.js";

const router = Router();

router.use("/universities", universityRoutes);
router.use("/sports", sportRoutes);


export default router;
