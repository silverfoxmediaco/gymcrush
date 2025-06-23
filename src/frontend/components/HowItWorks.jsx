import React from 'react';
import './HowItWorks.css';

const HowItWorks = ({ onStartPlanting }) => {  // Add the prop here
  const steps = [
    {
      number: "1",
      icon: "💪",
      title: "Build Your Profile",
      description: "Create a profile that shows your fitness journey and goals. Whether you're a gym rat or yoga enthusiast, be authentic.",
      hasButton: true,
      buttonText: "Start Building",
      buttonAction: onStartPlanting  // Change this line to use the prop
    },
    {
      number: "2",
      icon: "🔥",
      title: "Send Crushes",
      description: "When someone's fitness vibe matches yours, send them a crush. It's a confident way to show interest and see if the chemistry is mutual."
    },
    {
      number: "3",
      icon: "⚡",
      title: "Match & Connect",
      description: "If they crush back, it's a match! Start chatting about workout routines, fitness goals, or plan your first gym date."
    },
    {
      number: "4",
      icon: "🏆",
      title: "Crush Goals Together",
      description: "Build meaningful connections with people who share your passion for fitness. Find your workout partner, gym buddy, or something more."
    }
  ];

  return (
    <section className="how-it-works">
      <div className="container">
        <div className="how-it-works-header">
          <h2 className="section-title">How GymCrush Works</h2>
          <p className="section-subtitle text-muted">
            Where fitness meets romance - find someone who matches your energy
          </p>
        </div>
        
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="step-number">{step.number}</div>
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
              {step.hasButton && (
                <button 
                  className="step-action-btn" 
                  onClick={step.buttonAction}
                >
                  {step.buttonText}
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="how-it-works-footer">
          <p className="footer-text text-muted">
            No games. Just real connections with people who share your passion for fitness.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;