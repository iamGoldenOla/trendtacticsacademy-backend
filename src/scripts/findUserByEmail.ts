import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const email = process.argv[2];
if (!email) {
  console.error('Usage: ts-node findUserByEmail.ts <email>');
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI || '';
if (!MONGO_URI) {
  console.error('MONGO_URI not set in environment variables.');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const user = await User.findOne({ email });
    if (user) {
      console.log('User found:', user);
    } else {
      console.log('User not found for email:', email);
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();