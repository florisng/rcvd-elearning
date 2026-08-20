import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerLearner = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      rcvd_registration_number,
      professional_title,
      password,
    } = req.body;

    // Basic validation
    if (
      !first_name ||
      !last_name ||
      !email ||
      !rcvd_registration_number ||
      !professional_title ||
      !password
    ) {
      return res.status(400).json({
        error: "Please fill in all required fields.",
      });
    }

    // Check if email already exists
    const existingEmail = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email.trim()],
    );

    if (existingEmail.rows.length > 0) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    // Check if RCVD registration number already exists
    const existingRegistration = await pool.query(
      `SELECT id
       FROM users
       WHERE rcvd_registration_number = $1`,
      [rcvd_registration_number.trim()],
    );

    if (existingRegistration.rows.length > 0) {
      return res.status(409).json({
        error: "This RCVD registration number is already registered.",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create learner
    const result = await pool.query(
      `INSERT INTO users
        (
          first_name,
          last_name,
          email,
          phone,
          password_hash,
          role,
          rcvd_registration_number,
          professional_title
        )
       VALUES ($1, $2, $3, $4, $5, 'LEARNER', $6, $7)
       RETURNING
          id,
          first_name,
          last_name,
          email,
          phone,
          role,
          rcvd_registration_number,
          professional_title,
          email_verified,
          is_active,
          created_at`,
      [
        first_name.trim(),
        last_name.trim(),
        email.trim().toLowerCase(),
        phone?.trim() || null,
        password_hash,
        rcvd_registration_number.trim(),
        professional_title.trim(),
      ],
    );

    res.status(201).json({
      message: "Learner account created successfully.",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error registering learner:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const result = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        password_hash,
        role,
        rcvd_registration_number,
        professional_title,
        email_verified,
        is_active
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email.trim()],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        error: "Your account is inactive.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        rcvd_registration_number: user.rcvd_registration_number,
        professional_title: user.professional_title,
        email_verified: user.email_verified,
      },
    });
  } catch (err) {
    console.error("Error logging in:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        role,
        rcvd_registration_number,
        professional_title,
        email_verified,
        is_active,
        created_at
       FROM users
       WHERE id = $1`,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        error: "Your account is inactive.",
      });
    }

    res.json({
      user,
    });
  } catch (err) {
    console.error("Error fetching current user:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};
