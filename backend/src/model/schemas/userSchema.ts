import mongoose, {Schema} from 'mongoose';
import { leetcodeStatsSchema } from './leetcodeStatsSchema';
import { vjudgeStatsSchema } from './vjudgeStatsSchema';

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
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
  vjudge:  vjudgeStatsSchema,
  profilePic: String
});

export const User = mongoose.model('User', userSchema);