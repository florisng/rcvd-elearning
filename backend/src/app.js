import express from "express";
import cors from "cors";

import coursesRoutes from "./routes/courses.js";
import instructorsRoutes from "./routes/instructors.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", coursesRoutes);
app.use("/api", instructorsRoutes);

app.get("/", (req, res) => {
  res.send("RCVD E-learning API is running");
});

export default app;
