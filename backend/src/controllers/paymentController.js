import pool from "../config/db.js";

/**
 * Initiate Mobile Money payment for a certificate request
 */
export const initiateCertificatePayment = async (req, res) => {
  const requestId = parseInt(req.params.requestId, 10);

  if (!Number.isInteger(requestId)) {
    return res.status(400).json({
      error: "Invalid certificate request ID.",
    });
  }

  try {
    // Get the certificate request belonging to the logged-in learner
    const requestResult = await pool.query(
      `SELECT
         cr.id,
         cr.user_id,
         cr.course_id,
         cr.amount,
         cr.phone_number,
         cr.payment_status,
         cr.certificate_status,
         c.title AS course_title
       FROM certificate_requests cr
       JOIN courses c
         ON c.id = cr.course_id
       WHERE cr.id = $1
         AND cr.user_id = $2`,
      [requestId, req.user.id],
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        error: "Certificate request not found.",
      });
    }

    const request = requestResult.rows[0];

    // Prevent paying an already-paid request
    if (request.payment_status === "PAID") {
      return res.status(400).json({
        error: "This certificate request has already been paid.",
      });
    }

    // Prevent payment if certificate has already been issued
    if (request.certificate_status === "ISSUED") {
      return res.status(400).json({
        error: "The certificate has already been issued.",
      });
    }

    /*
     * LOCAL PAYMENT SIMULATION
     *
     * This is temporary.
     * Later this section will call the real Mobile Money API.
     */

    const paymentReference = `MM-${request.id}-${Date.now()}`;

    res.status(200).json({
      message: "Mobile Money payment initiated successfully.",
      payment: {
        request_id: request.id,
        course_id: request.course_id,
        course_title: request.course_title,
        amount: request.amount,
        phone_number: request.phone_number,
        payment_reference: paymentReference,
        payment_status: "PENDING",
      },
    });
  } catch (err) {
    console.error("Error initiating certificate payment:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};

/**
 * Confirm Mobile Money payment
 *
 * LOCAL SIMULATION ONLY.
 * In production, this should be called by the Mobile Money
 * provider's payment callback/webhook.
 */
export const confirmCertificatePayment = async (req, res) => {
  const requestId = parseInt(req.params.requestId, 10);

  if (!Number.isInteger(requestId)) {
    return res.status(400).json({
      error: "Invalid certificate request ID.",
    });
  }

  try {
    const requestResult = await pool.query(
      `SELECT
         id,
         user_id,
         course_id,
         amount,
         phone_number,
         payment_status,
         certificate_status
       FROM certificate_requests
       WHERE id = $1`,
      [requestId],
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        error: "Certificate request not found.",
      });
    }

    const request = requestResult.rows[0];

    // Already paid
    if (request.payment_status === "PAID") {
      return res.status(400).json({
        error: "This certificate request has already been paid.",
      });
    }

    // Mark payment as successful
    const paymentResult = await pool.query(
      `UPDATE certificate_requests
       SET
         payment_status = 'PAID',
         paid_at = NOW()
       WHERE id = $1
       RETURNING
         id,
         user_id,
         course_id,
         amount,
         phone_number,
         payment_status,
         certificate_status,
         requested_at,
         paid_at,
         issued_at`,
      [requestId],
    );

    res.json({
      message: "Payment confirmed successfully.",
      payment: paymentResult.rows[0],
    });
  } catch (err) {
    console.error("Error confirming certificate payment:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};
