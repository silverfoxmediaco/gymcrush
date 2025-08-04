// MockProfilesManager Component
// Path: src/frontend/components/admin/MockProfilesManager.jsx
// Purpose: Create mock profiles from the UI (admin tool)

import React, { useState } from 'react';
import './MockProfilesManager.css';

const MockProfilesManager = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const mockProfiles = [
    {
      email: 'bookwormbee@example.com',
      password: 'password123',
      username: 'BookwormBee',
      dateOfBirth: new Date('1996-03-15'),
      profile: {
        age: 28,
        height: "5'6\"",
        bodyType: 'Average',
        location: 'Austin, TX',
        bio: 'Introvert who loves cozy bookstores and quiet coffee shops. Looking for someone to share comfortable silences and deep conversations with.',
        interests: ['Reading', 'Creative Writing', 'Indie Films', 'Tea Collection', 'Yoga'],
        personalityType: 'INFJ',
        lookingFor: 'Long-term relationship',
        gender: 'Female',
        prompts: [
          {
            question: "My ideal Sunday morning involves...",
            answer: "Coffee, a good book, and rain pattering against the window"
          },
          {
            question: "I geek out about...",
            answer: "First edition books and indie bookstore finds"
          }
        ]
      }
    },
    {
      email: 'gardensoul@example.com',
      password: 'password123',
      username: 'GardenSoul',
      dateOfBirth: new Date('1992-07-22'),
      profile: {
        age: 32,
        height: "5'4\"",
        bodyType: 'Fit',
        location: 'Portland, OR',
        bio: 'Plant mom and sunset chaser. I find peace in my garden and joy in farmers markets. Seeking someone who appreciates life\'s quiet moments.',
        interests: ['Gardening', 'Cooking', 'Hiking', 'Photography', 'Meditation'],
        personalityType: 'ISFP',
        lookingFor: 'Long-term relationship',
        gender: 'Female',
        prompts: [
          {
            question: "My happy place is...",
            answer: "In my garden at sunrise, hands in the soil, birds singing"
          },
          {
            question: "The way to my heart is...",
            answer: "Through homegrown tomatoes and genuine conversation"
          }
        ]
      }
    },
    {
      email: 'stargazer@example.com',
      password: 'password123',
      username: 'LunaStargazer',
      dateOfBirth: new Date('1994-11-30'),
      profile: {
        age: 30,
        height: "5'7\"",
        bodyType: 'Slim',
        location: 'Denver, CO',
        bio: 'Amateur astronomer and professional daydreamer. I love quiet nights under the stars and deep conversations about the universe.',
        interests: ['Astronomy', 'Physics', 'Science Fiction', 'Hiking', 'Documentary Films'],
        personalityType: 'INTP',
        lookingFor: 'Something casual',
        gender: 'Female',
        prompts: [
          {
            question: "I'm convinced that...",
            answer: "We're all made of stardust, literally and figuratively"
          },
          {
            question: "After work you'll find me...",
            answer: "Setting up my telescope or reading Carl Sagan"
          }
        ]
      }
    },
    {
      email: 'teatime@example.com',
      password: 'password123',
      username: 'RoseTea',
      dateOfBirth: new Date('1995-02-14'),
      profile: {
        age: 29,
        height: "5'3\"",
        bodyType: 'Curvy',
        location: 'Seattle, WA',
        bio: 'Tea enthusiast and mindfulness practitioner. I believe in slow living, meaningful connections, and the perfect cup of oolong.',
        interests: ['Tea Collection', 'Mindfulness', 'Journaling', 'Pottery', 'Slow Living'],
        personalityType: 'ISFJ',
        lookingFor: 'Long-term relationship',
        gender: 'Female',
        prompts: [
          {
            question: "My love language is...",
            answer: "Quality time over a warm cup of tea"
          },
          {
            question: "I'm looking for someone who...",
            answer: "Values quiet companionship and mindful moments"
          }
        ]
      }
    },
    {
      email: 'pixelartist@example.com',
      password: 'password123',
      username: 'PixelPrincess',
      dateOfBirth: new Date('1993-08-05'),
      profile: {
        age: 31,
        height: "5'5\"",
        bodyType: 'Average',
        location: 'San Francisco, CA',
        bio: 'Indie game developer and pixel art creator. I find joy in retro games, quiet coding sessions, and cozy game nights.',
        interests: ['Video Games', 'Pixel Art', 'Board Games', 'Anime', 'Lo-fi Music'],
        personalityType: 'INTJ',
        lookingFor: 'Not sure yet',
        gender: 'Female',
        prompts: [
          {
            question: "My ideal date involves...",
            answer: "Co-op gaming, homemade pizza, and no pressure to talk constantly"
          },
          {
            question: "Two truths and a lie...",
            answer: "I've beaten Dark Souls blindfolded, I own 200+ board games, I've never broken a controller"
          }
        ]
      }
    },
    {
      email: 'forestwalker@example.com',
      password: 'password123',
      username: 'WillowWhisper',
      dateOfBirth: new Date('1991-05-18'),
      profile: {
        age: 33,
        height: "5'8\"",
        bodyType: 'Athletic',
        location: 'Burlington, VT',
        bio: 'Nature photographer and trail guide. I find solace in forest paths and believe the best conversations happen on quiet hikes.',
        interests: ['Photography', 'Hiking', 'Birdwatching', 'Environmental Conservation', 'Camping'],
        personalityType: 'INFP',
        lookingFor: 'Long-term relationship',
        gender: 'Female',
        prompts: [
          {
            question: "You'll win me over by...",
            answer: "Appreciating silence in nature and respecting wildlife"
          },
          {
            question: "My most irrational fear is...",
            answer: "Crowded shopping malls during the holidays"
          }
        ]
      }
    },
    {
      email: 'vinylvibes@example.com',
      password: 'password123',
      username: 'VelvetVinyl',
      dateOfBirth: new Date('1990-12-03'),
      profile: {
        age: 34,
        height: "5'9\"",
        bodyType: 'Slim',
        location: 'Nashville, TN',
        bio: 'Record collector and coffee shop regular. I appreciate good music, better coffee, and the best kind of comfortable silence.',
        interests: ['Vinyl Records', 'Jazz Music', 'Coffee', 'Writing', 'Vintage Shopping'],
        personalityType: 'ISTP',
        lookingFor: 'Long-term relationship',
        gender: 'Female',
        prompts: [
          {
            question: "My happy place is...",
            answer: "A quiet record store on a rainy afternoon"
          },
          {
            question: "I'm looking for someone who...",
            answer: "Appreciates analog things in a digital world"
          }
        ]
      }
    },
    {
      email: 'moonbaker@example.com',
      password: 'password123',
      username: 'MoonlightBaker',
      dateOfBirth: new Date('1996-09-27'),
      profile: {
        age: 28,
        height: "5'2\"",
        bodyType: 'Curvy',
        location: 'Boston, MA',
        bio: 'Night owl baker who finds peace in 3am sourdough sessions. Looking for someone who appreciates fresh bread and quiet mornings.',
        interests: ['Baking', 'Cooking', 'Food Photography', 'Farmers Markets', 'Ceramics'],
        personalityType: 'ESFP',
        lookingFor: 'Long-term relationship',
        gender: 'Female',
        prompts: [
          {
            question: "The way to my heart is...",
            answer: "Appreciating my 4am baking experiments without judgment"
          },
          {
            question: "My ideal Sunday morning involves...",
            answer: "Fresh croissants, good coffee, and nowhere to be"
          }
        ]
      }
    },
    {
      email: 'oceandreamer@example.com',
      password: 'password123',
      username: 'CoralDreamer',
      dateOfBirth: new Date('1997-01-10'),
      profile: {
        age: 27,
        height: "5'6\"",
        bodyType: 'Fit',
        location: 'San Diego, CA',
        bio: 'Marine biologist and aquarium enthusiast. I find peace watching fish swim and could talk about ocean conservation for hours.',
        interests: ['Marine Biology', 'Aquariums', 'Scuba Diving', 'Documentary Films', 'Beach Walks'],
        personalityType: 'ISTJ',
        lookingFor: 'Something casual',
        gender: 'Female',
        prompts: [
          {
            question: "I geek out about...",
            answer: "Coral reef ecosystems and sustainable fishkeeping"
          },
          {
            question: "Perfect date idea...",
            answer: "Aquarium visit followed by quiet beach picnic at sunset"
          }
        ]
      }
    },
    {
      email: 'origamimind@example.com',
      password: 'password123',
      username: 'PaperCraneSoul',
      dateOfBirth: new Date('1995-06-20'),
      profile: {
        age: 29,
        height: "5'4\"",
        bodyType: 'Slim',
        location: 'Chicago, IL',
        bio: 'Paper artist and meditation teacher. I believe in the beauty of patience, the art of folding, and the power of quiet focus.',
        interests: ['Origami', 'Meditation', 'Japanese Culture', 'Minimalism', 'Green Tea'],
        personalityType: 'INFJ',
        lookingFor: 'Long-term relationship',
        gender: 'Female',
        prompts: [
          {
            question: "I'm convinced that...",
            answer: "There's meditation in repetitive crafts and peace in paper cranes"
          },
          {
            question: "You'll win me over by...",
            answer: "Having patience for my thousand paper crane project"
          }
        ]
      }
    }
  ];

  const handleCreateProfiles = async () => {
    setShowConfirm(false);
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/create-mock-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profiles: mockProfiles })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Success! Created ${data.created} profiles, skipped ${data.skipped} existing profiles.`);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating profiles:', error);
      setMessage('Failed to create profiles. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mock-profiles-manager">
      <div className="container">
        <h1>Mock Profiles Manager</h1>
        <p className="subtitle">Create test profiles for development</p>

        <div className="profiles-preview">
          <h2>Profiles to Create:</h2>
          <div className="profiles-grid">
            {mockProfiles.map((profile, index) => (
              <div key={index} className="profile-preview-card">
                <h3>{profile.username}</h3>
                <p>{profile.profile.age} • {profile.profile.location}</p>
                <p className="bio-preview">{profile.profile.bio.substring(0, 100)}...</p>
                <div className="interests-preview">
                  {profile.profile.interests.slice(0, 3).map((interest, i) => (
                    <span key={i} className="interest-chip">{interest}</span>
                  ))}
                  {profile.profile.interests.length > 3 && (
                    <span className="more-interests">+{profile.profile.interests.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('Success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {!showConfirm ? (
          <button 
            className="btn btn-primary create-btn"
            onClick={() => setShowConfirm(true)}
            disabled={loading}
          >
            {loading ? 'Creating...' : `Create ${mockProfiles.length} Mock Profiles`}
          </button>
        ) : (
          <div className="confirm-section">
            <p>Are you sure you want to create these {mockProfiles.length} mock profiles?</p>
            <div className="confirm-buttons">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateProfiles}
              >
                Yes, Create Profiles
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockProfilesManager;