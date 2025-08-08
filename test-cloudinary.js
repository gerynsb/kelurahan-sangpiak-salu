// Test Cloudinary configuration
const { v2: cloudinary } = require('cloudinary');

console.log('🔍 Testing Cloudinary configuration...');

// Load environment variables
require('dotenv').config({ path: './.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('\n📋 Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set');

// Test connection by getting cloud details
async function testConnection() {
  try {
    console.log('\n🔄 Testing Cloudinary connection...');
    
    // Test basic API access
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
    
    // List some resources to confirm API key is working
    const resources = await cloudinary.api.resources({
      resource_type: 'image',
      max_results: 5
    });
    console.log('✅ API key is working, found', resources.resources.length, 'images');
    
    console.log('\n🎉 Cloudinary is properly configured!');
    
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    if (error.http_code) {
      console.error('HTTP Code:', error.http_code);
    }
  }
}

testConnection();
