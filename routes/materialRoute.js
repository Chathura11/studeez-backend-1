import express from "express";
import { protect, teacherOnly } from "../middleware/authMiddleware.js";
import {
  createMaterial,
  getMaterialsByClass,
  deleteMaterial,
} from "../controllers/materialController.js";

const router = express.Router();

router.use(protect);

router.post("/", teacherOnly, createMaterial);
router.get("/class/:classId", getMaterialsByClass);
router.delete("/:id", teacherOnly, deleteMaterial);

export default router;
