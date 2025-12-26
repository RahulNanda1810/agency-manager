const mongoose = require("mongoose");

const accessRequestSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    respondedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

accessRequestSchema.index({ orgId: 1, userId: 1 }, { unique: true });
accessRequestSchema.index({ status: 1 });

module.exports =
  mongoose.models.AccessRequest ||
  mongoose.model("AccessRequest", accessRequestSchema);
