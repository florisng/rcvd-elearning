import express from "express";
import { getCourses, getCourseById } from "../controllers/coursesController.js";

const router = express.Router();

// Get all courses
router.get("/courses", getCourses);

// Get course by ID
router.get("/course/:id", getCourseById);

export default router;
