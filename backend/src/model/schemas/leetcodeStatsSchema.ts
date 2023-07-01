import {Schema} from 'mongoose';

export const leetcodeStatsSchema = new Schema({
  username: String,
  acSubmissionsNum: [
    {
      difficulty: String,
      count: Number,
      submissions: Number
    }
  ],
  password: {
    type: String,
    required: true,
  },
  // ... other fields
});