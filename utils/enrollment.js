// utils/enrollment.js
import Class from "../models/class.js";

export async function assertStudentEnrolled(studentId, classId) {
  const cls = await Class.findById(classId).select("students isActive");
  if (!cls) {
    const err = new Error("Class not found");
    err.status = 404;
    throw err;
  }
  if (!cls.isActive) {
    const err = new Error("Class is inactive");
    err.status = 403;
    throw err;
  }
  const enrolled = cls.students.some((s) => s.toString() === studentId.toString());
  if (!enrolled) {
    const err = new Error("You are not enrolled in this class");
    err.status = 403;
    throw err;
  }
  return cls;
}
