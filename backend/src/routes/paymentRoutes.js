import express from "express";

import {
  initiateCertificatePayment,
  confirmCertificatePayment,
} from "../controllers/paymentController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
 * Initiate Mobile Money payment
 *
 * POST /api/payments/certificate/:requestId
 */
router.post(
  "/certificate/:requestId",
  authMiddleware,
  initiateCertificatePayment,
);

/*
 * Confirm Mobile Money payment
 *
 * LOCAL TESTING ONLY
 *
 * POST /api/payments/certificate/:requestId/confirm
 */
router.post(
  "/certificate/:requestId/confirm",
  authMiddleware,
  confirmCertificatePayment,
);

export default router;
