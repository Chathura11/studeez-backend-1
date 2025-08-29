import Attendance from "../models/attendance.js";
import { assertTeacherOwnsClass } from "../utils/ownership.js";

// POST /api/attendance/mark
// { classId, date, entries: [{ student, status, note }] }
export const markAttendance = async (req, res) => {
  try {
    const { classId, date, entries } = req.body;
    await assertTeacherOwnsClass(req.user.id, classId);

    const d0 = new Date(date);
    d0.setHours(0,0,0,0);

    const att = await Attendance.findOneAndUpdate(
      { class: classId, date: d0 },
      { class: classId, date: d0, markedBy: req.user.id, entries },
      { upsert: true, new: true }
    );

    res.status(201).json(att);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// GET /api/attendance/class/:classId?date=YYYY-MM-DD
export const getAttendanceByClassAndDate = async (req, res) => {
  try {
    const { classId } = req.params;
    await assertTeacherOwnsClass(req.user.id, classId);

    if (!req.query.date) return res.status(400).json({ message: "date query is required" });
    const d0 = new Date(req.query.date);
    d0.setHours(0,0,0,0);

    const att = await Attendance.findOne({ class: classId, date: d0 }).populate("entries.student", "name email");
    res.json(att || { class: classId, date: d0, entries: [] });
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};
