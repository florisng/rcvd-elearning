import express from "express";

import {
  createChapter,
  getChapters,
  updateChapter,
  deleteChapter,
} from "../controllers/chapterController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/courses/:courseId/chapters",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  getChapters,
);

router.post(
  "/courses/:courseId/chapters",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  createChapter,
);

router.put(
  "/chapters/:chapterId",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  updateChapter,
);

router.delete(
  "/chapters/:chapterId",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  deleteChapter,
);

export default router;
