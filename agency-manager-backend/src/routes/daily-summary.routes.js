const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const dailySummaryController = require("../controllers/daily-summary.controller");

router.get("/:orgId/summaries", authMiddleware, dailySummaryController.getOrgSummaries);

module.exports = router;
