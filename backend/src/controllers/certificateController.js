import pool from "../config/db.js";

/**
 * Request a certificate after passing the course test.
 *
 * The learner must:
 * 1. Be enrolled in the course
 * 2. Have passed the course test
 * 3. Not already have an issued certificate
 * 4. Not already have a pending certificate request
 */
export const requestCertificate = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);

  const { phone_number } = req.body || {};

  if (!Number.isInteger(courseId)) {
    return res.status(400).json({
      error: "Invalid course ID.",
    });
  }

  if (!phone_number?.trim()) {
    return res.status(400).json({
      error: "Mobile Money phone number is required.",
    });
  }

  try {
    // 1. Get the course and price
    const courseResult = await pool.query(
      `SELECT
         id,
         title,
         price
       FROM courses
       WHERE id = $1`,
      [courseId],
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: "Course not found.",
      });
    }

    const course = courseResult.rows[0];

    // 2. Make sure learner is enrolled
    const enrollmentResult = await pool.query(
      `SELECT id, status
       FROM enrollments
       WHERE user_id = $1
         AND course_id = $2`,
      [req.user.id, courseId],
    );

    if (enrollmentResult.rows.length === 0) {
      return res.status(403).json({
        error: "You are not enrolled in this course.",
      });
    }

    const enrollment = enrollmentResult.rows[0];

    // 3. Find the course test
    const testResult = await pool.query(
      `SELECT
         id,
         title,
         pass_percentage
       FROM tests
       WHERE course_id = $1`,
      [courseId],
    );

    if (testResult.rows.length === 0) {
      return res.status(400).json({
        error: "This course does not have a test.",
      });
    }

    const test = testResult.rows[0];

    // 4. Make sure the learner has passed the test
    const passedAttemptResult = await pool.query(
      `SELECT
         id,
         score,
         passed,
         submitted_at
       FROM test_attempts
       WHERE test_id = $1
         AND user_id = $2
         AND status = 'COMPLETED'
         AND passed = true
       ORDER BY submitted_at DESC
       LIMIT 1`,
      [test.id, req.user.id],
    );

    if (passedAttemptResult.rows.length === 0) {
      return res.status(403).json({
        error: "You must pass the course test before requesting a certificate.",
      });
    }

    // 5. Check whether certificate already exists
    const certificateResult = await pool.query(
      `SELECT
         id,
         certificate_number,
         issued_at
       FROM certificates
       WHERE user_id = $1
         AND course_id = $2`,
      [req.user.id, courseId],
    );

    if (certificateResult.rows.length > 0) {
      return res.status(409).json({
        error: "You already have a certificate for this course.",
        certificate: certificateResult.rows[0],
      });
    }

    // 6. Check for an existing pending request
    const pendingRequestResult = await pool.query(
      `SELECT
         id,
         amount,
         phone_number,
         payment_status,
         certificate_status,
         requested_at
       FROM certificate_requests
       WHERE user_id = $1
         AND course_id = $2
         AND certificate_status = 'PENDING'
       ORDER BY requested_at DESC
       LIMIT 1`,
      [req.user.id, courseId],
    );

    if (pendingRequestResult.rows.length > 0) {
      return res.status(409).json({
        error:
          "You already have a pending certificate request for this course.",
        request: pendingRequestResult.rows[0],
      });
    }

    // 7. Create certificate request
    const requestResult = await pool.query(
      `INSERT INTO certificate_requests (
         user_id,
         course_id,
         amount,
         phone_number,
         payment_status,
         certificate_status
       )
       VALUES ($1, $2, $3, $4, 'PENDING', 'PENDING')
       RETURNING
         id,
         user_id,
         course_id,
         amount,
         phone_number,
         payment_status,
         certificate_status,
         requested_at`,
      [req.user.id, courseId, course.price, phone_number.trim()],
    );

    const certificateRequest = requestResult.rows[0];

    res.status(201).json({
      message: "Certificate request created successfully.",
      request: certificateRequest,
      course: {
        id: course.id,
        title: course.title,
        price: course.price,
      },
      test: {
        id: test.id,
        title: test.title,
        passed: true,
      },
    });
  } catch (err) {
    console.error("Error requesting certificate:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};

/**
 * Get the learner's certificate request for a course.
 */
export const getCertificateRequest = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);

  if (!Number.isInteger(courseId)) {
    return res.status(400).json({
      error: "Invalid course ID.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         cr.id,
         cr.user_id,
         cr.course_id,
         cr.amount,
         cr.phone_number,
         cr.payment_status,
         cr.certificate_status,
         cr.requested_at,
         cr.paid_at,
         cr.issued_at,
         c.title AS course_title,
         c.price AS course_price
       FROM certificate_requests cr
       JOIN courses c
         ON c.id = cr.course_id
       WHERE cr.user_id = $1
         AND cr.course_id = $2
       ORDER BY cr.requested_at DESC
       LIMIT 1`,
      [req.user.id, courseId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No certificate request found.",
      });
    }

    res.json({
      request: result.rows[0],
    });
  } catch (err) {
    console.error("Error fetching certificate request:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};

/**
 * Get the learner's issued certificate for a course.
 */
export const getCertificate = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);

  if (!Number.isInteger(courseId)) {
    return res.status(400).json({
      error: "Invalid course ID.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         cert.id,
         cert.certificate_number,
         cert.user_id,
         cert.course_id,
         cert.issued_at,
         cert.qr_code,
         u.first_name,
         u.last_name,
         u.email,
         u.professional_title,
         u.rcvd_registration_number,
         c.title AS course_title,
         c.description AS course_description
       FROM certificates cert
       JOIN users u
         ON u.id = cert.user_id
       JOIN courses c
         ON c.id = cert.course_id
       WHERE cert.user_id = $1
         AND cert.course_id = $2`,
      [req.user.id, courseId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Certificate not found.",
      });
    }

    res.json({
      certificate: result.rows[0],
    });
  } catch (err) {
    console.error("Error fetching certificate:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};

export const getMyCertificateRequest = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         cr.id,
         cr.user_id,
         cr.course_id,
         cr.amount,
         cr.phone_number,
         cr.payment_status,
         cr.certificate_status,
         cr.requested_at,
         cr.paid_at,
         cr.issued_at,
         c.title AS course_title
       FROM certificate_requests cr
       JOIN courses c
         ON c.id = cr.course_id
       WHERE cr.user_id = $1
       ORDER BY cr.requested_at DESC`,
      [req.user.id],
    );

    res.json({
      requests: result.rows,
    });
  } catch (err) {
    console.error("Error fetching certificate requests:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};

/**
 * Verify Mobile Money payment and issue certificate
 * Local/testing version
 */
export const verifyCertificatePayment = async (req, res) => {
  const requestId = parseInt(req.params.requestId, 10);

  if (!Number.isInteger(requestId)) {
    return res.status(400).json({
      error: "Invalid certificate request ID.",
    });
  }

  try {
    // 1. Get the certificate request belonging to the logged-in learner
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

    // 2. If certificate has already been issued
    if (request.certificate_status === "ISSUED") {
      const certificateResult = await pool.query(
        `SELECT
           id,
           certificate_number,
           user_id,
           course_id,
           issued_at,
           qr_code
         FROM certificates
         WHERE user_id = $1
           AND course_id = $2
         LIMIT 1`,
        [request.user_id, request.course_id],
      );

      return res.json({
        message: "Certificate has already been issued.",
        certificate: certificateResult.rows[0] || null,
      });
    }

    // 3. If payment has already been confirmed
    if (request.payment_status === "PAID") {
      return res.json({
        message: "Payment has already been confirmed.",
        payment_status: "PAID",
      });
    }

    /*
     * LOCAL TESTING ONLY
     *
     * In production, this is where we will verify
     * the transaction with MTN MoMo/Airtel Money.
     */

    // 4. Confirm payment
    await pool.query(
      `UPDATE certificate_requests
       SET
         payment_status = 'PAID',
         paid_at = NOW()
       WHERE id = $1`,
      [requestId],
    );

    // 5. Generate a unique certificate number
    const certificateNumber = `RCVD-${new Date().getFullYear()}-${request.id}`;

    // 6. Generate QR-code data
    //
    // For now we store the verification URL as text.
    // Later the frontend can turn this into an actual QR image.
    const qrCode = `/api/certificates/verify/${certificateNumber}`;

    // 7. Create the certificate
    const certificateResult = await pool.query(
      `INSERT INTO certificates (
         certificate_number,
         user_id,
         course_id,
         issued_at,
         qr_code
       )
       VALUES ($1, $2, $3, NOW(), $4)
       RETURNING
         id,
         certificate_number,
         user_id,
         course_id,
         issued_at,
         qr_code`,
      [certificateNumber, request.user_id, request.course_id, qrCode],
    );

    const certificate = certificateResult.rows[0];

    // 8. Mark certificate request as issued
    await pool.query(
      `UPDATE certificate_requests
       SET
         certificate_status = 'ISSUED',
         issued_at = NOW()
       WHERE id = $1`,
      [requestId],
    );

    // 9. Return payment + certificate information
    res.json({
      message: "Payment confirmed and certificate issued successfully.",
      payment: {
        request_id: request.id,
        course_id: request.course_id,
        course_title: request.course_title,
        amount: request.amount,
        phone_number: request.phone_number,
        payment_status: "PAID",
      },
      certificate,
    });
  } catch (err) {
    console.error("Error verifying payment and issuing certificate:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};
