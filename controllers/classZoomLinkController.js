import Class from "../models/class.js";
import ClassZoomLink from "../models/classZoomLink.js";

// ✅ Add Zoom link for a date
export const addZoomLink = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date, zoomLink } = req.body;

    const classroom = await Class.findById(classId);
    if (!classroom) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Ensure only teacher can add
    if (classroom.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if already exists for this date
    const existing = await ClassZoomLink.findOne({ classId, date });
    if (existing) {
      existing.zoomLink = zoomLink;
      await existing.save();
      return res.json({ message: "Zoom link updated", zoomLink: existing });
    }

    const newLink = await ClassZoomLink.create({
      classId,
      date,
      zoomLink,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Zoom link added", zoomLink: newLink });
  } catch (error) {
    res.status(500).json({ message: "Failed to add Zoom link", error: error.message });
  }
};

// ✅ Get all Zoom links for a class
export const getZoomLinks = async (req, res) => {
  try {
    const { classId } = req.params;

    const classroom = await Class.findById(classId);
    if (!classroom) {
      return res.status(404).json({ message: "Class not found" });
    }

    const links = await ClassZoomLink.find({ classId }).sort({ date: 1 });

    res.json(links);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Zoom links", error: error.message });
  }
};

// ✅ Get today's Zoom link
export const getTodayZoomLink = async (req, res) => {
  try {
    const { classId } = req.params;
    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

    const link = await ClassZoomLink.findOne({
      classId,
      date: { $eq: today },
    });

    if (!link) {
      return res.status(404).json({ message: "No Zoom link for today" });
    }

    res.json(link);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch today's Zoom link", error: error.message });
  }
};

// ✅ Delete a Zoom link
export const deleteZoomLink = async (req, res) => {
  try {
    const { linkId } = req.params;

    const link = await ClassZoomLink.findById(linkId);
    if (!link) {
      return res.status(404).json({ message: "Zoom link not found" });
    }

    // Ensure only teacher can delete
    const classroom = await Class.findById(link.classId);
    if (classroom.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await link.deleteOne();

    res.json({ message: "Zoom link deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete Zoom link", error: error.message });
  }
};

// ✅ Update Zoom link status
export const updateZoomLinkStatus = async (req, res) => {
  try {
    const { linkId } = req.params;
    const { status } = req.body; // "upcoming" | "ongoing" | "completed"

    const link = await ClassZoomLink.findById(linkId);
    if (!link) return res.status(404).json({ message: "Zoom link not found" });

    // Only teacher can update
    const classroom = await Class.findById(link.classId);
    if (classroom.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    link.status = status;
    await link.save();

    res.json({ message: "Status updated", zoomLink: link });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};

