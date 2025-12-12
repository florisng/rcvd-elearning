import express from "express";
import cors from "cors";
import coursesRoutes from "./routes/courses.js";
import instructorsRoutes from "./routes/instructors.js";

const app = express();

app.use(cors()); // Allow frontend requests
app.use(express.json());

app.use("/api", coursesRoutes);
app.use("/instructors", instructorsRoutes);

export default app;
