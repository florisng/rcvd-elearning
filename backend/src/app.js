import express from "express";
import cors from "cors";

// Existing routes (KEEP)
import coursesRoutes from "./routes/courses.js";
import instructorsRoutes from "./routes/instructors.js";
import instructorCoursesRoutes from "./routes/instructorCourses.js";
import helpRoutes from "./routes/help.js";
import authRoutes from "./routes/auth.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import adminRoutes from "./routes/admin.js";
import paymentRoutes from "./routes/paymentRoutes.js";
// NEW routes (ADD)
import chapterRoutes from "./routes/chapterRoutes.js";
import subchapterRoutes from "./routes/subchapterRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";

const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

/* ===============================
   ROUTES
================================ */

// Courses (public)
app.use("/api", coursesRoutes);

// Instructor dashboard (courses CRUD)
app.use("/api", instructorCoursesRoutes);

// Instructors (public)
app.use("/api", instructorsRoutes);

// Chapters & Subchapters (authoring)
app.use("/api", chapterRoutes);
app.use("/api", subchapterRoutes);

// Help / contact
app.use("/api", helpRoutes);

// Authentication
app.use("/api/auth", authRoutes);

// Enrollment
app.use("/api", enrollmentRoutes);

// Tests
app.use("/api", testRoutes);

// Admin
app.use("/api", adminRoutes);

// Certificates
app.use("/api/certificates", certificateRoutes);

// Payments
app.use("/api/payments", paymentRoutes);
/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("RCVD E-learning API is running");
});

export default app;
