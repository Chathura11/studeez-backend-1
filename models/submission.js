import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    files: [{ type: String }], // URLs to submitted files
    textAnswer: { type: String },
    grade: {
      score: { type: Number },
      feedback: { type: String },
      gradedAt: { type: Date },
      gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // teacher
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
