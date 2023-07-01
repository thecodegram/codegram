import mongoose, {Schema} from 'mongoose';
import { leetcodeStatsSchema } from './leetcodeStatsSchema';

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
    type: leetcodeStatsSchema
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;