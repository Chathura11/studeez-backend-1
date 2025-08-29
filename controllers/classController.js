import User from "../models/user.js";
import Class from "../models/class.js";
import Subject from "../models/subject.js";

// Create a new class (Admin)
export const createClass = async (req, res) => {
  try {
    const { name, grade, subjectId, teacherId,imageUrl } = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher")
      return res.status(400).json({ message: "Invalid teacher" });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(400).json({ message: "Invalid subject" });

    const newClass = await Class.create({
      name,
      grade,
      subject: subjectId,
      teacher: teacherId,
      imageUrl
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all classes
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("teacher", "name")
      .populate("subject", "name")
      .populate("students", "name");
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student requests to join a class
export const requestClassAccess = async (req, res) => {
  try {
    const classId = req.params.id;
    const studentId = req.user._id;

    const classObj = await Class.findById(classId);
    if (!classObj) return res.status(404).json({ message: "Class not found" });

    if (
      classObj.students.includes(studentId) ||
      classObj.studentRequests.includes(studentId)
    )
      return res
        .status(400)
        .json({ message: "Already joined or requested this class" });

    classObj.studentRequests.push(studentId);
    await classObj.save();

    res.json({ message: "Request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const classroom = await Class.findOne({_id:req.params.id});
    if (!classroom) return res.status(404).json({ message: "Class not found" });

    classroom.isActive = !classroom.isActive;
    await classroom.save();

    res.status(200).json({
      message: `Class has been ${classroom.isActive ? "Active" : "Inactive"}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

// Admin approves student request
export const approveStudent = async (req, res) => {
  try {
    const classId = req.params.id;
    const { studentId } = req.body;

    const classObj = await Class.findById(classId);
    if (!classObj) return res.status(404).json({ message: "Class not found" });

    if (!classObj.studentRequests.includes(studentId))
      return res
        .status(400)
        .json({ message: "Student did not request this class" });

    classObj.studentRequests = classObj.studentRequests.filter(
      (id) => id.toString() !== studentId
    );
    if (!classObj.students.includes(studentId)) {
      classObj.students.push(studentId);
    }

    await classObj.save();

    res.json({ message: "Student approved successfully", classObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate("subject", "name")
      .populate("teacher", "name");

    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch class" });
  }
};
