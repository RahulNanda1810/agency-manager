// agency-manager-backend/src/models/TaskHistory.js
const mongoose = require("mongoose");

const taskHistorySchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: ["created", "updated", "deleted", "commented", "status_changed", "assigned", "attachment_added"]
    },
    field: String,
    oldValue: String,
    newValue: String,
    description: String
  },
  { timestamps: true }
);

taskHistorySchema.index({ taskId: 1, createdAt: -1 });

module.exports = mongoose.models.TaskHistory || mongoose.model("TaskHistory", taskHistorySchema);