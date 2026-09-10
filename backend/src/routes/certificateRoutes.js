import express from "express";

import {
  requestCertificate,
  getMyCertificateRequest,
  verifyCertificatePayment,
} from "../controllers/certificateController.js";

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

/*
 * Verify Mobile Money payment
 * POST /api/certificates/payment/verify/:requestId
 */
router.post(
  "/payment/verify/:requestId",
  authMiddleware,
  verifyCertificatePayment,
);

export default router;
