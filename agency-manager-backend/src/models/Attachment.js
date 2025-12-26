const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    cloudinaryId: {
      type: String
    },
    size: {
      type: Number
    },
    mimeType: {
      type: String
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Attachment || mongoose.model("Attachment", attachmentSchema);