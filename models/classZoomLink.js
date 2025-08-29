import mongoose from "mongoose";

const classZoomLinkSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    date: { type: Date, required: true }, // ✅ Specific date for session
    zoomLink: { type: String, required: true },
    status: { type: String, enum: ["upcoming", "ongoing", "completed"], default: "upcoming" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Teacher
  },
  { timestamps: true }
);

export default mongoose.model("ClassZoomLink", classZoomLinkSchema);
