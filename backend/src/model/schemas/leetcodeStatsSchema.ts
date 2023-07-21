import {Schema} from 'mongoose';

export const leetcodeStatsSchema = new Schema({
  username: String,
  submitStats: {
    acSubmissionNum: [
      {
        difficulty: String,
        count: Number,
        submissions: Number
      }
    ]
  }
});