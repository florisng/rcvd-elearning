import express from "express";
import { createChapter } from "../controllers/chapterController.js";

const router = express.Router();

router.post("/courses/:courseId/chapters", createChapter);

export default router;
