import express from "express";
import cors from "cors";

// Existing routes (KEEP)
import coursesRoutes from "./routes/courses.js";
import instructorsRoutes from "./routes/instructors.js";
import instructorCoursesRoutes from "./routes/instructorCourses.js";
import helpRoutes from "./routes/help.js";

// NEW routes (ADD)
import chapterRoutes from "./routes/chapterRoutes.js";
import subchapterRoutes from "./routes/subchapterRoutes.js";

const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());

/* ===============================
   ROUTES
================================ */

// Courses (public)
app.use("/api", coursesRoutes);

// Instructors (public)
app.use("/api", instructorsRoutes);

// Instructor dashboard (courses CRUD)
app.use("/api", instructorCoursesRoutes);

// Chapters & Subchapters (authoring)
app.use("/api", chapterRoutes);
app.use("/api", subchapterRoutes);

// Help / contact
app.use("/api", helpRoutes);

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("RCVD E-learning API is running");
});

export default app;
