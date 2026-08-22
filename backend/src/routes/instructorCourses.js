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

// router.get(
//   "/instructor/test-auth",
//   authMiddleware,
//   requireRole("INSTRUCTOR"),
//   (req, res) => {
//     res.json({
//       message: "Instructor authentication and authorization work.",
//       user: req.user,
//     });
//   },
// );

router.get(
  "/instructor/courses",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  getInstructorCourses,
);

router.get(
  "/instructor/courses/:courseId",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  getInstructorCourse,
);

router.post(
  "/instructor/courses",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  createCourse,
);

router.put(
  "/courses/:courseId",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  updateCourse,
);

router.delete(
  "/courses/:courseId",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  deleteCourse,
);

export default router;
