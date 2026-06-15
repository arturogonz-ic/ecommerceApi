import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin } from './admin-auth/model/Admin.js';

await mongoose.connect(process.env.MONGODB_URI);

const email = process.env.SEED_ADMIN_EMAIL;
const name = process.env.SEED_ADMIN_NAME;
const password = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);

await Admin.findOneAndUpdate(
  { email },
  { email, name, password },
  { upsert: true, new: true }
);

console.log(`Admin seeded: ${email}`);
await mongoose.disconnect();
