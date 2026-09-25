import express from "express";

import {
  getAdminStats,
  getAllInstructors,
  getPendingInstructors,
  getApprovedInstructors,
  approveInstructor,
  rejectInstructor,
  getAdminCourses,
  getAdminLearners,
  getAdminLearnerById,
  getAdminCertificatePayments,
  toggleRcvdPaymentStatus,
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/admin/stats",
  authMiddleware,
  requireRole("RCVD_ADMIN"),
  getAdminStats,
);

router.get(
  "/admin/instructors",
  authMiddleware,
  requireRole("RCVD_ADMIN"),
  getAllInstructors,
);

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
  "/admin/courses",
  authMiddleware,
  requireRole("RCVD_ADMIN"),
  getAdminCourses,
);

router.get(
  "/admin/learners",
  authMiddleware,
  requireRole("RCVD_ADMIN"),
  getAdminLearners,
);

router.get(
  "/admin/learners/:id",
  authMiddleware,
  requireRole("RCVD_ADMIN"),
  getAdminLearnerById,
);

router.get(
  "/admin/certificate-payments",
  authMiddleware,
  requireRole("RCVD_ADMIN"),
  getAdminCertificatePayments,
);

router.patch(
  "/admin/certificate-payments/:requestId/rcvd-status",
  authMiddleware,
  requireRole("RCVD_ADMIN"),
  toggleRcvdPaymentStatus,
);

export default router;
