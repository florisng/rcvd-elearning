import express from "express";
import { sendHelpMessage } from "../controllers/helpController.js";

const router = express.Router();

router.post("/help", sendHelpMessage);

export default router;
