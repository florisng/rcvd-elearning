import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

import {
  getCourses,
  getCourseById,
  publishCourse,
  unpublishCourse,
} from "../controllers/coursesController.js";

const router = express.Router();

// Get all courses
router.get("/courses", getCourses);

// Get course by ID
router.get("/courses/:id", getCourseById);

router.put(
  "/instructor/courses/:id/publish",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  publishCourse,
);

router.put(
  "/instructor/courses/:id/unpublish",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  unpublishCourse,
);

export default router;
