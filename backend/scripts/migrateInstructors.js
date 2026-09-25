import dotenv from "dotenv";
import bcrypt from "bcrypt";
import pool from "../src/config/db.js";

dotenv.config();

const migrateInstructors = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const instructorsResult = await client.query(`
      SELECT
        id,
        firstname,
        lastname,
        email,
        phone,
        bio,
        password
      FROM instructors
      WHERE user_id IS NULL
      ORDER BY id
    `);

    for (const instructor of instructorsResult.rows) {
      // Check whether this email already exists
      const existingUser = await client.query(
        `SELECT id FROM users WHERE LOWER(email) = LOWER($1)`,
        [instructor.email],
      );

      let userId;

      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
      } else {
        const passwordHash = await bcrypt.hash(instructor.password, 12);

        const userResult = await client.query(
          `INSERT INTO users (
            first_name,
            last_name,
            email,
            phone,
            password_hash,
            role,
            email_verified,
            is_active
          )
          VALUES ($1, $2, $3, $4, $5, 'INSTRUCTOR', true, true)
          RETURNING id`,
          [
            instructor.firstname,
            instructor.lastname,
            instructor.email,
            instructor.phone,
            passwordHash,
          ],
        );

        userId = userResult.rows[0].id;
      }

      // Connect instructor profile to authentication account
      await client.query(
        `UPDATE instructors
         SET user_id = $1
         WHERE id = $2`,
        [userId, instructor.id],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("❌ Instructor migration failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
};

migrateInstructors();
