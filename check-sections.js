const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://gerynsb:Dean1234@cluster0.a5efo.mongodb.net/desa_db?retryWrites=true&w=majority&appName=Cluster0';

async function checkSections() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Connected successfully!');
        
        const db = client.db('desa_db');
        const content = await db.collection('contents').findOne({ _id: 'homepage-content' });
        
        if (content && content.sections) {
            console.log('\n📄 All Sections in MongoDB:');
            console.log('='.repeat(50));
            
            content.sections.forEach((section, index) => {
                console.log(`\n${index + 1}. Section: ${section.key}`);
                console.log(`   Title: ${section.title}`);
                console.log(`   Description: ${section.description?.substring(0, 100)}...`);
                console.log(`   Has Image: ${section.image_url ? '✅ YES' : '❌ NO'}`);
                if (section.image_url) {
                    console.log(`   Image URL: ${section.image_url}`);
                }
                console.log('-'.repeat(50));
            });
        }
        
        await client.close();
        console.log('\n✅ Section analysis completed');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkSections();
