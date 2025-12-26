const Project = require("../models/Project");
const Client = require("../models/Client");
const Task = require("../models/Task");

/**
 * CREATE project
 */
exports.createProject = async (req, res) => {
  try {
    const { name, description, clientId } = req.body;

    console.log('🚀 Creating project:', { name, clientId, activeOrg: req.user.activeOrg, userId: req.user._id });

    if (!name || !clientId) {
      return res.status(400).json({ message: "Name and clientId are required" });
    }

    // Find the client first
    const client = await Client.findById(clientId);
    
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Check if user is a member of the client's organization
    const OrgMembership = require("../models/Orgmembership");
    const membership = await OrgMembership.findOne({ 
      userId: req.user._id, 
      orgId: client.orgId 
    });

    if (!membership) {
      return res.status(403).json({ 
        message: "You are not a member of the organization this client belongs to" 
      });
    }

    console.log('✅ User is member of client org:', { 
      clientId, 
      clientOrgId: client.orgId.toString(),
      userId: req.user._id.toString()
    });

    const project = await Project.create({
      name,
      description,
      clientId,
      orgId: client.orgId // Use the client's orgId instead of activeOrg
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create project" });
  }
};

/**
 * GET all projects
 */
exports.getProjects = async (req, res) => {
  try {
    const filter = {};

    if (req.query.clientId) {
      filter.clientId = req.query.clientId;
      
      // If filtering by clientId, verify the client's org matches user membership
      const Client = require("../models/Client");
      const client = await Client.findById(req.query.clientId);
      
      if (client) {
        const OrgMembership = require("../models/Orgmembership");
        const membership = await OrgMembership.findOne({ 
          userId: req.user._id, 
          orgId: client.orgId 
        });
        
        if (!membership) {
          return res.status(403).json({ 
            message: "You are not a member of this client's organization" 
          });
        }
        
        filter.orgId = client.orgId;
      }
    } else {
      // If no clientId, get projects from all orgs the user is a member of
      const OrgMembership = require("../models/Orgmembership");
      const memberships = await OrgMembership.find({ userId: req.user._id });
      const orgIds = memberships.map(m => m.orgId);
      filter.orgId = { $in: orgIds };
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 });
    
    // Calculate status based on tasks
    const projectsWithStatus = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ projectId: project._id });
      
      let computedStatus = 'active';
      if (tasks.length > 0) {
        const allCompleted = tasks.every(task => task.status === 'done');
        computedStatus = allCompleted ? 'completed' : 'active';
      }
      
      return {
        ...project.toObject(),
        status: computedStatus
      };
    }));
    
    res.json(projectsWithStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

/**
 * GET single project
 */
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      orgId: req.user.activeOrg
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch project" });
  }
};

/**
 * UPDATE project
 */
exports.updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        orgId: req.user.activeOrg
      },
      { name, description, status },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update project" });
  }
};

/**
 * DELETE project
 */
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      orgId: req.user.activeOrg
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete project" });
  }
};
