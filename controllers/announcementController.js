import Announcement from "../models/announcement.js";
import { assertStudentOwnsClass, assertTeacherOwnsClass } from "../utils/ownership.js";

// POST /api/announcements
export const createAnnouncement = async (req, res) => {
  try {
    const { classId, title, message, pinned } = req.body;
    await assertTeacherOwnsClass(req.user.id, classId);

    const ann = await Announcement.create({
      class: classId,
      title,
      message,
      pinned: !!pinned,
      createdBy: req.user.id,
    });
    res.status(201).json(ann);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// GET /api/announcements/class/:classId
export const getAnnouncementsByClass = async (req, res) => {

  try {
    if(req.user.role == "teacher"){
      await assertTeacherOwnsClass(req.user.id, req.params.classId);
    }else if(req.user.role == "student"){
      await assertStudentOwnsClass(req.user.id, req.params.classId);
    }
    const list = await Announcement.find({ class: req.params.classId })
      .sort({ pinned: -1, createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// PUT /api/announcements/:id  (update pin/message/title)
export const updateAnnouncement = async (req, res) => {
  try {
    const { title, message, pinned } = req.body;
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: "Announcement not found" });

    await assertTeacherOwnsClass(req.user.id, ann.class);

    if (title !== undefined) ann.title = title;
    if (message !== undefined) ann.message = message;
    if (pinned !== undefined) ann.pinned = !!pinned;

    await ann.save();
    res.json(ann);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// DELETE /api/announcements/:id
export const deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: "Announcement not found" });
    await assertTeacherOwnsClass(req.user.id, ann.class);
    await ann.deleteOne();
    res.json({ message: "Announcement deleted" });
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};
