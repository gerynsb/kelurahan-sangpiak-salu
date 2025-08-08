import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

if (!uri) {
  console.warn("⚠️ MONGODB_URI not found in environment variables. Using fallback data.");
  // clientPromise remains null
} else {
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> };
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;
