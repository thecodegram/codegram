import { env } from "../config/env";
import mongoose from "mongoose";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: env.GCLOUD_PROJECT_ID,
  keyFilename: env.GCLOUD_KEYFILE_PATH,
});
export const bucket = storage.bucket("profile_image_bucket");

// Test the Google Cloud Storage connection by getting bucket metadata
async function checkGCSConnection() {
  try {
    await bucket.getMetadata();
    console.log("Connected to Google Cloud Storage!");
    return true;
  } catch (e) {
    console.log("Encountered error during Google Cloud Storage setup");
    console.error(e);
    return false;
  }
}

async function connectToMongo() {
  try {
    const MONGO_CONNECTION_STRING = env.MONGODB_CONNECTION_STRING!!;
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGO_CONNECTION_STRING, {
      maxConnecting: 30,
    });

    console.log("Connected to MongoDb");
    return true;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return false;
  }
}

const PSQL_CONNECTION_STRING = env.PSQL_CONNECTION_STRING;
export const pool = new Pool({ 
  connectionString: PSQL_CONNECTION_STRING,
  idleTimeoutMillis: 60000,
  idle_in_transaction_session_timeout: 5000,
  max: 15,
  ssl: {
    rejectUnauthorized: false, // Set this to true if using a self-signed certificate and want to enforce SSL certificate verification
    // Other SSL options can be specified here, such as ca, cert, key, etc., for client certificate authentication
  }
});

async function connectToPostgresAndCreateTables() {
  try {
    const dbInitQuery = await fs.promises.readFile(
      path.join(__dirname, "db_init.sql"),
      "utf8"
    );
    await pool.query(dbInitQuery);

    console.log("Connected to postgres!");
  } catch (e) {
    console.log("Encountered error during postgres setup");
    console.error(e);
    return false;
  }

  return true;
}
export async function setUpDB() {
  // connect to both databases concurrently and google cloud storage
  const connectToMonoDB = connectToMongo();
  const connectToPostgres = connectToPostgresAndCreateTables();
  const checkGCS = checkGCSConnection();

  const isConnectedToMongo = await connectToMonoDB;
  const isConnectedToPostgres = await connectToPostgres;
  const isGCSConnected = await checkGCS;

  if (isConnectedToMongo && isConnectedToPostgres && isGCSConnected) {
    console.log("Databases and GCS are setup!");
    return true;
  }

  return false;
}
