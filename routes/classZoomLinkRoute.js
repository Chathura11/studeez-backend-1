import express from "express";
import {
  addZoomLink,
  getZoomLinks,
  getTodayZoomLink,
  deleteZoomLink,
  updateZoomLinkStatus,
} from "../controllers/classZoomLinkController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Teacher adds/updates Zoom link for a specific date
router.post("/:classId/zoom-link", protect, addZoomLink);

// Get all Zoom links for a class
router.get("/:classId/zoom-links", protect, getZoomLinks);

// Get today's Zoom link
router.get("/:classId/zoom-link/today", protect, getTodayZoomLink);

// Teacher deletes a Zoom link
router.delete("/zoom-link/:linkId", protect, deleteZoomLink);

router.patch("/:linkId/status", protect, updateZoomLinkStatus);

export default router;
