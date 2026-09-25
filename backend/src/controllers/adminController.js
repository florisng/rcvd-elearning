import pool from "../config/db.js";
import nodemailer from "nodemailer";

export const approveInstructor = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    // Get the instructor user
    const existingUser = await client.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        password_hash,
        role,
        approval_status
       FROM users
       WHERE id = $1
         AND role = 'INSTRUCTOR'`,
      [id],
    );

    if (existingUser.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Instructor not found.",
      });
    }

    const instructor = existingUser.rows[0];

    // Check if already approved
    if (instructor.approval_status === "APPROVED") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        error: "Instructor is already approved.",
      });
    }

    // Approve the user
    const result = await client.query(
      `UPDATE users
       SET
         approval_status = 'APPROVED',
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING
         id,
         first_name,
         last_name,
         email,
         role,
         approval_status,
         updated_at`,
      [id],
    );

    // Create instructor profile
    await client.query(
      `INSERT INTO instructors (
        firstname,
        lastname,
        email,
        phone,
        bio,
        password,
        user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        instructor.first_name,
        instructor.last_name,
        instructor.email,
        instructor.phone,
        null,
        instructor.password_hash,
        instructor.id,
      ],
    );

    await client.query("COMMIT");

    res.json({
      message: "Instructor approved successfully.",
      instructor: result.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Error approving instructor:", err);

    res.status(500).json({
      error: "Server error",
    });
  } finally {
    client.release();
  }
};

export const getPendingInstructors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        rcvd_registration_number,
        professional_title,
        approval_status,
        email_verified,
        created_at
       FROM users
       WHERE role = 'INSTRUCTOR'
         AND approval_status = 'PENDING'
       ORDER BY created_at ASC`,
    );

    res.json({
      instructors: result.rows,
    });
  } catch (err) {
    console.error("Error fetching pending instructors:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

export const rejectInstructor = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        error: "A rejection reason is required.",
      });
    }

    await client.query("BEGIN");

    // Get the pending instructor
    const existingUser = await client.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        approval_status
       FROM users
       WHERE id = $1
         AND role = 'INSTRUCTOR'`,
      [id],
    );

    if (existingUser.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Instructor not found.",
      });
    }

    const instructor = existingUser.rows[0];

    if (instructor.approval_status !== "PENDING") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        error: "Only pending instructors can be rejected.",
      });
    }

    // Send rejection email first
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"RCVD E-learning" <${process.env.EMAIL_USER}>`,
      to: instructor.email,
      subject: "RCVD E-learning | Instructor Application",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #18436d;">
            RCVD E-learning
          </h2>

          <p>Dear ${instructor.first_name} ${instructor.last_name},</p>

          <p>
            Thank you for your interest in becoming an instructor on the
            RCVD E-learning platform.
          </p>

          <p>
            After reviewing your application, we regret to inform you that
            your instructor application has not been approved at this time.
          </p>

          <p>
            <strong>Reason for rejection:</strong>
          </p>

          <div style="
            background: #f5f7fa;
            border-left: 4px solid #18436d;
            padding: 12px 16px;
            margin: 15px 0;
          ">
            ${reason.trim()}
          </div>

          <p>
            If you believe you can address the issue mentioned above,
            you may submit a new application in the future.
          </p>

          <p>
            Regards,<br />
            <strong>RCVD E-learning Administration</strong>
          </p>
        </div>
      `,
    });

    // Delete the instructor only after the email was sent successfully
    await client.query(
      `DELETE FROM users
       WHERE id = $1
         AND role = 'INSTRUCTOR'
         AND approval_status = 'PENDING'`,
      [id],
    );

    await client.query("COMMIT");

    res.json({
      message: "Instructor rejected and removed successfully.",
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Error rejecting instructor:", err);

    res.status(500).json({
      error: "Failed to reject instructor. The instructor was not removed.",
    });
  } finally {
    client.release();
  }
};

export const getApprovedInstructors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.rcvd_registration_number,
        u.professional_title,
        u.approval_status,
        u.email_verified,
        u.created_at,
        i.id AS instructor_id,
        i.bio
       FROM users u
       LEFT JOIN instructors i ON i.user_id = u.id
       WHERE u.role = 'INSTRUCTOR'
         AND u.approval_status = 'APPROVED'
       ORDER BY u.first_name ASC, u.last_name ASC`,
    );

    res.json({
      instructors: result.rows,
    });
  } catch (err) {
    console.error("Error fetching approved instructors:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE role = 'LEARNER') AS total_learners,
        COUNT(*) FILTER (WHERE role = 'INSTRUCTOR') AS total_instructors,
        COUNT(*) FILTER (
          WHERE role = 'INSTRUCTOR'
          AND approval_status = 'PENDING'
        ) AS pending_instructors,
        COUNT(*) FILTER (
          WHERE role = 'INSTRUCTOR'
          AND approval_status = 'APPROVED'
        ) AS approved_instructors
      FROM users
    `);

    const courseResult = await pool.query(`
      SELECT
        COUNT(*) AS total_courses,
        COUNT(*) FILTER (WHERE status = 'PUBLISHED') AS published_courses
      FROM courses
    `);

    res.json({
      users: result.rows[0],
      courses: courseResult.rows[0],
    });
  } catch (err) {
    console.error("Error fetching admin statistics:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

export const getAdminCourses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.title,
        c.description,
        c.target_professional_title,
        c.price,
        c.status,
        c.created_at,
        i.firstname AS instructor_first_name,
        i.lastname AS instructor_last_name
      FROM courses c
      LEFT JOIN instructors i ON i.id = c.instructor_id
      ORDER BY c.created_at DESC
    `);

    res.json({
      courses: result.rows,
    });
  } catch (err) {
    console.error("Error fetching admin courses:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

export const getAdminLearners = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        email_verified,
        created_at
      FROM users
      WHERE role = 'LEARNER'
      ORDER BY created_at DESC
    `);

    res.json({
      learners: result.rows,
    });
  } catch (err) {
    console.error("Error fetching admin learners:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

export const getAdminLearnerById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        email_verified,
        created_at
       FROM users
       WHERE id = $1
         AND role = 'LEARNER'`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Learner not found.",
      });
    }

    res.json({
      learner: result.rows[0],
    });
  } catch (err) {
    console.error("Error fetching learner:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

export const getAllInstructors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.rcvd_registration_number,
        u.professional_title,
        u.approval_status,
        u.email_verified,
        u.created_at
      FROM users u
      WHERE u.role = 'INSTRUCTOR'
      ORDER BY u.first_name ASC, u.last_name ASC
    `);

    res.json({
      instructors: result.rows,
    });
  } catch (err) {
    console.error("Error fetching all instructors:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

export const getAdminCertificatePayments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         cr.id,
         cr.amount,
         cr.certificate_status,
         cr.instructor_payment_status,
         cr.rcvd_payment_status,
         ROUND(cr.amount * 0.90, 2) AS instructor_amount,
         ROUND(cr.amount * 0.10, 2) AS rcvd_amount,
         cr.requested_at,
         cr.issued_at,
         c.title AS course_title,
         u.first_name AS learner_first_name,
         u.last_name AS learner_last_name,
         u.email AS learner_email,
         i.firstname AS instructor_first_name,
         i.lastname AS instructor_last_name
       FROM certificate_requests cr
       JOIN courses c
         ON c.id = cr.course_id
       JOIN users u
         ON u.id = cr.user_id
       JOIN instructors i
         ON i.id = c.instructor_id
       ORDER BY cr.requested_at DESC`,
    );

    res.json({
      payments: result.rows,
      total: result.rows.length,
    });
  } catch (err) {
    console.error("Error fetching admin certificate payments:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

export const toggleRcvdPaymentStatus = async (req, res) => {
  const requestId = parseInt(req.params.requestId, 10);

  if (!Number.isInteger(requestId)) {
    return res.status(400).json({
      error: "Invalid certificate request ID.",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE certificate_requests
       SET rcvd_payment_status =
         CASE
           WHEN rcvd_payment_status = 'PAID' THEN 'PENDING'
           ELSE 'PAID'
         END
       WHERE id = $1
       RETURNING id, rcvd_payment_status`,
      [requestId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Certificate payment record not found.",
      });
    }

    res.json({
      message: "RCVD payment status updated successfully.",
      payment: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating RCVD payment status:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};
