import express from "express";
import { getCourses, getCourseById } from "../controllers/coursesController.js";

const router = express.Router();

// Get all courses
router.get("/", getCourses);

// Get course by ID
router.get("/:id", getCourseById);

export default router;
