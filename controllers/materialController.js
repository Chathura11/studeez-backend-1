import Material from "../models/material.js";
import { assertStudentOwnsClass, assertTeacherOwnsClass } from "../utils/ownership.js";

// POST /api/materials
export const createMaterial = async (req, res) => {
  try {
    const { classId, title, description, fileUrl, links } = req.body;
    await assertTeacherOwnsClass(req.user.id, classId);

    const material = await Material.create({
      class: classId,
      title,
      description,
      fileUrl,
      links,
      createdBy: req.user.id,
    });
    res.status(201).json(material);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// GET /api/materials/class/:classId
export const getMaterialsByClass = async (req, res) => {
  try {
    if(req.user.role == "teacher"){
      await assertTeacherOwnsClass(req.user.id, req.params.classId);
    }else{
      await assertStudentOwnsClass(req.user.id, req.params.classId);
    }
    
    const list = await Material.find({ class: req.params.classId })
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

// DELETE /api/materials/:id
export const deleteMaterial = async (req, res) => {
  try {
    const mat = await Material.findById(req.params.id);
    if (!mat) return res.status(404).json({ message: "Material not found" });

    await assertTeacherOwnsClass(req.user.id, mat.class);
    await mat.deleteOne();
    res.json({ message: "Material deleted" });
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};
