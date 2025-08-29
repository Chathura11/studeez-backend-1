import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    fileUrl: { type: String }, // optional single file/link
    links: [{ type: String }],  // optional multiple links
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // teacher
  },
  { timestamps: true }
);

const Material = mongoose.model("Material", materialSchema);
export default Material;
