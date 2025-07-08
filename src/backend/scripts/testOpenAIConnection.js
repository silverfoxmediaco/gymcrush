// File: testOpenAIConnection.js
// Purpose: Confirm OpenAI DALL·E 3 image generation is working

import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const runTest = async () => {
  try {
    console.log('🔌 Sending test image prompt to OpenAI...');
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: 'A fit woman lifting weights in a modern gym, full-body, photorealistic',
      n: 1,
      size: '1024x1024'
    });

    const imageUrl = response.data[0]?.url;
    if (imageUrl) {
      console.log('✅ Success! OpenAI returned an image URL:');
      console.log(imageUrl);
    } else {
      console.log('⚠️ No image URL returned.');
    }
  } catch (err) {
    console.error('❌ OpenAI API test failed:', err.message);
  }
};

runTest();
