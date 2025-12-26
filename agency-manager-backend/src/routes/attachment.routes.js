const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const attachmentController = require("../controllers/attachment.controller");

// Upload attachment
router.post("/", 
  authMiddleware, 
  attachmentController.uploadMiddleware, 
  attachmentController.addAttachment
);

// Get attachments
router.get("/", 
  authMiddleware, 
  attachmentController.getAttachments
);

// Get single attachment
router.get("/:id", 
  authMiddleware, 
  attachmentController.getAttachment
);

// ✅ ADD THIS - Redirect to Cloudinary with proper signed URL
router.get("/:id/download", 
  authMiddleware, 
  attachmentController.downloadAttachment
);

// Delete attachment
router.delete("/:id", 
  authMiddleware, 
  attachmentController.deleteAttachment
);

module.exports = router;