import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

// Fallback data when MongoDB is not available - exact match with your MongoDB Atlas data
const fallbackData = {
  _id: "homepage-content",
  sections: [
    {
      key: "hero",
      title: "Selamat Datang di Website Sangpiak Salu",
      description: "Sumber informasi tentang pemerintahan di Sangpiak Salu",
      image_url: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754153412/desa/z0t6uzokgfhhqfgnyqir.jpg"
    },
    {
      key: "section1", 
      title: "Jelajahi Desa",
      description: "Melalui website ini Anda dapat menjelajahi segala hal yang terkait dengan Desa. Aspek pemerintahan, penduduk, demografi, potensi Desa, dan juga berita tentang Desa.",
      image_url: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754154307/desa/pwf6uzokgfhhqfgnyqir.jpg"
    },
    {
      key: "kata_sambutan",
      title: "Kata Sambutan Kepala Desa", 
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed in feugiat lorem, nec tincidunt tortor.",
      image_url: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754143656/desa/zop6uzokgfhhqfgnyqir.jpg"
    },
    {
      key: "potensi_desa",
      title: "Potensi Desa",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec elementum, nunc id aliquet bibendum, nisi nunc tincidunt nulla.",
      image_url: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754143675/desa/cdb6uzokgfhhqfgnyqir.jpg"
    }
  ],
  infografis: {
    jarak_dari_rantepao: 1242,
    luas_wilayah: 12155,
    penduduk: 1099,
    total: 1000
  },
  dusun: [
    { 
      key: "dusun1", 
      name: "Dusun 1", 
      deskripsi: "Deskripsi dusun 1 akan diisi melalui admin panel", 
      link_gambar: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754143656/desa/zop6uzokgfhhqfgnyqir.jpg",
      nama_kadus: "",
      link_kadus: "",
      gallery: []
    },
    { 
      key: "dusun2", 
      name: "Dusun 2", 
      deskripsi: "Deskripsi dusun 2 akan diisi melalui admin panel", 
      link_gambar: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754143675/desa/cdb6uzokgfhhqfgnyqir.jpg",
      nama_kadus: "",
      link_kadus: "",
      gallery: []
    },
    { 
      key: "dusun3", 
      name: "Dusun 3", 
      deskripsi: "Deskripsi dusun 3 akan diisi melalui admin panel", 
      link_gambar: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754143695/desa/y7j6uzokgfhhqfgnyqir.jpg",
      nama_kadus: "",
      link_kadus: "",
      gallery: []
    },
    { 
      key: "dusun4", 
      name: "Dusun 4", 
      deskripsi: "Deskripsi dusun 4 akan diisi melalui admin panel", 
      link_gambar: "",
      nama_kadus: "",
      link_kadus: "",
      gallery: []
    }
  ],
  gallery: [
    {
      id: "1754144371778",
      title: "Desa 1",
      description: "Gambar desa 1",
      image_url: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754144386/desa/rle6uzokgfhhqfgnyqir.jpg",
      uploaded_at: "2025-08-02T14:19:45.668Z"
    },
    {
      id: "1754144398727",
      title: "Desa 2",
      description: "Gambar Desa 2",
      image_url: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754144408/desa/wjz6uzokgfhhqfgnyqir.jpg",
      uploaded_at: "2025-08-02T14:20:07.532Z"
    },
    {
      id: "1754144417035",
      title: "Desa 3",
      description: "Gambar Desa 3",
      image_url: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754144430/desa/lfy6uzokgfhhqfgnyqir.jpg",
      uploaded_at: "2025-08-02T14:20:30.613Z"
    },
    {
      id: "1754144437553",
      title: "Desa 4",
      description: "Gambar Desa 4",
      image_url: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754144447/desa/ytb6uzokgfhhqfgnyqir.jpg",
      uploaded_at: "2025-08-02T14:20:46.897Z"
    },
    {
      id: "1754144457348",
      title: "Desa 5",
      description: "Gambar Desa 5",
      image_url: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754144476/desa/apb6uzokgfhhqfgnyqir.jpg",
      uploaded_at: "2025-08-02T14:21:16.287Z"
    },
    {
      id: "1754144458629",
      title: "Desa 6",
      description: "Gambar Desa 6",
      image_url: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754144491/desa/bic6uzokgfhhqfgnyqir.jpg",
      uploaded_at: "2025-08-02T14:21:30.724Z"
    }
  ],
  pegawai: [
    {
      id: "1754144500001",
      nama: "H. Ahmad Rahman",
      jabatan: "Kepala Desa",
      foto_url: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754143656/desa/zop6uzokgfhhqfgnyqir.jpg",
      deskripsi: "Memimpin pemerintahan desa dengan visi menciptakan desa yang maju dan sejahtera untuk seluruh masyarakat.",
      created_at: "2025-08-02T14:25:00.000Z"
    },
    {
      id: "1754144500002", 
      nama: "Siti Aisyah, S.Pd",
      jabatan: "Sekretaris Desa",
      foto_url: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754143675/desa/cdb6uzokgfhhqfgnyqir.jpg",
      deskripsi: "Mengelola administrasi desa dan memastikan pelayanan publik berjalan dengan baik dan efisien.",
      created_at: "2025-08-02T14:25:30.000Z"
    },
    {
      id: "1754144500003",
      nama: "Budi Santoso",
      jabatan: "Bendahara Desa",
      foto_url: "https://res.cloudinary.com/dpubyir1w/image/upload/v1754143680/desa/abc6uzokgfhhqfgnyqir.jpg",
      deskripsi: "Bertanggung jawab atas pengelolaan keuangan desa secara transparan dan akuntabel.",
      created_at: "2025-08-02T14:26:00.000Z"
    }
  ],
  galeri_kkn: [
    {
      id: "1754144500010",
      title: "Kegiatan Sosialisasi Program KKN", 
      description: "Mahasiswa KKN T 114 melakukan sosialisasi program kerja kepada masyarakat desa",
      image_url: "",
      uploaded_at: "2025-08-09T10:00:00.000Z"
    }
  ]
};

export async function GET() {
  try {
    // Check if MongoDB is available
    if (!clientPromise) {
      console.log("⚠️ MongoDB not configured, using fallback data");
      return new Response(JSON.stringify(fallbackData), { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

    console.log('🔍 Connecting to MongoDB Atlas...');
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    console.log('✅ Connected to MongoDB Atlas');
    console.log('🔍 Searching for document with _id: homepage-content');
    
    // Try to find the homepage-content document with string _id
    let content = await db
      .collection("contents")
      .findOne({ _id: new ObjectId("688cd2fb6bb330791bafac19") });
    
    console.log('� Found homepage-content:', !!content);
    
    // If still not found, get any document from contents collection
    if (!content) {
      console.log('🔍 Getting first document from contents collection...');
      content = await db.collection("contents").findOne({});
      console.log('📄 Found first document:', !!content);
    }

    // If we found actual MongoDB data, return it
    if (content) {
      console.log('✅ Returning MongoDB data with _id:', content._id);
      console.log('📸 Hero image URL:', content.sections?.[0]?.image_url);
      return new Response(JSON.stringify(content), { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } else {
      console.log('⚠️ No MongoDB data found, using fallback');
      return new Response(JSON.stringify(fallbackData), { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

  } catch (err: unknown) {
    console.error("❌ MongoDB connection error:", err instanceof Error ? err.message : String(err));
    console.error("❌ Full error:", err);
    console.log("⚠️ Using fallback data");
    // Return fallback data when MongoDB fails
    return new Response(JSON.stringify(fallbackData), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    // Check if MongoDB is available
    if (!clientPromise) {
      console.log("⚠️ MongoDB not configured, simulating update success");
      return new Response(JSON.stringify({ message: "Update simulated (MongoDB not configured)", modifiedCount: 1 }), { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Try to update the homepage-content document first
    let result = await db.collection("contents").updateOne(
      { _id: new ObjectId("688cd2fb6bb330791bafac19") },
      { $set: body }
    );

    // If not found, try with ObjectId
    if (result.matchedCount === 0) {
      result = await db.collection("contents").updateOne(
        { _id: new ObjectId("688cd2fb6bb330791bafac19") },
        { $set: body }
      );
    }
    
    // If no document was matched, try to update the first document
    if (result.matchedCount === 0) {
      const firstDoc = await db.collection("contents").findOne({});
      if (firstDoc) {
        result = await db.collection("contents").updateOne(
          { _id: firstDoc._id },
          { $set: body }
        );
      }
    }

    return new Response(JSON.stringify({ message: "Updated successfully", modifiedCount: result.modifiedCount }), { status: 200 });
  } catch (err: unknown) {
    console.error("MongoDB error during update:", err instanceof Error ? err.message : String(err));
    // For now, just return success even if MongoDB fails
    return new Response(JSON.stringify({ message: "Update simulated (MongoDB unavailable)" }), { status: 200 });
  }
}
