// Remove member from org (admin only)
exports.removeMember = async (req, res) => {
  try {
    const { orgId, userId } = req.params;
    const adminMembership = await OrgMembership.findOne({
      orgId,
      userId: req.user._id,
      role: "org_admin"
    });
    if (!adminMembership) {
      return res.status(403).json({ message: "Admin access required" });
    }
    await OrgMembership.deleteOne({ orgId, userId });
    res.json({ message: "Member removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove member" });
  }
};

// Send invitation
exports.sendInvitation = async (req, res) => {
  try {
    const { email, role } = req.body;
    const { orgId } = req.params;

    const adminMembership = await OrgMembership.findOne({
      orgId,
      userId: req.user._id,
      role: "org_admin"
    });

    if (!adminMembership) {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Check if user already exists and is a member
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const existingMembership = await OrgMembership.findOne({
        orgId,
        userId: existingUser._id
      });
      if (existingMembership) {
        return res.status(400).json({ message: "User is already a member" });
      }
    }

    // Check if pending invitation exists
    const existingInvite = await Invitation.findOne({
      orgId,
      email,
      status: "pending",
      expiresAt: { $gt: new Date() }
    });

    if (existingInvite) {
      return res.status(400).json({ message: "Invitation already sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const invitation = await Invitation.create({
      orgId,
      email,
      role: role || "member",
      invitedBy: req.user._id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    const org = await Organization.findById(orgId);
    
    res.status(201).json({
      _id: invitation._id,
      email: invitation.email,
      role: invitation.role,
      token: invitation.token,
      inviteLink: `${req.protocol}://${req.get('host')}/auth/register?invite=${token}`,
      orgName: org.name,
      expiresAt: invitation.expiresAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to send invitation" });
  }
};

// Get pending invitations
exports.getInvitations = async (req, res) => {
  try {
    const { orgId } = req.params;

    const adminMembership = await OrgMembership.findOne({
      orgId,
      userId: req.user._id,
      role: "org_admin"
    });

    if (!adminMembership) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const invitations = await Invitation.find({
      orgId,
      status: "pending",
      expiresAt: { $gt: new Date() }
    }).populate('invitedBy', 'email name').sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invitations" });
  }
};

// Accept invitation (called during registration/login)
exports.acceptInvitation = async (req, res) => {
  try {
    const { token } = req.body;

    const invitation = await Invitation.findOne({
      token,
      status: "pending",
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(404).json({ message: "Invalid or expired invitation" });
    }

    // Create membership
    await OrgMembership.create({
      orgId: invitation.orgId,
      userId: req.user._id,
      role: invitation.role
    });

    // Mark invitation as accepted
    invitation.status = "accepted";
    await invitation.save();

    const org = await Organization.findById(invitation.orgId);

    res.json({ 
      message: "Invitation accepted",
      orgId: invitation.orgId,
      orgName: org.name
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to accept invitation" });
  }
};

// Send access request
exports.sendAccessRequest = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { message } = req.body;

    // Check if already a member
    const existingMembership = await OrgMembership.findOne({
      orgId,
      userId: req.user._id
    });

    if (existingMembership) {
      return res.status(400).json({ message: "You are already a member" });
    }

    // Check if request already exists
    const existingRequest = await AccessRequest.findOne({
      orgId,
      userId: req.user._id,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Access request already pending" });
    }

    const accessRequest = await AccessRequest.create({
      orgId,
      userId: req.user._id,
      message: message || ""
    });

    const populatedRequest = await AccessRequest.findById(accessRequest._id)
      .populate('userId', 'email name');

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to send access request" });
  }
};

// Get access requests (admin only)
exports.getAccessRequests = async (req, res) => {
  try {
    const { orgId } = req.params;

    const adminMembership = await OrgMembership.findOne({
      orgId,
      userId: req.user._id,
      role: "org_admin"
    });

    if (!adminMembership) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const requests = await AccessRequest.find({
      orgId,
      status: "pending"
    }).populate('userId', 'email name').sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch access requests" });
  }
};

// Respond to access request (admin only)
exports.respondToAccessRequest = async (req, res) => {
  try {
    const { orgId, requestId } = req.params;
    const { action, role } = req.body; // action: 'approve' or 'reject'

    const adminMembership = await OrgMembership.findOne({
      orgId,
      userId: req.user._id,
      role: "org_admin"
    });

    if (!adminMembership) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const accessRequest = await AccessRequest.findOne({
      _id: requestId,
      orgId,
      status: "pending"
    });

    if (!accessRequest) {
      return res.status(404).json({ message: "Access request not found" });
    }

    if (action === "approve") {
      // Create membership
      await OrgMembership.create({
        orgId,
        userId: accessRequest.userId,
        role: role || "member"
      });

      accessRequest.status = "approved";
    } else {
      accessRequest.status = "rejected";
    }

    accessRequest.respondedBy = req.user._id;
    accessRequest.respondedAt = new Date();
    await accessRequest.save();

    res.json({ message: `Access request ${action}d` });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to respond to access request" });
  }
};
const Organization = require("../models/Organization");
const OrgMembership = require("../models/Orgmembership");
const User = require("../models/user");
const Invitation = require("../models/Invitation");
const AccessRequest = require("../models/AccessRequest");
const crypto = require("crypto");

// Create new organization
exports.createOrg = async (req, res) => {
  try {
    const { name } = req.body;

    const org = await Organization.create({
      name,
      createdBy: req.user._id
    });

    await OrgMembership.create({
      orgId: org._id,
      userId: req.user._id,
      role: "org_admin"
    });

    res.status(201).json(org);
  } catch (error) {
    res.status(500).json({ message: "Failed to create organization" });
  }
};

// List orgs for logged-in user
exports.getMyOrgs = async (req, res) => {
  try {
    const memberships = await OrgMembership.find({
      userId: req.user._id
    }).populate("orgId");

    const orgs = memberships.map(m => ({
      _id: m.orgId._id,
      name: m.orgId.name,
      role: m.role
    }));

    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch organizations" });
  }
};

// List all organizations (for access requests)
exports.getAllOrgs = async (req, res) => {
  try {
    console.log('getAllOrgs called by user:', req.user?._id);
    
    const allOrgs = await Organization.find().select('name createdAt');
    console.log('Found', allOrgs.length, 'organizations');
    
    // Get user's memberships
    const memberships = await OrgMembership.find({
      userId: req.user._id
    }).select('orgId');
    
    const memberOrgIds = memberships.map(m => m.orgId.toString());
    console.log('User is member of:', memberOrgIds.length, 'orgs');
    
    // Get pending access requests
    const pendingRequests = await AccessRequest.find({
      userId: req.user._id,
      status: 'pending'
    }).select('orgId');
    
    const requestedOrgIds = pendingRequests.map(r => r.orgId.toString());
    console.log('User has requested access to:', requestedOrgIds.length, 'orgs');
    
    const orgs = allOrgs.map(org => ({
      _id: org._id,
      name: org.name,
      createdAt: org.createdAt,
      isMember: memberOrgIds.includes(org._id.toString()),
      hasRequestedAccess: requestedOrgIds.includes(org._id.toString())
    }));

    console.log('Returning', orgs.length, 'organizations to frontend');
    res.json(orgs);
  } catch (error) {
    console.error('Error in getAllOrgs:', error);
    res.status(500).json({ message: "Failed to fetch organizations" });
  }
};

// Update organization (admin only)
exports.updateOrg = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { name } = req.body;

    const adminMembership = await OrgMembership.findOne({
      orgId,
      userId: req.user._id,
      role: "org_admin"
    });

    if (!adminMembership) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const org = await Organization.findByIdAndUpdate(
      orgId,
      { name },
      { new: true }
    );

    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json(org);
  } catch (error) {
    res.status(500).json({ message: "Failed to update organization" });
  }
};

// Delete organization (admin only)
exports.deleteOrg = async (req, res) => {
  try {
    const { orgId } = req.params;

    const adminMembership = await OrgMembership.findOne({
      orgId,
      userId: req.user._id,
      role: "org_admin"
    });

    if (!adminMembership) {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Delete all memberships
    await OrgMembership.deleteMany({ orgId });

    // Delete the organization
    await Organization.findByIdAndDelete(orgId);

    res.json({ message: "Organization deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete organization" });
  }
};

// Get organization members
exports.getMembers = async (req, res) => {
  try {
    const { orgId } = req.params;

    // Check if user is a member of this org
    const userMembership = await OrgMembership.findOne({
      orgId,
      userId: req.user._id
    });

    if (!userMembership) {
      return res.status(403).json({ message: "Access denied" });
    }

    const memberships = await OrgMembership.find({ orgId })
      .populate('userId', 'email name')
      .sort({ createdAt: -1 });

    const members = memberships.map(m => ({
      _id: m._id,
      userId: m.userId._id,
      email: m.userId.email,
      name: m.userId.name,
      role: m.role,
      joinedAt: m.createdAt
    }));

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch members" });
  }
};

// Add member to org (admin only)
exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const { orgId } = req.params;

    const adminMembership = await OrgMembership.findOne({
      orgId,
      userId: req.user._id,
      role: "org_admin"
    });

    if (!adminMembership) {
      return res.status(403).json({ message: "Admin access required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found. They need to register first." });
    }

    // Check if already a member
    const existingMembership = await OrgMembership.findOne({
      orgId,
      userId: user._id
    });

    if (existingMembership) {
      return res.status(400).json({ message: "User is already a member" });
    }

    const membership = await OrgMembership.create({
      orgId,
      userId: user._id,
      role: role || "member"
    });

    const populatedMembership = await OrgMembership.findById(membership._id)
      .populate('userId', 'email name');

    res.status(201).json({
      _id: populatedMembership._id,
      userId: populatedMembership.userId._id,
      email: populatedMembership.userId.email,
      name: populatedMembership.userId.name,
      role: populatedMembership.role,
      joinedAt: populatedMembership.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to add member" });
  }
};
