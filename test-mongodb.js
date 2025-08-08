const { MongoClient } = require('mongodb');

async function testConnection() {
  // Test different URI formats with correct credentials
  const uris = [
    'mongodb+srv://gerynsb:Dean1234@cluster0.mongodb.net/desa_db?retryWrites=true&w=majority',
    'mongodb+srv://gerynsb:Dean1234@cluster0.9xfvl.mongodb.net/desa_db?retryWrites=true&w=majority',
    'mongodb+srv://gerynsb:Dean1234@cluster0.yc2qrkh.mongodb.net/desa_db?retryWrites=true&w=majority'
  ];

  for (let i = 0; i < uris.length; i++) {
    console.log(`\nTesting URI ${i + 1}:`);
    console.log(uris[i].replace('Dean1234', '****')); // Hide password
    
    const client = new MongoClient(uris[i], {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });

    try {
      console.log('Connecting to MongoDB...');
      await client.connect();
      console.log('✅ Connected successfully to MongoDB');

      const db = client.db('desa_db');
      const collections = await db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));

      // Try to read content
      const contentCollection = db.collection('contents');
      const contents = await contentCollection.find({}).toArray();
      console.log('Contents found:', contents.length);
      
      if (contents.length > 0) {
        console.log('✅ Data access successful!');
        console.log('First content structure:', Object.keys(contents[0]));
      }
      
      await client.close();
      console.log('✅ This URI works! Update your .env.local:');
      console.log(`MONGODB_URI=${uris[i]}`);
      return; // Exit after first successful connection

    } catch (error) {
      console.error('❌ MongoDB Error:', error.message);
    } finally {
      if (client) {
        try { await client.close(); } catch {}
      }
    }
  }
  
  console.log('\n❌ All URIs failed. Please check:');
  console.log('1. MongoDB Atlas cluster name (go to cloud.mongodb.com)');
  console.log('2. Username: gerynsb');
  console.log('3. Password: Dean1234');
  console.log('4. Network access (whitelist your IP)');
}

testConnection();
