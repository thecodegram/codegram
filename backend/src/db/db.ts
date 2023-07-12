import mongoose from 'mongoose';
import { env } from '../config/env';


export async function setUpDB(){
    try {
        const DB_CONNECTION_STRING = env.MONGODB_CONNECTION_STRING!!;
        mongoose.set('strictQuery', false);
        await mongoose.connect(DB_CONNECTION_STRING, {
          maxConnecting: 30
        });
        console.log('Connected to the database!');
        
        return true;
        
      } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        return false;
      }
}