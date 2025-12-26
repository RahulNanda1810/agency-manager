const express = require("express");
const router = express.Router();
const orgController = require("../controllers/org.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.post("/", orgController.createOrg);
router.get("/", orgController.getMyOrgs);
router.get("/all", orgController.getAllOrgs);
router.put("/:orgId", orgController.updateOrg);
router.delete("/:orgId", orgController.deleteOrg);
router.get("/:orgId/members", orgController.getMembers);
router.post("/:orgId/members", orgController.addMember);
router.delete("/:orgId/members/:userId", orgController.removeMember);

// Invitations
router.post("/:orgId/invitations", orgController.sendInvitation);
router.get("/:orgId/invitations", orgController.getInvitations);
router.post("/invitations/accept", orgController.acceptInvitation);

// Access requests
router.post("/:orgId/access-requests", orgController.sendAccessRequest);
router.get("/:orgId/access-requests", orgController.getAccessRequests);
router.post("/:orgId/access-requests/:requestId", orgController.respondToAccessRequest);

module.exports = router;
