import express from "express";

import {
  createTest,
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  startTest,
  submitTest,
  getTestAttempts,
  resumeTest,
  saveAnswer,
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

// Create a question
router.post(
  "/tests/:testId/questions",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  createQuestion,
);

// Get questions
router.get(
  "/tests/:testId/questions",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  getQuestions,
);

// Update question
router.put(
  "/test-questions/:questionId",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  updateQuestion,
);

// Delete question
router.delete(
  "/test-questions/:questionId",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  deleteQuestion,
);

// Start test
router.post(
  "/tests/:testId/start",
  authMiddleware,
  requireRole("LEARNER"),
  startTest,
);

// Get test attempts
router.get(
  "/tests/:testId/attempts",
  authMiddleware,
  requireRole("LEARNER"),
  getTestAttempts,
);

// Submit test
router.post(
  "/tests/attempts/:attemptId/submit",
  authMiddleware,
  requireRole("LEARNER"),
  submitTest,
);

// Resume test
router.get(
  "/tests/attempts/:attemptId/resume",
  authMiddleware,
  requireRole("LEARNER"),
  resumeTest,
);

// Save answer
router.post(
  "/tests/attempts/:attemptId/answers",
  authMiddleware,
  requireRole("LEARNER"),
  saveAnswer,
);

export default router;
