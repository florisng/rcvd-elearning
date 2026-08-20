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

    console.log(
      `Found ${instructorsResult.rows.length} instructors to migrate.`,
    );

    for (const instructor of instructorsResult.rows) {
      // Check whether this email already exists
      const existingUser = await client.query(
        `SELECT id FROM users WHERE LOWER(email) = LOWER($1)`,
        [instructor.email],
      );

      let userId;

      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;

        console.log(
          `User already exists for ${instructor.email} (ID: ${userId})`,
        );
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

        console.log(`Created user ${userId} for ${instructor.email}`);
      }

      // Connect instructor profile to authentication account
      await client.query(
        `UPDATE instructors
         SET user_id = $1
         WHERE id = $2`,
        [userId, instructor.id],
      );

      console.log(`Connected instructor ${instructor.id} → user ${userId}`);
    }

    await client.query("COMMIT");

    console.log("✅ Instructor migration completed successfully.");
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("❌ Instructor migration failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
};

migrateInstructors();
