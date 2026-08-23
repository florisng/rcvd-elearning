import express from "express";

import {
  approveInstructor,
  getPendingInstructors,
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/admin/instructors/pending",
  authMiddleware,
  requireRole("RCVD_ADMIN"),
  getPendingInstructors,
);

router.patch(
  "/admin/instructors/:id/approve",
  authMiddleware,
  requireRole("RCVD_ADMIN"),
  approveInstructor,
);

export default router;
