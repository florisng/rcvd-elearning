import express from "express";
import { createSubchapter } from "../controllers/subchapterController.js";

const router = express.Router();

router.post("/chapters/:chapterId/subchapters", createSubchapter);

export default router;
