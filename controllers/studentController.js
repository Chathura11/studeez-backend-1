import Class from "../models/class.js";

export const getMyClasses = async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user._id })
      .populate("subject", "name")
      .populate("teacher", "name email");

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enrolled classes" });
  }
};
