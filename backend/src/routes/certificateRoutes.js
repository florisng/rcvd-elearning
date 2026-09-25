import express from "express";

import {
  requestCertificate,
  getMyCertificateRequest,
  verifyCertificatePayment,
  approveCertificateRequest,
  getInstructorCertificateRequests,
  getMyCertificates,
  viewMyCertificate,
  verifyCertificate,
} from "../controllers/certificateController.js";

import requireRole from "../middleware/roleMiddleware.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
 * Learner requests a certificate
 * POST /api/certificates/request/:courseId
 */
router.post("/request/:courseId", authMiddleware, requestCertificate);

/*
 * Learner checks their certificate request
 * GET /api/certificates/request/:courseId
 */
router.get("/request/:courseId", authMiddleware, getMyCertificateRequest);

router.get("/my-certificates", authMiddleware, getMyCertificates);

router.get(
  "/my-certificates/:certificateId/view",
  authMiddleware,
  viewMyCertificate,
);

/*
 * Verify Mobile Money payment
 * POST /api/certificates/payment/verify/:requestId
 */
router.post(
  "/payment/verify/:requestId",
  authMiddleware,
  verifyCertificatePayment,
);

router.patch(
  "/request/:requestId/approve",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  approveCertificateRequest,
);

router.get(
  "/instructor/requests",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  getInstructorCertificateRequests,
);

/*
 * Public certificate verification
 * GET /api/certificates/verify/:certificateNumber
 */
router.get("/verify/:certificateNumber", verifyCertificate);

export default router;
