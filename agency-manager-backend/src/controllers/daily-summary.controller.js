const DailyOrgSummary = require("../models/DailyOrgSummary");
const Task = require("../models/Task");
const Organization = require("../models/Organization");

exports.runDailySummaryJob = async () => {
  const orgs = await Organization.find();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const org of orgs) {
    const overdueCount = await Task.countDocuments({
      orgId: org._id,
      dueDate: { $lt: today },
      status: { $ne: "completed" }
    });
    await DailyOrgSummary.create({
      orgId: org._id,
      date: today,
      overdueTaskCount: overdueCount
    });
  }
};

exports.getOrgSummaries = async (req, res) => {
  try {
    const orgId = req.params.orgId;
    const summaries = await DailyOrgSummary.find({ orgId }).sort({ date: -1 });
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch summaries" });
  }
};
