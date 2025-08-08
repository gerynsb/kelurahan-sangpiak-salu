import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with proper credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "desa" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    return new Response(JSON.stringify({ secure_url: result.secure_url }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (err: unknown) {
    console.error('❌ Cloudinary upload error:', err);
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'Upload failed',
      details: process.env.NODE_ENV === 'development' ? err : undefined
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
