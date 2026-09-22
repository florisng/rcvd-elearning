import express from "express";

import {
  approveInstructor,
  getPendingInstructors,
  rejectInstructor,
  getApprovedInstructors,
  getAdminStats,
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

router.get(
  "/admin/instructors/approved",
  authMiddleware,
  requireRole("RCVD_ADMIN"),
  getApprovedInstructors,
);

router.patch(
  "/admin/instructors/:id/approve",
  authMiddleware,
  requireRole("RCVD_ADMIN"),
  approveInstructor,
);

router.patch(
  "/admin/instructors/:id/reject",
  authMiddleware,
  requireRole("RCVD_ADMIN"),
  rejectInstructor,
);

router.get(
  "/admin/stats",
  authMiddleware,
  requireRole("RCVD_ADMIN"),
  getAdminStats,
);

export default router;
