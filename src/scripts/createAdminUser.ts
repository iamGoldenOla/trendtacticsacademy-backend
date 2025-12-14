import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { hashPassword } from '../utils/password';

dotenv.config();

const adminUsers = [
  { name: 'Admin User', email: 'admin@trendtacticsacademy.com', password: 'AdminPassword123' },
  { name: 'Support', email: 'support@trendtactics.academy', password: 'AdminPassword123' },
  { name: 'Gmail Admin', email: 'trendtacticsacademy@gmail.com', password: 'AdminPassword123' },
  { name: 'Hello Academy', email: 'hello@trendtactics.academy', password: 'AdminPassword123' },
  { name: 'Hello Academy.com', email: 'hello@trendtacticsacademy.com', password: 'AdminPassword123' },
  { name: 'Support Academy.com', email: 'support@trendtacticsacademy.com', password: 'AdminPassword123' },
  { name: 'Info Academy', email: 'info@trendtactics.academy', password: 'AdminPassword123' },
  { name: 'Info Academy.com', email: 'info@trendtacticsacademy.com', password: 'AdminPassword123' },
  { name: 'Connect Academy', email: 'connect@trendtactics.academy', password: 'AdminPassword123' },
  { name: 'Connect Academy.com', email: 'connect@trendtacticsacademy.com', password: 'AdminPassword123' }
];

const MONGO_URI = process.env.MONGO_URI || '';
if (!MONGO_URI) {
  console.error('MONGO_URI not set in environment variables.');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    for (const admin of adminUsers) {
      const userExists = await User.findOne({ email: admin.email });
      if (userExists) {
        console.log('User already exists with this email:', admin.email);
        continue;
      }
      const hashedPassword = await hashPassword(admin.password);
      const user = await User.create({
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created:', user.email);
    }
    await mongoose.disconnect();
    console.log('Done creating admin users.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();