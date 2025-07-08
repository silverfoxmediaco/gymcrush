// File: generateProfileImages.js
// Path: src/backend/scripts/generateProfileImages.js

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import cloudinary from 'cloudinary';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from '../models/User.js'; // Ensure ES module export

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Setup Cloudinary ---
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Setup OpenAI ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_USERS = 50;
const skippedUsers = [];

const promptTemplates = [
  ({ gender, bodyType }) => `Full-body photo of a fit ${gender.toLowerCase()} with a ${bodyType.toLowerCase()} body type, in stylish gym wear, standing confidently in a modern gym, photorealistic`,
  ({ gender }) => `Athletic ${gender.toLowerCase()} doing a workout in a brightly lit gym, showing strong form and posture, full-body, energetic tone`,
  ({ gender }) => `Portrait of a smiling ${gender.toLowerCase()} after a workout, casual gym outfit, modern gym background, high realism`
];

const generatePrompt = (profile) => {
  const template = promptTemplates[Math.floor(Math.random() * promptTemplates.length)];
  return template(profile);
};

const downloadImage = async (url, filePath) => {
  const writer = fs.createWriteStream(filePath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

const uploadToCloudinary = async (localPath, userId) => {
  const result = await cloudinary.v2.uploader.upload(localPath, {
    folder: 'gymcrush/profiles',
    public_id: `user_${userId}_${Date.now()}`
  });
  return result.secure_url;
};

const updateUserWithImage = async (user, imageUrl) => {
  user.profile.photos = [
    {
      url: imageUrl,
      isMain: true,
      displayMode: 'cover',
      uploadedAt: new Date()
    }
  ];
  await user.save();
};

const run = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB');

    const users = await User.find({ 'profile.photos.0.url': { $exists: false } }).limit(MAX_USERS);
    console.log(`👥 Found ${users.length} users to update`);

    for (const user of users) {
      const { gender, bodyType } = user.profile;
      if (!gender || !bodyType) {
        console.log(`⚠️ Skipping user ${user._id} due to missing gender/bodyType`);
        skippedUsers.push({ userId: user._id, reason: 'missing profile info' });
        continue;
      }

      const prompt = generatePrompt(user.profile);
      console.log(`🎨 Generating image for ${user.username} with prompt:\n"${prompt}"`);

      try {
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1024x1024'
        });

        const imageUrl = response.data[0].url;
        if (!imageUrl) throw new Error('No image URL returned');

        const tempFile = path.join(__dirname, `temp_${user._id}.jpg`);
        await downloadImage(imageUrl, tempFile);

        const cloudinaryUrl = await uploadToCloudinary(tempFile, user._id);
        fs.unlinkSync(tempFile); // clean up temp file

        await updateUserWithImage(user, cloudinaryUrl);
        console.log(`✅ Updated user ${user.username} with Cloudinary image`);

      } catch (err) {
        console.error(`❌ Failed to process user ${user.username}: ${err.message}`);
        skippedUsers.push({ userId: user._id, username: user.username, reason: err.message });
      }
    }

    // Write skipped log
    if (skippedUsers.length > 0) {
      const logPath = path.join(__dirname, 'skippedUsers.json');
      fs.writeFileSync(logPath, JSON.stringify(skippedUsers, null, 2));
      console.log(`⚠️ ${skippedUsers.length} users skipped. Logged to skippedUsers.json`);
    }

    console.log('🏁 Done.');
    process.exit(0);

  } catch (err) {
    console.error('❌ Script error:', err);
    process.exit(1);
  }
};

run();
