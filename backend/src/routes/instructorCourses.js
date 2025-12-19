import express from "express";
import {
  getInstructorCourses,
  createCourse,
  updateCourse,
  deleteCourse
} from "../controllers/instructorCoursesController.js";

const router = express.Router();

router.get("/instructor/:id/courses", getInstructorCourses);
router.post("/instructor/:id/courses", createCourse);
router.put("/courses/:courseId", updateCourse);
router.delete("/courses/:courseId", deleteCourse);

export default router;
