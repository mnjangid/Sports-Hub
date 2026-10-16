import { Router } from "express";
import universityRoutes from "./university.routes.js";
import sportRoutes from "./sport.routes.js";

const router = Router();

router.use("/universities", universityRoutes);
router.use("/sports", sportRoutes);


export default router;
