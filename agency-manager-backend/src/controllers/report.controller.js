const Project = require("../models/Project");
const Task = require("../models/Task");
const OrgMembership = require("../models/Orgmembership");
const mongoose = require("mongoose");

exports.getOrgReport = async (req, res) => {
  try {
    const orgId = req.params.orgId;
    // Ensure user is member of org
    const membership = await OrgMembership.findOne({ orgId, userId: req.user._id });
    if (!membership) return res.status(403).json({ message: "Access denied" });

    // Project counts by status
    const projectStatusCounts = await Project.aggregate([
      { $match: { orgId: new mongoose.Types.ObjectId(orgId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Task counts by status
    const taskStatusCounts = await Task.aggregate([
      { $match: { orgId: new mongoose.Types.ObjectId(orgId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Tasks grouped by assignee
    const tasksByAssignee = await Task.aggregate([
      { $match: { orgId: new mongoose.Types.ObjectId(orgId) } },
      { $group: { _id: "$assignee", tasks: { $push: "$title" }, count: { $sum: 1 } } }
    ]);

    // Overdue task counts
    const overdueTasks = await Task.countDocuments({
      orgId,
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" }
    });

    res.json({
      projectStatusCounts,
      taskStatusCounts,
      tasksByAssignee,
      overdueTasks
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch report" });
  }
};
