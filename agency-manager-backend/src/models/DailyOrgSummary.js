const mongoose = require("mongoose");

const dailyOrgSummarySchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  date: { type: Date, required: true },
  overdueTaskCount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.DailyOrgSummary || mongoose.model("DailyOrgSummary", dailyOrgSummarySchema);
