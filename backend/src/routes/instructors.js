import express from "express";
import { getInstructors, getInstructorById } from "../controllers/instructorsController.js";

const router = express.Router();

router.get("/instructors", getInstructors);
router.get("/instructor/:id", getInstructorById);

export default router;
