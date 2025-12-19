import express from "express";
import cors from "cors";

import coursesRoutes from "./routes/courses.js";
import instructorsRoutes from "./routes/instructors.js";
import instructorCoursesRoutes from "./routes/instructorCourses.js";
import helpRoutes from "./routes/help.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", coursesRoutes);
app.use("/api", instructorsRoutes);
app.use("/api", instructorCoursesRoutes);
app.use("/api", helpRoutes);

app.get("/", (req, res) => {
  res.send("RCVD E-learning API is running");
});

export default app;
