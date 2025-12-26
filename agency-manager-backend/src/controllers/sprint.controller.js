// agency-manager-backend/src/controllers/sprint.controller.js
const Sprint = require("../models/Sprint");
const Task = require("../models/Task");

exports.createSprint = async (req, res) => {
  try {
    const { name, goal, startDate, endDate } = req.body;
    const { projectId } = req.params;
    const orgId = req.user.activeOrg;

    console.log('📝 Creating sprint:', { name, goal, startDate, endDate, projectId, orgId });

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: "Name, startDate, and endDate are required" });
    }

    const sprint = await Sprint.create({
      name,
      goal,
      projectId,
      orgId,
      startDate,
      endDate,
      status: "planned"
    });

    console.log('✅ Sprint created:', sprint._id);
    res.status(201).json(sprint);
  } catch (error) {
    console.error('❌ Sprint creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSprints = async (req, res) => {
  try {
    const { projectId } = req.params;
    const sprints = await Sprint.find({ projectId }).sort({ createdAt: -1 });
    res.json(sprints);
  } catch (error) {
    console.error('❌ Get sprints error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.startSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const sprint = await Sprint.findByIdAndUpdate(
      sprintId,
      { status: "active" },
      { new: true }
    );
    
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    
    res.json(sprint);
  } catch (error) {
    console.error('❌ Start sprint error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.completeSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;
    
    // Calculate velocity (completed story points)
    const completedTasks = await Task.find({ 
      sprintId, 
      status: "done" 
    });
    const velocity = completedTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    
    // Move incomplete tasks to backlog
    await Task.updateMany(
      { sprintId, status: { $ne: "done" } },
      { $unset: { sprintId: "" }, status: "backlog" }
    );

    const sprint = await Sprint.findByIdAndUpdate(
      sprintId,
      { status: "completed", velocity },
      { new: true }
    );

    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    res.json(sprint);
  } catch (error) {
    console.error('❌ Complete sprint error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSprintBoard = async (req, res) => {
  try {
    const { sprintId } = req.params;
    
    const tasks = await Task.find({ sprintId })
      .populate("assigneeId", "name email")
      .populate("reporterId", "name email")
      .sort({ orderIndex: 1 });

    const board = {
      backlog: tasks.filter(t => t.status === "backlog"),
      todo: tasks.filter(t => t.status === "todo"),
      "in-progress": tasks.filter(t => t.status === "in-progress"),
      "in-review": tasks.filter(t => t.status === "in-review"),
      done: tasks.filter(t => t.status === "done")
    };

    res.json(board);
  } catch (error) {
    console.error('❌ Get sprint board error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.addTaskToSprint = async (req, res) => {
  try {
    const { sprintId, taskId } = req.params;
    
    const task = await Task.findByIdAndUpdate(
      taskId,
      { sprintId, status: "todo" },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error('❌ Add task to sprint error:', error);
    res.status(500).json({ message: error.message });
  }
};