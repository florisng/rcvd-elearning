import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import {
  enrollInCourse,
  getMyCourses,
  getMyCourse,
  completeSubchapter,
  getCourseProgress,
  recordChapterLearningTime,
  getChapterLearningProgress,
  getCourseChapterProgress,
  completeChapter,
} from "../controllers/enrollmentController.js";

const router = express.Router();

router.get("/my-courses", authMiddleware, requireRole("LEARNER"), getMyCourses);

router.post(
  "/courses/:courseId/enroll",
  authMiddleware,
  requireRole("LEARNER"),
  enrollInCourse,
);

router.get(
  "/my-courses/:courseId/progress",
  authMiddleware,
  requireRole("LEARNER"),
  getCourseProgress,
);

router.get(
  "/my-courses/:courseId",
  authMiddleware,
  requireRole("LEARNER"),
  getMyCourse,
);

router.post(
  "/chapters/:chapterId/learning-time",
  authMiddleware,
  requireRole("LEARNER"),
  recordChapterLearningTime,
);

router.post(
  "/chapters/:chapterId/complete",
  authMiddleware,
  requireRole("LEARNER"),
  completeChapter,
);

router.get(
  "/courses/:courseId/chapter-progress",
  authMiddleware,
  requireRole("LEARNER"),
  getCourseChapterProgress,
);

router.get(
  "/chapters/:chapterId/learning-progress",
  authMiddleware,
  requireRole("LEARNER"),
  getChapterLearningProgress,
);

router.post(
  "/subchapters/:subchapterId/complete",
  authMiddleware,
  requireRole("LEARNER"),
  completeSubchapter,
);

export default router;
