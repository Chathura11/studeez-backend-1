import express from "express";
const router = express.Router();
import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  toggleStatus
} from "../controllers/subjectController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

// Admin routes
router.use(protect, adminOnly);

router.post("/", createSubject);
router.get("/", getSubjects);
router.put("/:id/status", protect, adminOnly, toggleStatus);
router.get("/:id", getSubjectById);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

export default router;
