import express from "express";
import { protect, teacherOnly } from "../middleware/authMiddleware.js";
import {
  getMyClasses,
  getPendingRequests,
  approveStudentRequest,
  removeStudentFromClass,
  getMySchedule,
  removeStudentRequest,
} from "../controllers/teacherController.js";

const router = express.Router();

router.use(protect, teacherOnly);

router.get("/classes", getMyClasses);
router.get("/schedule", getMySchedule);

router.get("/classes/:id/requests", getPendingRequests);
router.put("/classes/:id/requests/approve", approveStudentRequest);
router.delete("/classes/:id/requests/:studentId",removeStudentRequest);
router.put("/classes/:id/students/remove", removeStudentFromClass);

export default router;
