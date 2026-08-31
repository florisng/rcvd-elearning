import express from "express";

import {
  getInstructorCourses,
  getInstructorCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/instructorCoursesController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get instructor's courses
router.get(
  "/instructor/courses",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  getInstructorCourses,
);

// Get one instructor course
router.get(
  "/instructor/courses/:courseId",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  getInstructorCourse,
);

// Create course
router.post(
  "/instructor/courses",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  createCourse,
);

// Update course
router.put(
  "/instructor/courses/:courseId",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  updateCourse,
);

// Delete course
router.delete(
  "/instructor/courses/:courseId",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  deleteCourse,
);

export default router;
