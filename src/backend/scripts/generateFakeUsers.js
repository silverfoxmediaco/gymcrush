// File: generateFakeUsers.js
// Purpose: Generate 50 realistic fake GymCrush users with photos: [] for DALL·E

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOTAL_USERS = 50;
const PASSWORD_HASH = '$2b$10$RnRG5qDLjZpXKPIJJbLWc.eaL6TyzGdfthKhokpnNnWwnHxV.45jC'; // "fakeuserpass"

const US_CITIES = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
  'Phoenix, AZ', 'Miami, FL', 'Seattle, WA', 'Denver, CO', 'Boston, MA',
  'Atlanta, GA', 'San Diego, CA', 'Dallas, TX', 'Austin, TX', 'Portland, OR'
];

const coordinatesByCity = {
  'New York, NY': [-74.006, 40.7128],
  'Los Angeles, CA': [-118.2437, 34.0522],
  'Chicago, IL': [-87.6298, 41.8781],
  'Houston, TX': [-95.3698, 29.7604],
  'Phoenix, AZ': [-112.074, 33.4484],
  'Miami, FL': [-80.1918, 25.7617],
  'Seattle, WA': [-122.3321, 47.6062],
  'Denver, CO': [-104.9903, 39.7392],
  'Boston, MA': [-71.0589, 42.3601],
  'Atlanta, GA': [-84.388, 33.749],
  'San Diego, CA': [-117.1611, 32.7157],
  'Dallas, TX': [-96.797, 32.7767],
  'Austin, TX': [-97.7431, 30.2672],
  'Portland, OR': [-122.6765, 45.5231]
};

const genders = ['Woman', 'Man'];
const bodyTypes = ['Slim', 'Athletic', 'Muscular', 'Fit', 'Toned', 'Curvy'];
const fitnessTags = ['fit', 'lifts', 'squats', 'runner', 'gymrat', 'hiit', 'trainer', 'beast'];
const interests = [
  'Weightlifting', 'CrossFit', 'Running', 'Cycling', 'Swimming', 'Yoga',
  'Pilates', 'Boxing', 'MMA', 'Rock Climbing', 'Hiking', 'Dance',
  'Bodybuilding', 'Powerlifting', 'HIIT', 'Calisthenics', 'Group Classes'
];
const goals = ['Long-term relationship', 'Workout partner', 'Something casual', 'New gym buddies'];
const gymFrequencies = ['3-4x_week', '5-6x_week', 'daily'];
const fitnessLevels = ['beginner', 'intermediate', 'advanced', 'athlete'];

const usedUsernames = new Set();
const fakeUsers = [];

for (let i = 0; i < TOTAL_USERS; i++) {
  const gender = i < Math.floor(TOTAL_USERS * 0.7) ? 'Woman' : 'Man';
  const firstName = faker.person.firstName(gender === 'Woman' ? 'female' : 'male');
  const lastName = faker.person.lastName();

  let username;
  do {
    const tag = faker.helpers.arrayElement(fitnessTags);
    const number = faker.number.int({ min: 1, max: 99 });
    username = `${firstName.toLowerCase()}_${tag}${number}`;
  } while (usedUsernames.has(username));
  usedUsernames.add(username);

  const email = faker.internet.email({ firstName, lastName }).toLowerCase();
  const dateOfBirth = faker.date.birthdate({ min: 18, max: 45, mode: 'age' });
  const location = faker.helpers.arrayElement(US_CITIES);
  const coords = coordinatesByCity[location] || [-118.2437, 34.0522];
  const userInterests = faker.helpers.arrayElements(interests, 3);

  const user = {
    email,
    password: PASSWORD_HASH,
    username,
    dateOfBirth,
    isVerified: true,
    crushBalance: 5,
    accountTier: 'free',
    hasActiveSubscription: false,
    profile: {
      age: Math.floor((new Date() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)),
      gender,
      height: `${faker.number.int({ min: 60, max: 76 })} inches`,
      bodyType: faker.helpers.arrayElement(bodyTypes),
      location,
      coordinates: {
        type: 'Point',
        coordinates: coords
      },
      locationType: 'manual',
      bio: faker.lorem.sentences(2),
      interests: userInterests,
      fitnessLevel: faker.helpers.arrayElement(fitnessLevels),
      gymFrequency: faker.helpers.arrayElement(gymFrequencies),
      lookingFor: faker.helpers.arrayElement(goals),
      photos: [], // ✅ let DALL·E + Cloudinary handle it
      prompts: [
        {
          question: "What's your favorite post-workout snack?",
          answer: faker.lorem.words(5)
        },
        {
          question: "What motivates you to hit the gym?",
          answer: faker.lorem.sentence()
        }
      ]
    }
  };

  fakeUsers.push(user);
}

fs.writeFileSync(path.join(__dirname, 'fakeUsers.json'), JSON.stringify(fakeUsers, null, 2));
console.log(`✅ ${TOTAL_USERS} fake users saved to fakeUsers.json`);
