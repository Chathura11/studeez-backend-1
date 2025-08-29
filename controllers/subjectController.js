import Subject from "../models/subject.js";

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private (Admin)
export const createSubject = async (req, res) => {
  try {
    const { name, description } = req.body;

    // check if already exists
    const subjectExists = await Subject.findOne({ name });
    if (subjectExists) {
      return res.status(400).json({ message: "Subject already exists" });
    }

    const subject = await Subject.create({ name, description });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a subject by ID
// @route   GET /api/subjects/:id
// @access  Public
export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin)
export const updateSubject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    subject.name = name || subject.name;
    subject.description = description || subject.description;

    const updatedSubject = await subject.save();
    res.json(updatedSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin)
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await subject.deleteOne();
    res.json({ message: "Subject removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const subject = await Subject.findOne({_id:req.params.id});
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    subject.isActive = !subject.isActive;
    await subject.save();

    res.status(200).json({
      message: `Class has been ${subject.isActive ? "Active" : "Inactive"}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

