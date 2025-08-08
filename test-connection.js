const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://gerynsb:Dean1234@cluster0.a5efo.mongodb.net/desa_db?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
    try {
        console.log('🔄 Testing MongoDB connection...');
        const client = new MongoClient(MONGODB_URI);
        
        await client.connect();
        console.log('✅ Connected successfully to MongoDB Atlas!');
        
        const db = client.db('desa_db');
        const collections = await db.listCollections().toArray();
        console.log('📊 Available collections:', collections.map(c => c.name));
        
        // Test querying homepage content
        const content = await db.collection('content').findOne({ _id: 'homepage-content' });
        if (content) {
            console.log('✅ Homepage content found in database');
            console.log('📝 Sections:', content.sections?.length || 0);
            console.log('📝 Gallery:', content.gallery?.length || 0);
            console.log('📝 Dusun:', content.dusun?.length || 0);
        } else {
            console.log('⚠️ Homepage content not found');
        }
        
        await client.close();
        console.log('✅ Connection test completed');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('🔍 Error details:', error);
    }
}

testConnection();
