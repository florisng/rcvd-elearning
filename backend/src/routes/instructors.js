import express from "express";
import {
  getInstructors,
  getInstructorById,
} from "../controllers/instructorController.js";

const router = express.Router();

// Get all instructors
router.get("/instructors", getInstructors);

// Get details of a single instructor by ID
router.get("/instructor/:id", getInstructorById);

export default router;
