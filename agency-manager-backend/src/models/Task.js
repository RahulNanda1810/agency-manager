// agency-manager-backend/src/models/Task.js
const mongoose = require("mongoose");

// Delete existing model if it exists (clears cache)
if (mongoose.models.Task) {
  delete mongoose.models.Task;
  delete mongoose.modelSchemas.Task;
}

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
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
    status: {
      type: String,
      enum: ["backlog", "todo", "in-progress", "in-review", "done"],
      default: "todo"
    },
    // NEW JIRA-LIKE FIELDS
    type: {
      type: String,
      enum: ["story", "task", "bug", "epic", "subtask"],
      default: "task"
    },
    priority: {
      type: String,
      enum: ["lowest", "low", "medium", "high", "highest"],
      default: "medium"
    },
    storyPoints: {
      type: Number,
      min: 0,
      max: 100
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    assignee: {
      type: String,
      trim: true
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
      // NOT REQUIRED - can be null
    },
    watchers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    labels: [String],
    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint"
    },
    parentTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    },
    dueDate: {
      type: Date
    },
    estimatedHours: Number,
    actualHours: Number,
    orderIndex: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

taskSchema.index({ projectId: 1, sprintId: 1, status: 1 });
taskSchema.index({ assigneeId: 1 });
taskSchema.index({ orderIndex: 1 });

module.exports = mongoose.model("Task", taskSchema);