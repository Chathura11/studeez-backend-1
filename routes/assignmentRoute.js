import express from "express";
import { protect, studentOnly, teacherOnly } from "../middleware/authMiddleware.js";
import {
  createAssignment,
  getAssignmentsByClass,
  updateAssignment,
  deleteAssignment,
  getSubmissions,
  gradeSubmission,
  getAssignmentById,
} from "../controllers/assignmentController.js";

const router = express.Router();

router.use(protect);

router.post("/", teacherOnly, createAssignment);
router.get("/class/:classId", getAssignmentsByClass);
router.put("/:id", teacherOnly, updateAssignment);
router.delete("/:id", teacherOnly, deleteAssignment);

router.get("/:id/submissions", teacherOnly, getSubmissions);
router.put("/:id/submissions/:submissionId/grade", teacherOnly, gradeSubmission);

router.get("/:id", studentOnly, getAssignmentById);

export default router;
