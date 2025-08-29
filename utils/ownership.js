import Class from "../models/class.js";

/** Ensures req.user is the teacher assigned to the class */
export async function assertTeacherOwnsClass(teacherId, classId) {
  const cls = await Class.findById(classId);
  if (!cls) throw new Error("Class not found");
  if (cls.teacher.toString() !== teacherId.toString()) {
    const err = new Error("Not authorized to modify this class");
    err.status = 403;
    throw err;
  }
  return cls;
}


export async function assertStudentOwnsClass(studentId, classId) {
  const cls = await Class.findById(classId);
  if (!cls) throw new Error("Class not found");
  if (!cls.students.includes(studentId)) {
    const err = new Error("Not authorized!");
    err.status = 403;
    throw err;
  }
  return cls;
}
