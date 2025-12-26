const jwt = require("jsonwebtoken");
const User = require("../models/user");
const OrgMembership = require("../models/Orgmembership");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Set user on request with both _id and userId for compatibility
    req.user = user;
    req.user.userId = user._id; // Add this for backward compatibility
    
    // Try to fetch user's primary organization membership (optional)
    const membership = await OrgMembership.findOne({ userId: user._id });
    if (membership) {
      req.user.activeOrg = membership.orgId;
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token" });
  }
};
