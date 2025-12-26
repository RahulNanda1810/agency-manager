const Comment = require("../models/Comment");

exports.addComment = async (req, res) => {
  try {
    const { text, projectId, taskId } = req.body;
    if (!text || (!projectId && !taskId)) {
      return res.status(400).json({ message: "Text and projectId or taskId required" });
    }
    const comment = await Comment.create({
      text,
      userId: req.user._id,
      orgId: req.user.activeOrg,
      projectId,
      taskId
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { projectId, taskId } = req.query;
    const filter = { orgId: req.user.activeOrg };
    if (projectId) filter.projectId = projectId;
    if (taskId) filter.taskId = taskId;
    const comments = await Comment.find(filter).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};
