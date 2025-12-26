// agency-manager-backend/src/controllers/task.controller.js
const Task = require("../models/Task");
const Project = require("../models/Project");

/**
 * CREATE task
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, dueDate, status, assignee, assigneeId, sprintId } = req.body;

    console.log('📝 Creating task with data:', { title, projectId, status, assignee, assigneeId, sprintId });

    if (!title || !projectId) {
      return res.status(400).json({ message: "Title and projectId are required" });
    }

    // Find the project first
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is a member of the project's organization
    const OrgMembership = require("../models/Orgmembership");
    const membership = await OrgMembership.findOne({ 
      userId: req.user._id, 
      orgId: project.orgId 
    });

    if (!membership) {
      return res.status(403).json({ 
        message: "You are not a member of the organization this project belongs to" 
      });
    }

    // Create task with new fields
    const taskData = {
      title,
      projectId,
      orgId: project.orgId, // Use project's orgId
      status: status || 'todo',
      reporterId: req.user._id || null  // Ensure we always set reporterId
    };

    // Add optional fields if provided
    if (description) taskData.description = description;
    if (dueDate) taskData.dueDate = dueDate;
    if (assignee) taskData.assignee = assignee;
    if (assigneeId) taskData.assigneeId = assigneeId;
    if (sprintId) taskData.sprintId = sprintId;

    console.log('💾 Saving task:', taskData);

    const task = await Task.create(taskData);

    console.log('✅ Task created successfully:', task._id);

    res.status(201).json(task);
  } catch (error) {
    console.error('❌ Create task error:', error);
    res.status(500).json({ message: error.message || "Failed to create task" });
  }
};
/**
 * UPDATE task
 */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log('📝 Updating task:', id, 'with data:', updates);

    // Find the task first
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is a member of the task's organization
    const OrgMembership = require("../models/Orgmembership");
    const membership = await OrgMembership.findOne({ 
      userId: req.user._id, 
      orgId: task.orgId 
    });

    if (!membership) {
      return res.status(403).json({ 
        message: "You are not a member of the organization this task belongs to" 
      });
    }

    console.log('📋 Current task data:', { _id: task._id, sprintId: task.sprintId });

    // Update allowed fields
    const allowedFields = ['title', 'description', 'status', 'dueDate', 'assignee', 'assigneeId', 'priority', 'storyPoints', 'type', 'labels', 'sprintId'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        task[field] = updates[field];
      }
    });

    await task.save();

    console.log('✅ Task updated successfully:', { _id: task._id, sprintId: task.sprintId });

    res.json(task);
  } catch (error) {
    console.error('❌ Update task error:', error);
    res.status(500).json({ message: error.message || "Failed to update task" });
  }
};

/**
 * GET tasks (by org or project)
 */
exports.getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
      
      // Verify user has access to this project's org
      const project = await Project.findById(req.query.projectId);
      if (project) {
        const OrgMembership = require("../models/Orgmembership");
        const membership = await OrgMembership.findOne({ 
          userId: req.user._id, 
          orgId: project.orgId 
        });
        
        if (!membership) {
          return res.status(403).json({ 
            message: "You are not a member of this project's organization" 
          });
        }
        
        filter.orgId = project.orgId;
      }
    } else {
      // If no projectId, get tasks from all orgs the user is a member of
      const OrgMembership = require("../models/Orgmembership");
      const memberships = await OrgMembership.find({ userId: req.user._id });
      const orgIds = memberships.map(m => m.orgId);
      filter.orgId = { $in: orgIds };
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.assigneeId) {
      filter.assigneeId = req.query.assigneeId;
    }

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: "Failed to retrieve tasks" });
  }
};

/**
 * GET single task
 */
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      _id: id,
      orgId: req.user.activeOrg
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: "Failed to retrieve task" });
  }
};

/**
 * DELETE task
 */
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({
      _id: id,
      orgId: req.user.activeOrg
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: "Failed to delete task" });
  }
};