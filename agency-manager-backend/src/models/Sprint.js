// agency-manager-backend/src/models/Sprint.js
const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    goal: {
      type: String,
      trim: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["planned", "active", "completed"],
      default: "planned"
    },
    velocity: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

sprintSchema.index({ projectId: 1, status: 1 });

module.exports = mongoose.models.Sprint || mongoose.model("Sprint", sprintSchema);