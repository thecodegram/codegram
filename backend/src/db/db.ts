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

    console.log('Connected to the database!');
  } catch(e) {
    console.log("Encountered error during db init");
    console.error(e);
    return false;
  }

  return true;
}
export async function setUpDB(){
    const isConnectedToMongo = await connectToMongo();
    const isConnectedToPostgres = await connectToPostgresAndCreateTables();

    
    if(isConnectedToMongo && isConnectedToPostgres) {
      console.log('Connected to the database!');
      return true;
    }

    return false;
}