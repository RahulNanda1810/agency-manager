const cron = require("node-cron");
const { runDailySummaryJob } = require("./controllers/daily-summary.controller");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily org summary job...");
  await runDailySummaryJob();
  console.log("Daily org summary job complete.");
});
