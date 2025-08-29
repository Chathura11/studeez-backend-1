import express from "express";
import { protect, teacherOnly } from "../middleware/authMiddleware.js";
import {
  markAttendance,
  getAttendanceByClassAndDate,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.use(protect, teacherOnly);

router.post("/mark", markAttendance);
router.get("/class/:classId", getAttendanceByClassAndDate);

export default router;
