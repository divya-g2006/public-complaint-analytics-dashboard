import mongoose from "mongoose";

export async function connectDb() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required in environment variables.");
  }

  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(mongoUri);
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection failed.", error);
    process.exit(1);
  }
}

