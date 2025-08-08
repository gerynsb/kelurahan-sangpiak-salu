const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://gerynsb:Dean1234@cluster0.a5efo.mongodb.net/desa_db?retryWrites=true&w=majority&appName=Cluster0';

async function checkCollections() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Connected successfully!');
        
        const db = client.db('desa_db');
        
        // List all collections
        const collections = await db.listCollections().toArray();
        console.log('\n📊 Available collections:');
        collections.forEach(col => console.log(`  - ${col.name}`));
        
        // Check contents collection
        if (collections.find(c => c.name === 'contents')) {
            console.log('\n🔍 Checking contents collection...');
            
            const documents = await db.collection('contents').find({}).toArray();
            console.log(`📄 Found ${documents.length} documents in contents collection:`);
            
            documents.forEach((doc, index) => {
                console.log(`\n📄 Document ${index + 1}:`);
                console.log(`  _id: ${doc._id}`);
                console.log(`  Type: ${typeof doc._id}`);
                if (doc.sections) {
                    console.log(`  Sections: ${doc.sections.length}`);
                    if (doc.sections[0]) {
                        console.log(`  Hero title: ${doc.sections[0].title}`);
                        console.log(`  Hero image: ${doc.sections[0].image_url}`);
                    }
                }
                if (doc.gallery) {
                    console.log(`  Gallery: ${doc.gallery.length} items`);
                }
                if (doc.dusun) {
                    console.log(`  Dusun: ${doc.dusun.length} items`);
                }
            });
        }
        
        await client.close();
        console.log('\n✅ Analysis completed');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkCollections();
