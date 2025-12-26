// agency-manager-backend/src/routes/sprint.routes.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const sprintController = require("../controllers/sprint.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.post("/", sprintController.createSprint);
router.get("/", sprintController.getSprints);
router.patch("/:sprintId/start", sprintController.startSprint);
router.patch("/:sprintId/complete", sprintController.completeSprint);
router.get("/:sprintId/board", sprintController.getSprintBoard);
router.patch("/:sprintId/tasks/:taskId", sprintController.addTaskToSprint);

module.exports = router;