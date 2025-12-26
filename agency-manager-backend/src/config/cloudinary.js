const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary configured with cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Get file extension
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    const nameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '');
    
    // Determine resource type based on file extension
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const isImage = imageFormats.includes(ext || '');
    
    return {
      folder: 'agency-manager',
      resource_type: isImage ? 'image' : 'raw', // Use 'raw' for non-images
      public_id: `${Date.now()}-${nameWithoutExt.replace(/\s+/g, '-').replace(/[^\w.-]/g, '')}`,
      // Don't specify format for raw files
      ...(isImage && { format: ext })
    };
  }
});

module.exports = { cloudinary, storage };