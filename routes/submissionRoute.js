// routes/submission.routes.js
import express from "express";
import { protect, studentOnly } from "../middleware/authMiddleware.js";
import {
  createOrUpdateSubmission,
  getMySubmissionForAssignment,
  getAssignmentsForStudentByClass,
} from "../controllers/submissionController.js";

const router = express.Router();

// student-protected routes
router.use(protect, studentOnly);

// submit or resubmit
router.post("/", createOrUpdateSubmission);

// my submission for an assignment
router.get("/assignment/:assignmentId/me", getMySubmissionForAssignment);

// all assignments for a class I'm enrolled in
router.get("/student/classes/:classId/assignments", getAssignmentsForStudentByClass);

export default router;
