import { Router } from "express";
import {
  registerLearner,
  registerInstructor,
  login,
  getMe,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/register", registerLearner);
router.post("/register-instructor", registerInstructor);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.get(
  "/learner-test",
  authMiddleware,
  requireRole("LEARNER"),
  (req, res) => {
    res.json({
      message: "You are authorized as a learner.",
      user: req.user,
    });
  },
);

export default router;
