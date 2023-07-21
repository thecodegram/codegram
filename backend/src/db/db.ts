import { env } from '../config/env';
import mongoose from 'mongoose';
import {Pool} from 'pg'
import fs from 'fs'
import path from 'path'

async function connectToMongo() {
  try {
    const MONGO_CONNECTION_STRING = env.MONGODB_CONNECTION_STRING!!;
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGO_CONNECTION_STRING, {
      maxConnecting: 30
    });

    console.log("Connected to MongoDb");
    return true;
    
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return false;
  }
}

const PSQL_CONNECTION_STRING = env.PSQL_CONNECTION_STRING;
export const pool = new Pool({connectionString: PSQL_CONNECTION_STRING});

async function connectToPostgresAndCreateTables(){
  try {
    const dbInitQuery = await fs.promises.readFile(path.join(__dirname,'db_init.sql'), 'utf8');
    await pool.query(dbInitQuery);

    console.log('Connected to postgres!');
  } catch(e) {
    console.log("Encountered error during postgres setup");
    console.error(e);
    return false;
  }

  return true;
}
export async function setUpDB(){
    // connect to both databases concurrently
    const connectToMonoDB = connectToMongo();
    const connectToPostgres = connectToPostgresAndCreateTables();

    const isConnectedToMongo = await connectToMonoDB;
    const isConnectedToPostgres = await connectToPostgres;
    
    if(isConnectedToMongo && isConnectedToPostgres) {
      console.log('Databases are setup!');
      return true;
    }

    return false;
}