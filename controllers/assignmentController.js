import Assignment from "../models/assignment.js";
import Submission from "../models/submission.js";
import { assertStudentEnrolled } from "../utils/enrollment.js";
import { assertStudentOwnsClass, assertTeacherOwnsClass } from "../utils/ownership.js";

// POST /api/assignments
export const createAssignment = async (req, res) => {
  try {
    const { classId, title, instructions, attachments, dueAt } = req.body;
    await assertTeacherOwnsClass(req.user.id, classId);

    const assignment = await Assignment.create({
      class: classId,
      title,
      instructions,
      attachments,
      dueAt,
      createdBy: req.user.id,
    });
    res.status(201).json(assignment);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// GET /api/assignments/class/:classId
export const getAssignmentsByClass = async (req, res) => {
  try {
    if(req.user.role == "teacher"){
      await assertTeacherOwnsClass(req.user.id, req.params.classId);
    }else{
      await assertStudentOwnsClass(req.user.id, req.params.classId);
    }

    const list = await Assignment.find({ class: req.params.classId })
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// PUT /api/assignments/:id
export const updateAssignment = async (req, res) => {
  try {
    const { title, instructions, attachments, dueAt, isActive } = req.body;
    const asg = await Assignment.findById(req.params.id);
    if (!asg) return res.status(404).json({ message: "Assignment not found" });

    await assertTeacherOwnsClass(req.user.id, asg.class);

    if (title !== undefined) asg.title = title;
    if (instructions !== undefined) asg.instructions = instructions;
    if (attachments !== undefined) asg.attachments = attachments;
    if (dueAt !== undefined) asg.dueAt = dueAt;
    if (isActive !== undefined) asg.isActive = !!isActive;

    await asg.save();
    res.json(asg);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// DELETE /api/assignments/:id
export const deleteAssignment = async (req, res) => {
  try {
    const asg = await Assignment.findById(req.params.id);
    if (!asg) return res.status(404).json({ message: "Assignment not found" });
    await assertTeacherOwnsClass(req.user.id, asg.class);
    await Submission.deleteMany({ assignment: asg.id });
    await asg.deleteOne();
    res.json({ message: "Assignment & submissions deleted" });
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// ---------- Submissions (teacher view/grading) ----------

// GET /api/assignments/:id/submissions
export const getSubmissions = async (req, res) => {
  try {
    const asg = await Assignment.findById(req.params.id);
    if (!asg) return res.status(404).json({ message: "Assignment not found" });
    await assertTeacherOwnsClass(req.user.id, asg.class);

    const list = await Submission.find({ assignment: asg.id })
      .populate("student", "name email")
      .sort({ submittedAt: -1 });

    res.json(list);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// PUT /api/assignments/:id/submissions/:submissionId/grade
export const gradeSubmission = async (req, res) => {
  try {
    const asg = await Assignment.findById(req.params.id);
    if (!asg) return res.status(404).json({ message: "Assignment not found" });
    await assertTeacherOwnsClass(req.user.id, asg.class);

    const { score, feedback } = req.body;
    const sub = await Submission.findById(req.params.submissionId);
    if (!sub || sub.assignment.toString() !== asg.id.toString()) {
      return res.status(404).json({ message: "Submission not found" });
    }

    sub.grade = {
      score,
      feedback,
      gradedAt: new Date(),
      gradedBy: req.user.id,
    };
    await sub.save();

    res.json({ message: "Submission graded", submission: sub });
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};


export const getAssignmentById = async (req, res) => {
  try {
    const ass = await Assignment.findById(req.params.id)
    if (!ass) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    await assertStudentEnrolled(req.user.id, ass.class);

    res.json(ass);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Assignment" });
  }
};

