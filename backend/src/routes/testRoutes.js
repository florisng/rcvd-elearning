import express from "express";

import {
  createTest,
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  startTest,
  submitTest,
} from "../controllers/testController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create a test for instructor's course
router.post(
  "/instructor/courses/:courseId/test",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  createTest,
);

router.post(
  "/tests/:testId/questions",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  createQuestion,
);

router.get(
  "/tests/:testId/questions",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  getQuestions,
);

router.put(
  "/test-questions/:questionId",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  updateQuestion,
);

router.delete(
  "/test-questions/:questionId",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  deleteQuestion,
);

router.post(
  "/tests/:testId/start",
  authMiddleware,
  requireRole("LEARNER"),
  startTest,
);

router.post(
  "/tests/attempts/:attemptId/submit",
  authMiddleware,
  requireRole("LEARNER"),
  submitTest,
);

export default router;
