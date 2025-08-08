const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const sampleData = {
  _id: new ObjectId("688cb9843b51c77691c05143"),
  sections: [
    {
      key: "sejarah",
      title: "Sejarah Desa",
      description: "Desa Sangpiak Salu memiliki sejarah yang panjang dan kaya akan budaya Toraja."
    },
    {
      key: "visi-misi",
      title: "Visi dan Misi",
      description: "Visi: Mewujudkan desa yang maju, sejahtera, dan berbudaya. Misi: Mengembangkan potensi desa secara berkelanjutan."
    },
    {
      key: "profil",
      title: "Profil Desa",
      description: "Desa Sangpiak Salu terletak di Kecamatan Rantepao, Kabupaten Toraja Utara."
    }
  ],
  infografis: {
    penduduk: 1250,
    total: 350,
    luas_wilayah: 45,
    jarak_dari_rantepao: 8
  }
};

async function initializeDatabase() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('contents');

    // Check if data already exists
    const existingData = await collection.findOne({ _id: sampleData._id });
    
    if (existingData) {
      console.log('Data already exists in database');
    } else {
      await collection.insertOne(sampleData);
      console.log('Sample data inserted successfully');
    }

    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();
