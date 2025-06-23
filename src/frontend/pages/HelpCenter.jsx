// HelpCenter Component
// Path: src/frontend/pages/HelpCenter.jsx
// Purpose: Comprehensive help center with categories, search, and mobile screenshots

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HelpCenter.css';

const HelpCenter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [helpfulVotes, setHelpfulVotes] = useState({});

  // Help categories with icons and colors
  const categories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: '🌱',
      color: '#B0C5A4',
      description: 'Everything you need to begin your journey'
    },
    {
      id: 'your-garden',
      name: 'Your Garden',
      icon: '🌸',
      color: '#E0AED0',
      description: 'Learn about seeds, matches, and connections'
    },
    {
      id: 'messages',
      name: 'Messages & Chat',
      icon: '💬',
      color: '#937DC2',
      description: 'Communicate with your matches'
    },
    {
      id: 'profile',
      name: 'Profile & Photos',
      icon: '📸',
      color: '#E0AED0',
      description: 'Make your profile shine'
    },
    {
      id: 'safety',
      name: 'Safety & Privacy',
      icon: '🛡️',
      color: '#937DC2',
      description: 'Stay safe while dating'
    },
    {
      id: 'account',
      name: 'Account & Billing',
      icon: '⚙️',
      color: '#B0C5A4',
      description: 'Manage your account and subscriptions'
    }
  ];

  // Help articles with mobile screenshots
  const articles = [
    // Getting Started
    {
      id: 'create-account',
      categoryId: 'getting-started',
      title: 'Creating Your Wallflower Account',
      description: 'Step-by-step guide to joining our community',
      readTime: '3 min',
      steps: [
        {
          title: 'Download and Open Wallflower',
          content: 'Start by downloading Wallflower from the App Store or visiting our website.',
          screenshot: '/src/assets/IMG_4369.png'
        },
        {
          title: 'Sign Up with Email',
          content: 'Tap "Start Your Garden" and enter your email address.',
          screenshot: 'src/frontend/assets/IMG_4355-portrait.png'
        },
        {
          title: 'Create Your Profile',
          content: 'Add your name, birthday, and a bit about yourself.',
          screenshot: 'src/frontend/assets/IMG_4348-portrait.png'
        }
      ]
    },
    {
      id: 'understanding-seeds',
      categoryId: 'getting-started',
      title: 'What Are Seeds?',
      description: 'Learn about our unique way of showing interest',
      readTime: '2 min',
      content: `Seeds are Wallflower's gentle way of expressing interest. When you send someone a seed, you're saying "I'd like to get to know you" without any pressure. You start with 5 free seeds!`,
      screenshot: 'src/frontend/assets/IMG_4349-portrait.png'
    },
    
    // Your Garden
    {
      id: 'sending-seeds',
      categoryId: 'your-garden',
      title: 'How to Send a Seed',
      description: 'Show interest in someone special',
      readTime: '2 min',
      steps: [
        {
          title: 'Browse Profiles',
          content: 'Swipe through profiles in the Garden view.',
          screenshot: 'src/frontend/assets/IMG_4347-portrait.png'
        },
        {
          title: 'Find Someone Interesting',
          content: 'When you find someone you like, tap their profile for more details.',
          screenshot: '/src/assets/IMG_4367.png'
        },
        {
          title: 'Send a Seed',
          content: 'Tap the seed button at the bottom of their profile. That\'s it!',
          screenshot: '/src/assets/IMG_4386.png',
          highlight: { x: 195, y: 600, width: 80, height: 80 }
        }
      ]
    },
    {
      id: 'mutual-seeds',
      categoryId: 'your-garden',
      title: 'When Seeds Match',
      description: 'What happens when interest is mutual',
      readTime: '2 min',
      content: 'When you and another person have sent each other seeds, it\'s a match! You\'ll both be notified and can start chatting.',
      screenshot: '/src/assets/IMG_4372.png'
    },
    
    // Messages
    {
      id: 'start-conversation',
      categoryId: 'messages',
      title: 'Starting Your First Conversation',
      description: 'Break the ice with confidence',
      readTime: '3 min',
      tips: [
        'Reference something from their profile',
        'Ask an open-ended question',
        'Be genuine and authentic',
        'Keep it light and friendly'
      ],
      screenshot: '/src/assets/IMG_4356.png'
    },
    {
      id: 'message-features',
      categoryId: 'messages',
      title: 'Message Features',
      description: 'Photos, voice notes, and more',
      readTime: '2 min',
      features: [
        { icon: '📷', title: 'Send Photos', desc: 'Share moments (costs 1 seed)' },
        { icon: '🎤', title: 'Voice Notes', desc: 'Add a personal touch' },
        { icon: '😊', title: 'Reactions', desc: 'React to messages with emojis' }
      ],
      screenshot: '/src/assets/IMG_4370.png'
    },
    
    // Profile & Photos
    {
      id: 'perfect-profile',
      categoryId: 'profile',
      title: 'Creating the Perfect Profile',
      description: 'Stand out while being authentic',
      readTime: '5 min',
      sections: [
        {
          title: 'Choose Great Photos',
          content: 'Use recent photos that show your genuine smile. Include a mix of close-ups and full body shots.',
          screenshot: '/src/assets/IMG_4379.png'
        },
        {
          title: 'Write a Compelling Bio',
          content: 'Share your interests, what makes you unique, and what you\'re looking for.',
          screenshot: '/src/assets/IMG_4378.png'
        },
        {
          title: 'Add Your Interests',
          content: 'Select interests that truly represent you. This helps find compatible matches.',
          screenshot: '/src/assets/IMG_4382.png'
        }
      ]
    },
    
    // Safety
    {
      id: 'stay-safe',
      categoryId: 'safety',
      title: 'Dating Safety Tips',
      description: 'Essential guidelines for safe dating',
      readTime: '4 min',
      safetyTips: [
        'Meet in public places for first dates',
        'Tell a friend about your plans',
        'Trust your instincts',
        'Video chat before meeting',
        'Never send money to matches'
      ]
    },
    {
      id: 'block-report',
      categoryId: 'safety',
      title: 'How to Block or Report',
      description: 'We\'re here to keep you safe',
      readTime: '2 min',
      steps: [
        {
          title: 'Access User Options',
          content: 'Tap the three dots on their profile or in chat.',
          screenshot: '/src/assets/IMG_4381.png'
        },
        {
          title: 'Choose Action',
          content: 'Select "Block User" or "Report" from the menu.',
          screenshot: '/src/assets/IMG_4377.png'
        }
      ]
    },
    
    // Account & Billing
    {
      id: 'subscription-benefits',
      categoryId: 'account',
      title: 'Subscription Benefits',
      description: 'Get unlimited seeds and more',
      readTime: '3 min',
      benefits: [
        { icon: '∞', title: 'Unlimited Seeds', desc: 'Never run out of ways to connect' },
        { icon: '👀', title: 'See Who Likes You', desc: 'Know who sent you seeds' },
        { icon: '🔄', title: 'Unlimited Rewinds', desc: 'Go back to profiles you passed' },
        { icon: '🌟', title: 'Priority Support', desc: 'Get help faster' }
      ],
      screenshot: '/src/assets/IMG_4374.png'
    }
  ];

  // Popular/trending articles
  const popularArticles = ['sending-seeds', 'perfect-profile', 'start-conversation', 'understanding-seeds'];

  // Filter articles based on search and category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || article.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle article selection
  const selectArticle = (articleId) => {
    const article = articles.find(a => a.id === articleId);
    setSelectedArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle helpful votes
  const handleHelpfulVote = (articleId, isHelpful) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [articleId]: isHelpful
    }));
  };

  // Back to categories
  const backToCategories = () => {
    setSelectedArticle(null);
  };

  // Render article content
  const renderArticleContent = (article) => {
    return (
      <div className="article-content">
        <button className="back-button" onClick={backToCategories}>
          ← Back to Help Center
        </button>
        
        <div className="article-header">
          <h1>{article.title}</h1>
          <p className="article-meta">
            <span className="read-time">📖 {article.readTime} read</span>
            <span className="category-tag" style={{ backgroundColor: categories.find(c => c.id === article.categoryId)?.color }}>
              {categories.find(c => c.id === article.categoryId)?.name}
            </span>
          </p>
        </div>

        {/* Simple content */}
        {article.content && (
          <div className="article-section">
            <p>{article.content}</p>
            {article.screenshot && (
              <div className="screenshot-container">
                <div className="device-frame">
                  <img src={article.screenshot} alt={article.title} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step-by-step content */}
        {article.steps && article.steps.map((step, index) => (
          <div key={index} className="article-step">
            <h3>Step {index + 1}: {step.title}</h3>
            <p>{step.content}</p>
            {step.screenshot && (
              <div className="screenshot-container">
                <div className="device-frame">
                  <img src={step.screenshot} alt={step.title} />
                  {step.highlight && (
                    <div 
                      className="highlight-circle"
                      style={{
                        top: step.highlight.y,
                        left: step.highlight.x,
                        width: step.highlight.width,
                        height: step.highlight.height
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Sections */}
        {article.sections && article.sections.map((section, index) => (
          <div key={index} className="article-section">
            <h3>{section.title}</h3>
            <p>{section.content}</p>
            {section.screenshot && (
              <div className="screenshot-container">
                <div className="device-frame">
                  <img src={section.screenshot} alt={section.title} />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Tips list */}
        {article.tips && (
          <div className="tips-section">
            <h3>Pro Tips:</h3>
            <ul className="tips-list">
              {article.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety tips */}
        {article.safetyTips && (
          <div className="safety-tips">
            <h3>Important Safety Guidelines:</h3>
            <ul className="safety-list">
              {article.safetyTips.map((tip, index) => (
                <li key={index}>
                  <span className="safety-icon">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features list */}
        {article.features && (
          <div className="features-grid">
            {article.features.map((feature, index) => (
              <div key={index} className="feature-card">
                <span className="feature-icon">{feature.icon}</span>
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Benefits */}
        {article.benefits && (
          <div className="benefits-section">
            <div className="benefits-grid">
              {article.benefits.map((benefit, index) => (
                <div key={index} className="benefit-card">
                  <span className="benefit-icon">{benefit.icon}</span>
                  <h4>{benefit.title}</h4>
                  <p>{benefit.desc}</p>
                </div>
              ))}
            </div>
            {article.screenshot && (
              <div className="screenshot-container">
                <div className="device-frame">
                  <img src={article.screenshot} alt="Subscription benefits" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Helpful section */}
        <div className="helpful-section">
          <h3>Was this article helpful?</h3>
          <div className="helpful-buttons">
            <button 
              className={`helpful-btn ${helpfulVotes[article.id] === true ? 'active' : ''}`}
              onClick={() => handleHelpfulVote(article.id, true)}
            >
              👍 Yes
            </button>
            <button 
              className={`helpful-btn ${helpfulVotes[article.id] === false ? 'active' : ''}`}
              onClick={() => handleHelpfulVote(article.id, false)}
            >
              👎 No
            </button>
          </div>
        </div>

        {/* Related articles */}
        <div className="related-articles">
          <h3>Related Articles</h3>
          <div className="related-grid">
            {articles
              .filter(a => a.categoryId === article.categoryId && a.id !== article.id)
              .slice(0, 3)
              .map(related => (
                <div 
                  key={related.id} 
                  className="related-card"
                  onClick={() => selectArticle(related.id)}
                >
                  <h4>{related.title}</h4>
                  <p>{related.description}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="help-center">
      {!selectedArticle ? (
        <>
          {/* Hero Section */}
          <div className="help-hero">
            <h1>How can we help you bloom? 🌸</h1>
            <p>Find answers and learn how to make the most of Wallflower</p>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="help-search"
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="popular-searches">
              <span>Popular: </span>
              {popularArticles.map(id => {
                const article = articles.find(a => a.id === id);
                return (
                  <button 
                    key={id}
                    className="popular-tag"
                    onClick={() => selectArticle(id)}
                  >
                    {article.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories Grid */}
          <div className="categories-section">
            <h2>Browse by Category</h2>
            <div className="categories-grid">
              {categories.map(category => (
                <div 
                  key={category.id}
                  className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{ borderColor: category.color }}
                >
                  <span className="category-icon" style={{ backgroundColor: category.color }}>
                    {category.icon}
                  </span>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <span className="article-count">
                    {articles.filter(a => a.categoryId === category.id).length} articles
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Articles List */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="articles-section">
              <div className="section-header">
                <h2>
                  {searchQuery ? `Search Results (${filteredArticles.length})` : 
                   selectedCategory !== 'all' ? categories.find(c => c.id === selectedCategory)?.name : 
                   'All Articles'}
                </h2>
                {(searchQuery || selectedCategory !== 'all') && (
                  <button 
                    className="clear-filters"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="articles-list">
                {filteredArticles.map(article => (
                  <div 
                    key={article.id}
                    className="article-card"
                    onClick={() => selectArticle(article.id)}
                  >
                    <div className="article-info">
                      <h3>{article.title}</h3>
                      <p>{article.description}</p>
                      <span className="article-meta">
                        {categories.find(c => c.id === article.categoryId)?.icon} · {article.readTime}
                      </span>
                    </div>
                    <span className="article-arrow">→</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Support */}
          <div className="contact-support">
            <h2>Still need help?</h2>
            <p>Our support team is here to help you bloom</p>
            <button 
              className="contact-button"
              onClick={() => navigate('/contact')}
            >
              Contact Support
            </button>
          </div>
        </>
      ) : (
        renderArticleContent(selectedArticle)
      )}
    </div>
  );
};

export default HelpCenter;