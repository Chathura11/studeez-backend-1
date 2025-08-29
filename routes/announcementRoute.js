import express from "express";
import { protect, teacherOnly } from "../middleware/authMiddleware.js";
import {
  createAnnouncement,
  getAnnouncementsByClass,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

const router = express.Router();

// router.use(protect, teacherOnly);

router.post("/",protect,teacherOnly, createAnnouncement);
router.get("/class/:classId", protect,getAnnouncementsByClass);
router.put("/:id",protect,teacherOnly, updateAnnouncement);
router.delete("/:id",protect,teacherOnly, deleteAnnouncement);

export default router;
