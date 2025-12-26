const Attachment = require("../models/Attachment");
const multer = require("multer");
const { cloudinary, storage } = require("../config/cloudinary");

// Use Cloudinary storage instead of local storage
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Optional: Add file type validation
    cb(null, true);
  }
});

exports.uploadMiddleware = upload.single("file");

// Upload attachment
exports.addAttachment = async (req, res) => {
  try {
    console.log('=== UPLOAD REQUEST DEBUG ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('========================');
    
    const { projectId, taskId, commentId, orgId } = req.body;
    
    if (!req.file) {
      console.error('❌ No file in request!');
      return res.status(400).json({ 
        message: "No file uploaded"
      });
    }

    if (!projectId && !taskId && !commentId) {
      console.error('❌ No ID provided!');
      return res.status(400).json({ 
        message: "projectId, taskId, or commentId required"
      });
    }

    // Determine if it's an image or document
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const ext = req.file.originalname.split('.').pop()?.toLowerCase();
    const isImage = imageFormats.includes(ext || '');
    
    // Fix the URL - replace /image/ with /raw/ for non-images
    let fileUrl = req.file.path;
    if (!isImage && fileUrl.includes('/image/upload/')) {
      fileUrl = fileUrl.replace('/image/upload/', '/raw/upload/');
    }

    console.log('✅ File uploaded');
    console.log('Original Cloudinary URL:', req.file.path);
    console.log('Fixed URL:', fileUrl);
    console.log('Is Image:', isImage);

    const attachment = await Attachment.create({
      filename: req.file.originalname,
      url: fileUrl, // Use corrected URL
      cloudinaryId: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype,
      userId: req.user._id,
      orgId: orgId || projectId || taskId,
      projectId: projectId || null,
      taskId: taskId || null,
      commentId: commentId || null
    });

    console.log('✅ Attachment saved:', attachment._id);
    console.log('Final URL:', attachment.url);

    res.status(201).json({
      message: "File uploaded successfully",
      attachment
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ 
      message: "Failed to upload attachment",
      error: error.message 
    });
  }
};
// Get attachments
exports.getAttachments = async (req, res) => {
  try {
    const { projectId, taskId, commentId } = req.query;
    const filter = { orgId: req.user.activeOrg };
    
    if (projectId) filter.projectId = projectId;
    if (taskId) filter.taskId = taskId;
    if (commentId) filter.commentId = commentId;
    
    const attachments = await Attachment.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(attachments);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Failed to fetch attachments" });
  }
};

// Delete attachment
exports.deleteAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    
    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    // Check if user has permission to delete
    if (attachment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this attachment" });
    }

    // Delete from Cloudinary
    if (attachment.cloudinaryId) {
      await cloudinary.uploader.destroy(attachment.cloudinaryId, {
        resource_type: 'raw' // Use 'raw' for non-image files
      });
    }

    // Delete from database
    await Attachment.findByIdAndDelete(req.params.id);

    res.json({ message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete attachment" });
  }
};

// Get single attachment
exports.getAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    res.json(attachment);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Failed to fetch attachment" });
  }
};
// Download/view attachment with proper signed URL
exports.downloadAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    
    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    console.log('Downloading attachment:', attachment.cloudinaryId);

    // Generate a signed URL that expires in 1 hour
    const signedUrl = cloudinary.url(attachment.cloudinaryId, {
      resource_type: 'raw',
      type: 'upload',
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    });

    console.log('Signed URL:', signedUrl);

    // Redirect to the signed Cloudinary URL
    res.redirect(signedUrl);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ 
      message: "Failed to download attachment",
      error: error.message 
    });
  }
};