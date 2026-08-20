import express from "express";

import {
  createSubchapter,
  getSubchapters,
  updateSubchapter,
  deleteSubchapter,
} from "../controllers/subchapterController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/chapters/:chapterId/subchapters",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  getSubchapters,
);

router.post(
  "/chapters/:chapterId/subchapters",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  createSubchapter,
);

router.put(
  "/subchapters/:subchapterId",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  updateSubchapter,
);

router.delete(
  "/subchapters/:subchapterId",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  deleteSubchapter,
);

export default router;
