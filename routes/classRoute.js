import express from "express";
const router = express.Router();
import { protect, adminOnly, studentOnly } from "../middleware/authMiddleware.js";
import {
  createClass,
  getAllClasses,
  requestClassAccess,
  approveStudent,
  toggleStatus,
  getClassById
} from "../controllers/classController.js";

// Admin creates a class
router.post("/", protect, adminOnly, createClass);

// Get all classes
router.get("/", protect, getAllClasses);

router.put("/:id/status", protect, adminOnly, toggleStatus);

// Student requests access
router.post("/:id/request", protect,studentOnly, requestClassAccess);

// Admin approves student
router.patch("/:id/approve", protect, adminOnly, approveStudent);

router.get("/:id", protect, getClassById);

export default router;
