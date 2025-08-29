import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    date: { type: Date, required: true }, // normalized to 00:00
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // teacher
    entries: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ["present", "absent", "late", "excused"], default: "present" },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

attendanceSchema.index({ class: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
