const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Comment || mongoose.model("Comment", commentSchema);
