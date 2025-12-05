import express from "express";
import { getInstructors, getInstructorById } from "../controllers/instructorsController.js";

const router = express.Router();

// Get all instructors
router.get("/", getInstructors);

// Get instructor by ID
router.get("/:id", getInstructorById);

export default router;
