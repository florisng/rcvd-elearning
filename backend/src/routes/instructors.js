import express from "express";
import {
  getInstructors,
  getInstructorById,
  getInstructorCourses
} from "../controllers/instructorController.js";

const router = express.Router();

// Get all instructors
router.get("/instructors", getInstructors);

// Get details of a single instructor by ID
router.get("/instructor/:id", getInstructorById);

// Get all courses of a specific instructor
router.get("/instructor/:id/courses", getInstructorCourses);

export default router;
