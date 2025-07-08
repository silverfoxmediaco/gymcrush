// File: seedUsersToMongo.js
// Path: src/backend/scripts/seedUsersToMongo.js

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI;

const start = async () => {
  try {
    if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const filePath = path.join(__dirname, 'fakeUsers.json');
    const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const inserted = await User.insertMany(users, { ordered: false });
    console.log(`✅ Inserted ${inserted.length} users into MongoDB`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

start();
