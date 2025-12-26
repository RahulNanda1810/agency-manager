const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const reportController = require("../controllers/report.controller");

router.get("/:orgId/overview", authMiddleware, reportController.getOrgReport);

module.exports = router;
