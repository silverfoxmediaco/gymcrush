// Crush Mock Profiles Script
// Path: src/backend/scripts/crushMockProfiles.js
// Purpose: Create mock female user profiles for testing

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const mockProfiles = [
  {
    email: 'fitnessfiona@example.com',
    password: 'password123',
    username: 'FitnessFiona',
    dateOfBirth: new Date('1996-03-15'),
    profile: {
      age: 28,
      height: "5'6\"",
      bodyType: 'Athletic',
      location: 'Austin, TX',
      bio: 'Personal trainer who loves early morning runs and post-workout smoothies. Looking for someone to spot me in life and at the gym.',
      interests: ['Running', 'Weight Training', 'Nutrition', 'Hiking', 'Yoga'],
      fitnessLevel: 'advanced',
      workoutPreferences: ['strength', 'running', 'yoga'],
      gymFrequency: '5-6x_week',
      lookingFor: 'Long-term relationship',
      gender: 'Female',
      photos: [{
        url: '/assets/images/fitnesswomantakingselfie.png',
        publicId: 'mock_fitnessfiona_1',
        isMain: true,
        displayMode: 'cover'
      }],
      prompts: [
        {
          question: "My ideal Sunday morning involves...",
          answer: "5K run at sunrise followed by protein pancakes"
        },
        {
          question: "I geek out about...",
          answer: "New workout routines and tracking my PRs"
        }
      ]
    }
  },
  {
    email: 'yogayara@example.com',
    password: 'password123',
    username: 'YogaYara',
    dateOfBirth: new Date('1992-07-22'),
    profile: {
      age: 32,
      height: "5'4\"",
      bodyType: 'Slim',
      location: 'Portland, OR',
      bio: 'Yoga instructor and meditation enthusiast. Seeking someone who values mindfulness and morning sun salutations.',
      interests: ['Yoga', 'Meditation', 'Rock Climbing', 'Healthy Cooking', 'Trail Running'],
      fitnessLevel: 'intermediate',
      workoutPreferences: ['yoga', 'climbing', 'running'],
      gymFrequency: 'daily',
      lookingFor: 'Long-term relationship',
      gender: 'Female',
      photos: [{
        url: '/assets/images/ellemai.png',
        publicId: 'mock_yogayara_1',
        isMain: true,
        displayMode: 'cover'
      }],
      prompts: [
        {
          question: "My happy place is...",
          answer: "On my mat at 6am, finding my flow"
        },
        {
          question: "The way to my heart is...",
          answer: "Through partner yoga and green smoothies"
        }
      ]
    }
  },
  {
    email: 'crossfitcara@example.com',
    password: 'password123',
    username: 'CrossfitCara',
    dateOfBirth: new Date('1994-11-30'),
    profile: {
      age: 30,
      height: "5'7\"",
      bodyType: 'Muscular',
      location: 'Denver, CO',
      bio: 'CrossFit competitor and Olympic lifting enthusiast. Looking for someone who gets excited about PRs and protein shakes.',
      interests: ['CrossFit', 'Olympic Lifting', 'Meal Prep', 'Mountain Biking', 'Recovery'],
      fitnessLevel: 'athlete',
      workoutPreferences: ['crossfit', 'strength'],
      gymFrequency: '5-6x_week',
      lookingFor: 'Something casual',
      gender: 'Female',
      photos: [{
        url: '/assets/images/eishapateltreadmill.png',
        publicId: 'mock_crossfitcara_1',
        isMain: true,
        displayMode: 'cover'
      }],
      prompts: [
        {
          question: "I'm convinced that...",
          answer: "Rest days are just as important as training days"
        },
        {
          question: "After work you'll find me...",
          answer: "At the box, working on my snatch technique"
        }
      ]
    }
  },
  {
    email: 'spinningsarah@example.com',
    password: 'password123',
    username: 'SpinningSarah',
    dateOfBirth: new Date('1995-02-14'),
    profile: {
      age: 29,
      height: "5'3\"",
      bodyType: 'Fit',
      location: 'Seattle, WA',
      bio: 'Spin instructor by day, marathon runner by weekend. Love the endorphin rush and post-workout brunch dates.',
      interests: ['Cycling', 'Marathon Running', 'HIIT', 'Smoothie Bowls', 'Athleisure'],
      fitnessLevel: 'advanced',
      workoutPreferences: ['cycling', 'running', 'cardio'],
      gymFrequency: '5-6x_week',
      lookingFor: 'Long-term relationship',
      gender: 'Female',
      photos: [{
        url: '/assets/images/ellemaibikini.png',
        publicId: 'mock_spinningsarah_1',
        isMain: true,
        displayMode: 'cover'
      }],
      prompts: [
        {
          question: "My love language is...",
          answer: "Workout dates and recovery day cuddles"
        },
        {
          question: "I'm looking for someone who...",
          answer: "Can keep up on a bike and slow down for brunch"
        }
      ]
    }
  },
  {
    email: 'powerlifterpam@example.com',
    password: 'password123',
    username: 'PowerlifterPam',
    dateOfBirth: new Date('1993-08-05'),
    profile: {
      age: 31,
      height: "5'5\"",
      bodyType: 'Muscular',
      location: 'San Francisco, CA',
      bio: 'Competitive powerlifter who loves heavy squats and deadlifts. Seeking a gym partner who appreciates strong women.',
      interests: ['Powerlifting', 'Strength Training', 'Mobility Work', 'Protein Cooking', 'Sports Massage'],
      fitnessLevel: 'athlete',
      workoutPreferences: ['strength', 'powerlifting'],
      gymFrequency: '5-6x_week',
      lookingFor: 'Not sure yet',
      gender: 'Female',
      photos: [{
        url: '/assets/images/emmar.png',
        publicId: 'mock_powerlifterpam_1',
        isMain: true,
        displayMode: 'cover'
      }],
      prompts: [
        {
          question: "My ideal date involves...",
          answer: "Gym session followed by all-you-can-eat sushi"
        },
        {
          question: "Two truths and a lie...",
          answer: "I can deadlift 2x my bodyweight, I hate cardio, I've never skipped leg day"
        }
      ]
    }
  },
  {
    email: 'trailrunnertina@example.com',
    password: 'password123',
    username: 'TrailRunnerTina',
    dateOfBirth: new Date('1991-05-18'),
    profile: {
      age: 33,
      height: "5'8\"",
      bodyType: 'Lean',
      location: 'Burlington, VT',
      bio: 'Ultra marathon runner and nature lover. Looking for someone to explore trails and share post-run recovery smoothies.',
      interests: ['Trail Running', 'Hiking', 'Camping', 'Nutrition', 'Foam Rolling'],
      fitnessLevel: 'advanced',
      workoutPreferences: ['running', 'outdoor', 'hiking'],
      gymFrequency: '3-4x_week',
      lookingFor: 'Long-term relationship',
      gender: 'Female',
      photos: [{
        url: '/assets/images/abigail.png',
        publicId: 'mock_trailrunnertina_1',
        isMain: true,
        displayMode: 'cover'
      }],
      prompts: [
        {
          question: "You'll win me over by...",
          answer: "Joining me for sunrise trail runs and coffee after"
        },
        {
          question: "My most irrational fear is...",
          answer: "Treadmills - give me trails or give me death!"
        }
      ]
    }
  },
  {
    email: 'boxingbella@example.com',
    password: 'password123',
    username: 'BoxingBella',
    dateOfBirth: new Date('1990-12-03'),
    profile: {
      age: 34,
      height: "5'9\"",
      bodyType: 'Athletic',
      location: 'Nashville, TN',
      bio: 'Amateur boxer and kickboxing instructor. I appreciate discipline, dedication, and someone who can hold the pads.',
      interests: ['Boxing', 'Kickboxing', 'MMA', 'Jump Rope', 'Recovery'],
      fitnessLevel: 'advanced',
      workoutPreferences: ['martial_arts', 'cardio', 'strength'],
      gymFrequency: '5-6x_week',
      lookingFor: 'Long-term relationship',
      gender: 'Female',
      photos: [{
        url: '/assets/images/ginger.png',
        publicId: 'mock_boxingbella_1',
        isMain: true,
        displayMode: 'cover'
      }],
      prompts: [
        {
          question: "My happy place is...",
          answer: "In the ring, gloves on, mind clear"
        },
        {
          question: "I'm looking for someone who...",
          answer: "Respects the grind and celebrates small victories"
        }
      ]
    }
  },
  {
    email: 'dancerdiana@example.com',
    password: 'password123',
    username: 'DancerDiana',
    dateOfBirth: new Date('1996-09-27'),
    profile: {
      age: 28,
      height: "5'2\"",
      bodyType: 'Toned',
      location: 'Boston, MA',
      bio: 'Dance fitness instructor who finds joy in movement. Looking for someone who isn\'t afraid to dance like nobody\'s watching.',
      interests: ['Dance', 'Zumba', 'Barre', 'Pilates', 'Stretching'],
      fitnessLevel: 'intermediate',
      workoutPreferences: ['dance', 'cardio', 'yoga'],
      gymFrequency: 'daily',
      lookingFor: 'Long-term relationship',
      gender: 'Female',
      photos: [{
        url: '/assets/images/chloegymselfie.png',
        publicId: 'mock_dancerdiana_1',
        isMain: true,
        displayMode: 'cover'
      }],
      prompts: [
        {
          question: "The way to my heart is...",
          answer: "Dancing in the kitchen while cooking healthy meals"
        },
        {
          question: "My ideal Sunday morning involves...",
          answer: "Dance cardio class followed by farmers market adventures"
        }
      ]
    }
  },
  {
    email: 'gymguymarcus@example.com',
    password: 'password123',
    username: 'GymGuyMarcus',
    dateOfBirth: new Date('1992-04-15'),
    profile: {
      age: 32,
      height: "6'1\"",
      bodyType: 'Muscular',
      location: 'Los Angeles, CA',
      bio: 'Bodybuilder and nutrition coach. Looking for someone who understands meal prep Sundays and 5am gym sessions.',
      interests: ['Bodybuilding', 'Meal Prep', 'Supplements', 'Beach Volleyball', 'Cooking'],
      fitnessLevel: 'athlete',
      workoutPreferences: ['strength', 'bodybuilding'],
      gymFrequency: '5-6x_week',
      lookingFor: 'Long-term relationship',
      gender: 'Male',
      photos: [{
        url: '/assets/images/marcusjohnson.png',
        publicId: 'mock_gymguymarcus_1',
        isMain: true,
        displayMode: 'cover'
      }],
      prompts: [
        {
          question: "My ideal partner...",
          answer: "Knows that chicken, rice, and broccoli is a love language"
        },
        {
          question: "On rest days you'll find me...",
          answer: "Meal prepping and planning next week's workouts"
        }
      ]
    }
  },
  {
    email: 'fitdavid@example.com',
    password: 'password123',
    username: 'FitDavid',
    dateOfBirth: new Date('1994-09-22'),
    profile: {
      age: 30,
      height: "5'10\"",
      bodyType: 'Athletic',
      location: 'New York, NY',
      bio: 'Calisthenics enthusiast and rock climber. Seeking someone who values functional fitness and outdoor adventures.',
      interests: ['Calisthenics', 'Rock Climbing', 'Parkour', 'Hiking', 'Photography'],
      fitnessLevel: 'advanced',
      workoutPreferences: ['calisthenics', 'climbing', 'outdoor'],
      gymFrequency: '3-4x_week',
      lookingFor: 'Something casual',
      gender: 'Male',
      photos: [{
        url: '/assets/images/davidkim.png',
        publicId: 'mock_fitdavid_1',
        isMain: true,
        displayMode: 'cover'
      }],
      prompts: [
        {
          question: "My perfect weekend includes...",
          answer: "Outdoor climb on Saturday, meal prep and recovery on Sunday"
        },
        {
          question: "I get excited about...",
          answer: "Finally nailing that muscle-up or conquering a new climbing route"
        }
      ]
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Optional: Clear existing mock users (be careful with this!)
    // await User.deleteMany({ email: { $regex: '@example.com' } });

    // Create users
    let created = 0;
    let skipped = 0;

    for (const mockUser of mockProfiles) {
      const existingUser = await User.findOne({ email: mockUser.email });
      
      if (!existingUser) {
        await User.create(mockUser);
        console.log(`Created user: ${mockUser.username}`);
        created++;
      } else {
        console.log(`Skipped existing user: ${mockUser.username}`);
        skipped++;
      }
    }

    console.log(`\nSeeding complete!`);
    console.log(`Created: ${created} users`);
    console.log(`Skipped: ${skipped} existing users`);
    console.log(`Total: ${mockProfiles.length} users in database`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the seeding function
seedDatabase();