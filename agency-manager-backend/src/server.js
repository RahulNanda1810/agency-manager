require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

console.log('Testing Cloudinary config...');
try {
  const { cloudinary } = require('./config/cloudinary');
  console.log('✅ Cloudinary loaded successfully');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
} catch (err) {
  console.error('❌ Cloudinary config error:', err.message);
}

const PORT = process.env.PORT || 5000;


connectDB();

require("./daily-cron");

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
