const Task = require('../models/Task');
const Project = require('../models/Project');
const Client = require('../models/Client');
const Organization = require('../models/Organization');
const OrgMembership = require('../models/Orgmembership');

// Get all tasks assigned to the current user
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('🔍 Fetching tasks for user:', { userId, userEmail: req.user.email });

    // Get all organizations the user is a member of
    const memberships = await OrgMembership.find({ userId });
    const memberOrgIds = memberships.map(m => m.orgId.toString());
    console.log('👥 User is member of orgs:', memberOrgIds);

    // Find all tasks assigned to this user
    const tasks = await Task.find({ assigneeId: userId })
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });
    
    console.log('📋 Found tasks for this user:', tasks.length);
    if (tasks.length > 0) {
      console.log('📋 Sample task assigneeIds:', tasks.slice(0, 3).map(t => ({ title: t.title, assigneeId: t.assigneeId })));
    }

    // Enrich tasks with client and org information, filtering out deleted orgs
    const enrichedTasks = await Promise.all(tasks.map(async (task) => {
      const project = await Project.findById(task.projectId).populate('clientId');
      const client = project ? await Client.findById(project.clientId) : null;
      const org = client && client.orgId ? await Organization.findById(client.orgId) : null;

      // Skip tasks from organizations that no longer exist or user is no longer a member of
      if (!org || !memberOrgIds.includes(org._id.toString())) {
        return null;
      }

      return {
        _id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.projectId?._id,
        projectName: project?.name || 'Unknown Project',
        clientId: client?._id,
        clientName: client?.name || 'Unknown Client',
        orgId: client?.orgId || null,
        orgName: org?.name || 'Unknown Organization',
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    }));

    // Filter out null values (deleted orgs)
    const validTasks = enrichedTasks.filter(task => task !== null);
    console.log('✅ Valid tasks after filtering:', validTasks.length);

    res.json(validTasks);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

// Get task statistics for dashboard
exports.getTaskStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const tasks = await Task.find({ assigneeId: userId });

    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      inReview: tasks.filter(t => t.status === 'in-review').length,
      done: tasks.filter(t => t.status === 'done').length,
      overdue: tasks.filter(t => {
        if (!t.dueDate || t.status === 'done') return false;
        return new Date(t.dueDate) < new Date();
      }).length
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};
