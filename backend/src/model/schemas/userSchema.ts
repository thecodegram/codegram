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
  leetcode:  leetcodeStatsSchema,
  vjudge:  vjudgeStatsSchema
});

export const User = mongoose.model('User', userSchema);