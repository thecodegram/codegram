import mongoose, {Schema} from 'mongoose';
import { leetcodeStatsSchema } from './leetcodeStatsSchema';
import { vjudgeStatsSchema } from './vjudgeStatsSchema';

const userSchema = new Schema({
  username: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  leetcode: {
    type: leetcodeStatsSchema,
    required: false
  },
  vjudge: {
    type: vjudgeStatsSchema,
    required: false
  }
});

export const User = mongoose.model('User', userSchema);