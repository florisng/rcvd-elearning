import { Router } from "express";
import userRoutes from "./courses.js";

const router = Router();

router.use("/courses", userRoutes);

export default router;
