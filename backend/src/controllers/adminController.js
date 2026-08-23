import pool from "../config/db.js";

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
