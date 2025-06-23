// CrushComponent
// Path: src/frontend/components/crushes/CrushComponent.jsx
// Purpose: Manage crush balance, history, and purchases

import React, { useState, useEffect } from 'react';
import './CrushComponent.css';

const CrushComponent = ({ isEmbedded = false }) => {
 const [crushData, setCrushData] = useState({
   balance: 0,
   history: [],
   packages: [],
   hasActiveSubscription: false,
   subscriptionEndDate: null
 });
 const [loading, setLoading] = useState(true);
 const [purchasing, setPurchasing] = useState(false);
 const [selectedPackage, setSelectedPackage] = useState(null);
 const [activeTab, setActiveTab] = useState('balance');

 // Crush packages available for purchase
 const crushPackages = [
   {
     id: 'starter',
     name: 'Starter Pack',
     crushes: 5,
     price: 4.99,
     popular: false,
     description: 'Perfect for testing the waters'
   },
   {
     id: 'power',
     name: 'Power Pack',
     crushes: 15,
     price: 9.99,
     popular: true,
     description: 'Most popular choice',
     savings: '33% off'
   },
   {
     id: 'athlete',
     name: 'Athlete Bundle',
     crushes: 30,
     price: 14.99,
     popular: false,
     description: 'Best value for active users',
     savings: '50% off'
   },
   {
     id: 'champion',
     name: 'Champion Bundle',
     crushes: 60,
     price: 24.99,
     popular: false,
     description: 'For serious fitness daters',
     savings: '58% off'
   }
 ];

 useEffect(() => {
   loadCrushData();
 }, []);

 const loadCrushData = async () => {
   try {
     const token = localStorage.getItem('token');
     const response = await fetch('/api/crushes/data', {
       headers: {
         'Authorization': `Bearer ${token}`
       }
     });

     const data = await response.json();
     if (data.success) {
       setCrushData({
         balance: data.balance || 0,
         history: data.history || [],
         packages: crushPackages,
         hasActiveSubscription: data.hasActiveSubscription || false,
         subscriptionEndDate: data.subscriptionEndDate || null
       });
     }
   } catch (error) {
     console.error('Error loading crush data:', error);
   } finally {
     setLoading(false);
   }
 };

 const handlePurchase = async (packageId) => {
   setPurchasing(true);
 
   try {
     const token = localStorage.getItem('token');
     
     // Handle subscription FIRST
     if (packageId === 'unlimited') {
       setSelectedPackage({ id: 'unlimited' });
       
       const response = await fetch('/api/crushes/create-subscription', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({})
       });
 
       const data = await response.json();
       
       if (data.success && data.url) {
         window.location.href = data.url;
       } else {
         alert(data.message || 'Failed to create subscription');
       }
     } else {
       // Regular one-time purchase
       const selectedPkg = crushPackages.find(pkg => pkg.id === packageId);
       if (!selectedPkg) {
         setPurchasing(false);
         return;
       }
 
       setSelectedPackage(selectedPkg);
 
       const response = await fetch('/api/crushes/create-checkout', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({
           packageId: packageId,
           crushes: selectedPkg.crushes,
           amount: selectedPkg.price
         })
       });
 
       const data = await response.json();
       
       if (data.success && data.url) {
         window.location.href = data.url;
       } else {
         alert(data.message || 'Failed to create checkout session');
       }
     }
   } catch (error) {
     console.error('Purchase error:', error);
     alert('Something went wrong. Please try again.');
   } finally {
     setPurchasing(false);
     setSelectedPackage(null);
   }
 };

 const handleCancelSubscription = async () => {
   if (!window.confirm('Are you sure you want to cancel your subscription? You will keep access until the end of your billing period.')) {
     return;
   }

   try {
     const token = localStorage.getItem('token');
     const response = await fetch('/api/crushes/cancel-subscription', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
       }
     });

     const data = await response.json();
     
     if (data.success) {
       alert(`Subscription cancelled. You have access until ${new Date(data.endsAt).toLocaleDateString()}`);
       loadCrushData(); // Refresh the data
     } else {
       alert(data.message || 'Failed to cancel subscription');
     }
   } catch (error) {
     console.error('Cancel subscription error:', error);
     alert('Failed to cancel subscription');
   }
 };

 const formatDate = (dateString) => {
   const date = new Date(dateString);
   return date.toLocaleDateString('en-US', {
     month: 'short',
     day: 'numeric',
     year: 'numeric',
     hour: '2-digit',
     minute: '2-digit'
   });
 };

 const getActionIcon = (action) => {
   switch (action) {
     case 'sent':
       return '💪';
     case 'received':
       return '📥';
     case 'purchased':
       return '💳';
     case 'bonus':
       return '🎁';
     case 'refund':
       return '↩️';
     default:
       return '🔥';
   }
 };

 if (loading) {
   return (
     <div className="crush-component-container">
       <div className="loading">Loading crush data...</div>
     </div>
   );
 }

 return (
   <div className={`crush-component-container ${isEmbedded ? 'embedded' : ''}`}>
     {!isEmbedded && (
       <div className="crush-header">
         <h2>My Crushes</h2>
         <p className="crush-subtitle">Make your move and find your swolemate</p>
       </div>
     )}

     {/* Tab Navigation */}
     <div className="crush-tabs">
       <button 
         className={`tab-button ${activeTab === 'balance' ? 'active' : ''}`}
         onClick={() => setActiveTab('balance')}
       >
         Balance & Purchase
       </button>
       <button 
         className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
         onClick={() => setActiveTab('history')}
       >
         History
       </button>
     </div>

     {/* Balance & Purchase Tab */}
     {activeTab === 'balance' && (
       <div className="crush-content">
         {/* Current Balance */}
         <div className="balance-section">
           <div className="balance-card">
             <div className="balance-icon">💪</div>
             <div className="balance-info">
               <h3>Current Balance</h3>
               <p className="balance-number">{crushData.hasActiveSubscription ? '∞' : crushData.balance}</p>
               <p className="balance-label">
                 {crushData.hasActiveSubscription ? 'Unlimited Member' : 'crushes available'}
               </p>
               {crushData.hasActiveSubscription && crushData.subscriptionEndDate && (
                 <p className="subscription-info">
                   Active until {new Date(crushData.subscriptionEndDate).toLocaleDateString()}
                 </p>
               )}
             </div>
           </div>
           <div className="balance-tips">
             <h4>How crushes work:</h4>
             <ul>
               <li>New members get 5 free crushes to start</li>
               <li>Send a crush to show you're interested</li>
               <li>When they crush you back, it's a match!</li>
               <li>Each crush can only be used once</li>
               <li>Purchase more crushes or go unlimited anytime</li>
             </ul>
           </div>
         </div>

         {/* Purchase Packages */}
         <div className="purchase-section">
           <h3>Get More Crushes</h3>
           <p className="purchase-subtitle">Fuel your fitness dating journey</p>
           
           {/* Welcome message for new users */}
           {crushData.balance === 5 && crushData.history.length === 0 && (
             <div className="welcome-message">
               <span className="welcome-icon">🎉</span>
               <p>Welcome to GymCrush! You've received 5 free crushes to start crushing it!</p>
               <p className="welcome-subtitle">Use them to connect with fellow fitness enthusiasts!</p>
             </div>
           )}
           
           {/* Unlimited Membership Option */}
           <div className="membership-card">
             <div className="membership-header">
               <h4>Unlimited Membership</h4>
               <span className="best-value-badge">Beast Mode</span>
             </div>
             <div className="membership-content">
               <div className="membership-price">
                 <span className="price-amount">$29.99</span>
                 <span className="price-period">/month</span>
               </div>
               <ul className="membership-benefits">
                 <li>Unlimited crushes every month</li>
                 <li>Connect with as many gym partners as you want</li>
                 <li>Priority customer support</li>
                 <li>Cancel anytime</li>
               </ul>
               <button 
                 className="purchase-button membership-button"
                 onClick={() => handlePurchase('unlimited')}
                 disabled={purchasing || crushData.hasActiveSubscription}
               >
                 {crushData.hasActiveSubscription ? (
                   <span>Currently Active</span>
                 ) : purchasing && selectedPackage?.id === 'unlimited' ? (
                   <span className="purchasing">Processing...</span>
                 ) : (
                   <span>Start Membership</span>
                 )}
               </button>
               {crushData.hasActiveSubscription && (
                 <>
                   <button 
                     className="manage-subscription-link"
                     onClick={() => window.location.href = '/profile/subscription'}
                   >
                     Manage Subscription
                   </button>
                   <button 
                     className="cancel-subscription-link"
                     onClick={handleCancelSubscription}
                     style={{ 
                       marginTop: '8px', 
                       width: '100%',
                       background: 'transparent', 
                       border: '1px solid #ff6b6b', 
                       color: '#ff6b6b',
                       padding: '8px 16px',
                       borderRadius: '999px',
                       fontSize: '0.875rem',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease',
                       fontFamily: 'var(--font-primary)'
                     }}
                     onMouseOver={(e) => {
                       e.target.style.background = '#ff6b6b';
                       e.target.style.color = 'white';
                     }}
                     onMouseOut={(e) => {
                       e.target.style.background = 'transparent';
                       e.target.style.color = '#ff6b6b';
                     }}
                   >
                     Cancel Subscription
                   </button>
                 </>
               )}
             </div>
           </div>

           <div className="or-divider">
             <span>or</span>
           </div>
           
           <h4 className="one-time-header">One-Time Crush Packages</h4>
           <div className="packages-grid">
             {crushPackages.map(pkg => (
               <div 
                 key={pkg.id} 
                 className={`package-card ${pkg.popular ? 'popular' : ''}`}
               >
                 {pkg.popular && <span className="popular-badge">Most Popular</span>}
                 {pkg.savings && <span className="savings-badge">{pkg.savings}</span>}
                 
                 <h4>{pkg.name}</h4>
                 <div className="package-crushes">
                   <span className="crush-count">{pkg.crushes}</span>
                   <span className="crush-label">crushes</span>
                 </div>
                 <p className="package-price">${pkg.price}</p>
                 <p className="package-description">{pkg.description}</p>
                 <p className="price-per-crush">
                   ${(pkg.price / pkg.crushes).toFixed(2)} per crush
                 </p>
                 <button 
                   className="purchase-button"
                   onClick={() => handlePurchase(pkg.id)}
                   disabled={purchasing}
                 >
                   {purchasing && selectedPackage?.id === pkg.id ? (
                     <span className="purchasing">Processing...</span>
                   ) : (
                     <span>Purchase</span>
                   )}
                 </button>
               </div>
             ))}
           </div>

           <div className="payment-info">
             <p>🔒 Secure payment via Stripe</p>
             <p>Crushes are added instantly after purchase</p>
           </div>
         </div>
       </div>
     )}

     {/* History Tab */}
     {activeTab === 'history' && (
       <div className="crush-content">
         <div className="history-section">
           <h3>Crush History</h3>
           {crushData.history.length > 0 ? (
             <div className="history-list">
               {crushData.history.map(item => (
                 <div key={item._id} className="history-item">
                   <div className="history-icon">
                     {getActionIcon(item.action)}
                   </div>
                   <div className="history-details">
                     <p className="history-action">
                       {item.action === 'sent' && `Sent crush to ${item.recipientName || 'user'}`}
                       {item.action === 'received' && `Received crush from ${item.senderName || 'user'}`}
                       {item.action === 'purchased' && `Purchased ${item.amount} crushes`}
                       {item.action === 'bonus' && `Received ${item.amount} bonus crushes`}
                       {item.action === 'refund' && `Refunded ${item.amount} crushes`}
                     </p>
                     <p className="history-date">{formatDate(item.createdAt)}</p>
                   </div>
                   <div className="history-amount">
                     <span className={`amount ${item.change > 0 ? 'positive' : 'negative'}`}>
                       {item.change > 0 ? '+' : ''}{item.change}
                     </span>
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="empty-history">
               <span className="empty-icon">📜</span>
               <p>No crush activity yet</p>
               <p className="empty-subtitle">Start sending crushes to build your history!</p>
             </div>
           )}
         </div>
       </div>
     )}
   </div>
 );
};

export default CrushComponent;