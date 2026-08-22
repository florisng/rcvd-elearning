import { Router } from "express";

import userRoutes from "./courses.js";
import chapterRoutes from "./chapterRoutes.js";

const router = Router();

router.use("/courses", userRoutes);
router.use("/", chapterRoutes);

export default router;
