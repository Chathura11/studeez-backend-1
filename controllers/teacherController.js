import Class from "../models/class.js";
import { assertTeacherOwnsClass } from "../utils/ownership.js";

// GET /api/teacher/classes - my classes
export const getMyClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user.id })
      .populate("subject", "name")
      .populate("students", "name email")
      .sort({ createdAt: -1 });
    res.json(classes);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/teacher/classes/:id/requests - pending requests
export const getPendingRequests = async (req, res) => {
  try {
    await assertTeacherOwnsClass(req.user.id, req.params.id);
    const cls = await Class.findById(req.params.id)
      .populate("studentRequests", "name email");
    res.json(cls?.studentRequests || []);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// PUT /api/teacher/classes/:id/requests/approve  { studentId }
export const approveStudentRequest = async (req, res) => {
  try {
    const { studentId } = req.body;
    const cls = await assertTeacherOwnsClass(req.user.id, req.params.id);
    const found = cls.studentRequests.find((s) => s.toString() === studentId);
    if (!found) return res.status(400).json({ message: "Student has not requested this class" });

    cls.studentRequests = cls.studentRequests.filter((s) => s.toString() !== studentId);
    if (!cls.students.find((s) => s.toString() === studentId)) {
      cls.students.push(studentId);
    }
    await cls.save();
    res.json({ message: "Student approved", classId: cls.id, studentId });
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// DELETE /api/teacher/classes/:id/requests/:studentId
export const removeStudentRequest = async (req, res) => {
  try {
    const { studentId } = req.params; // from URL param
    const cls = await assertTeacherOwnsClass(req.user.id, req.params.id);

    const found = cls.studentRequests.find((s) => s.toString() === studentId);
    if (!found) {
      return res.status(400).json({ message: "Student has not requested this class" });
    }

    // Remove the student from requests
    cls.studentRequests = cls.studentRequests.filter(
      (s) => s.toString() !== studentId
    );
    await cls.save();

    res.json({ message: "Student request removed", classId: cls.id, studentId });
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// PUT /api/teacher/classes/:id/students/remove  { studentId }
export const removeStudentFromClass = async (req, res) => {
  try {
    const { studentId } = req.body;
    const cls = await assertTeacherOwnsClass(req.user.id, req.params.id);
    cls.students = cls.students.filter((s) => s.toString() !== studentId);
    await cls.save();
    res.json({ message: "Student removed", classId: cls.id, studentId });
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// GET /api/teacher/schedule - list of classes (simple schedule)
export const getMySchedule = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user.id })
      .populate("subject", "name grade")
      .select("name grade subject createdAt isActive");
    res.json(classes);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
