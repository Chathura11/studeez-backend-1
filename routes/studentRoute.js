import express from "express";
import { protect, studentOnly } from "../middleware/authMiddleware.js";
import { getMyClasses } from "../controllers/studentController.js";

const router = express.Router();

router.get("/my-classes", protect, studentOnly, getMyClasses);

export default router;
