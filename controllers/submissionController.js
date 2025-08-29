// controllers/submission.controller.js
import Submission from "../models/submission.js";
import Assignment from "../models/assignment.js";
import { assertStudentEnrolled } from "../utils/enrollment.js";

// POST /api/submissions
// body: { assignmentId, files?:[], textAnswer?: string }
export const createOrUpdateSubmission = async (req, res) => {
  try {
    const { assignmentId, files, textAnswer = "" } = req.body;

    const asg = await Assignment.findById(assignmentId).select("class dueAt isActive");
    if (!asg) return res.status(404).json({ message: "Assignment not found" });
    if (!asg.isActive) return res.status(403).json({ message: "Assignment is not accepting submissions" });

    await assertStudentEnrolled(req.user.id, asg.class);

    const now = new Date();
    // optional: forbid after dueAt
    // if (now > new Date(asg.dueAt)) return res.status(400).json({ message: "Past due date" });

    const submission = await Submission.findOneAndUpdate(
      { assignment: assignmentId, student: req.user.id },
      { assignment: assignmentId, student: req.user.id, files, textAnswer, submittedAt: now },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(submission);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// GET /api/submissions/assignment/:assignmentId/me
export const getMySubmissionForAssignment = async (req, res) => {
  try {
    const asg = await Assignment.findById(req.params.assignmentId).select("class");
    if (!asg) return res.status(404).json({ message: "Assignment not found" });

    await assertStudentEnrolled(req.user.id, asg.class);

    const sub = await Submission.findOne({
      assignment: req.params.assignmentId,
      student: req.user.id,
    });

    res.json(sub || null);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// GET /api/student/classes/:classId/assignments
export const getAssignmentsForStudentByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    await assertStudentEnrolled(req.user.id, classId);

    const assignments = await Assignment.find({ class: classId, isActive: true })
      .select("title instructions dueAt createdAt")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};
