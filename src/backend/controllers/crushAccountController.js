// Crush Account Controller
// Path: src/backend/controllers/crushAccountController.js
// Purpose: Handle crush account subscription operations and Stripe integration

const User = require('../models/User');
const CrushTransaction = require('../models/CrushTransaction');
const stripe = require('../config/stripe');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
 const token = req.headers.authorization?.split(' ')[1];
 
 if (!token) {
   return res.status(401).json({ success: false, message: 'No token provided' });
 }
 
 try {
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   req.userId = decoded.userId;
   next();
 } catch (error) {
   return res.status(401).json({ success: false, message: 'Invalid token' });
 }
};

// Create Stripe subscription
exports.createSubscription = [verifyToken, async (req, res) => {
 try {
   const user = await User.findById(req.userId);
   
   if (!user) {
     return res.status(404).json({ 
       success: false, 
       message: 'User not found' 
     });
   }
   
   // Check if user already has active subscription
   if (user.subscription && user.subscription.status === 'active') {
     return res.status(400).json({ 
       success: false, 
       message: 'You already have an active subscription' 
     });
   }
   
   // Create or retrieve Stripe customer
   let customerId = user.stripeCustomerId;
   
   if (!customerId) {
     const customer = await stripe.customers.create({
       email: user.email,
       metadata: {
         userId: user._id.toString(),
         username: user.username
       }
     });
     
     customerId = customer.id;
     user.stripeCustomerId = customerId;
     await user.save();
   }
   
   // Create checkout session for subscription
   const session = await stripe.checkout.sessions.create({
     customer: customerId,
     payment_method_types: ['card'],
     line_items: [
       {
         price_data: {
           currency: 'usd',
           product_data: {
             name: 'Unlimited Membership',
             description: 'Unlimited crushes every month.',
             metadata: {
               stripeProductId: 'prod_SYP2rzDQ9RMS1c'
             }
           },
           unit_amount: 2999, // $29.99
           recurring: {
             interval: 'month'
           }
         },
         quantity: 1,
       },
     ],
     mode: 'subscription',
     success_url: `${process.env.CLIENT_URL}/profile?subscription=success`,
     cancel_url: `${process.env.CLIENT_URL}/profile?subscription=cancelled`,
     metadata: {
       userId: req.userId,
       type: 'unlimited',
       stripeProductId: 'prod_SYP2rzDQ9RMS1c'
     }
   });
   
   res.json({ 
     success: true, 
     url: session.url,
     sessionId: session.id 
   });
 } catch (error) {
   console.error('Create subscription error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Failed to create subscription' 
   });
 }
}];

// Cancel subscription
exports.cancelSubscription = [verifyToken, async (req, res) => {
 try {
   const user = await User.findById(req.userId);
   
   if (!user || !user.subscription || !user.subscription.stripeSubscriptionId) {
     return res.status(404).json({ 
       success: false, 
       message: 'No active subscription found' 
     });
   }
   
   // Cancel at period end (user keeps access until end of billing period)
   const subscription = await stripe.subscriptions.update(
     user.subscription.stripeSubscriptionId,
     { cancel_at_period_end: true }
   );
   
   // Update user record
   user.subscription.cancelAtPeriodEnd = true;
   await user.save();
   
   // Create transaction record
   await CrushTransaction.create({
     userId: req.userId,
     type: 'subscription_cancelled',
     subscriptionTier: user.subscription.tier,
     change: 'deactivated',
     statusAfter: 'free',
     description: 'Subscription cancelled - will end at period end',
     subscriptionDetails: {
       periodEnd: new Date(subscription.current_period_end * 1000)
     }
   });
   
   res.json({
     success: true,
     message: 'Subscription will be cancelled at the end of the billing period',
     endsAt: new Date(subscription.current_period_end * 1000)
   });
 } catch (error) {
   console.error('Cancel subscription error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Failed to cancel subscription' 
   });
 }
}];

// Get account data
exports.getAccountData = [verifyToken, async (req, res) => {
 try {
   const user = await User.findById(req.userId).select('username subscription accountTier crushes');
   
   if (!user) {
     return res.status(404).json({ 
       success: false, 
       message: 'User not found' 
     });
   }
   
   // Get current subscription status
   const currentStatus = await CrushTransaction.getUserCurrentStatus(req.userId);
   
   // Get recent transactions (last 10)
   const history = await CrushTransaction.find({ userId: req.userId })
     .sort({ createdAt: -1 })
     .limit(10);
   
   // Format history for frontend
   const formattedHistory = history.map(transaction => ({
     _id: transaction._id,
     type: transaction.type,
     tier: transaction.subscriptionTier,
     action: transaction.action,
     createdAt: transaction.createdAt,
     description: transaction.description,
     paymentAmount: transaction.paymentAmount
   }));
   
   // Count crushes sent today for limit tracking
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   const crushesToday = user.crushes.sent.filter(crush => 
     new Date(crush.sentAt) >= today
   ).length;
   
   res.json({
     success: true,
     accountStatus: currentStatus,
     crushesToday: crushesToday,
     history: formattedHistory,
     subscriptionEndDate: currentStatus.periodEnd
   });
 } catch (error) {
   console.error('Get account data error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Failed to retrieve account data' 
   });
 }
}];

// Get detailed purchase history
exports.getPurchaseHistory = [verifyToken, async (req, res) => {
 try {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 20;
   const skip = (page - 1) * limit;
   
   const totalCount = await CrushTransaction.countDocuments({ userId: req.userId });
   
   const history = await CrushTransaction.find({ userId: req.userId })
     .sort({ createdAt: -1 })
     .skip(skip)
     .limit(limit);
   
   res.json({
     success: true,
     history: history,
     pagination: {
       currentPage: page,
       totalPages: Math.ceil(totalCount / limit),
       totalItems: totalCount,
       itemsPerPage: limit
     }
   });
 } catch (error) {
   console.error('Get purchase history error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Failed to retrieve purchase history' 
   });
 }
}];

// Create Stripe checkout session (for one-time crush purchases)
exports.createCheckoutSession = [verifyToken, async (req, res) => {
 try {
   const { packageId, crushes, amount } = req.body;
   
   // Validate package
   const validPackages = {
     starter: { 
       crushes: 5, 
       price: 499,  // $4.99
       stripeProductId: 'prod_SYP4Y5Q1yJaXmg',
       name: 'Starter Pack',
       description: '5 crushes perfect for testing your skillset.'
     },
     power: { 
       crushes: 15, 
       price: 999,  // $9.99
       stripeProductId: 'prod_SYP4RQaXWifAek',
       name: 'Power Pack',
       description: '15 crushes Most popular choice.'
     },
     athlete: { 
       crushes: 30, 
       price: 1499,  // $14.99
       stripeProductId: 'prod_SYP5cwrymqYSPt',
       name: 'Athlete Bundle',
       description: '30 Crushes best value for active daters.'
     },
     champion: { 
       crushes: 60, 
       price: 2499,  // $24.99
       stripeProductId: 'prod_SYP6NwJdoTrAOI',
       name: 'Champion Bundle',
       description: '60 Crushes - You are just wanting to have fun.'
     }
   };
   
   if (!validPackages[packageId]) {
     return res.status(400).json({ 
       success: false, 
       message: 'Invalid package selected' 
     });
   }
   
   const selectedPackage = validPackages[packageId];
   
   // Verify price matches
   if (selectedPackage.crushes !== crushes || selectedPackage.price !== Math.round(amount * 100)) {
     return res.status(400).json({ 
       success: false, 
       message: 'Package details do not match' 
     });
   }
   
   // Create Stripe checkout session with price_data
   const session = await stripe.checkout.sessions.create({
     payment_method_types: ['card'],
     line_items: [
       {
         price_data: {
           currency: 'usd',
           product_data: {
             name: selectedPackage.name,
             description: selectedPackage.description,
             images: ['https://www.gymcrush.io/crush-icon.png'], // Update with your icon URL
             metadata: {
               stripeProductId: selectedPackage.stripeProductId
             }
           },
           unit_amount: selectedPackage.price, // Price in cents
         },
         quantity: 1,
       },
     ],
     mode: 'payment',
     success_url: `${process.env.CLIENT_URL}/profile?payment=success&crushes=${crushes}`,
     cancel_url: `${process.env.CLIENT_URL}/profile?payment=cancelled`,
     metadata: {
       userId: req.userId,
       packageId: packageId,
       crushes: crushes.toString(),
       stripeProductId: selectedPackage.stripeProductId
     }
   });
   
   res.json({ 
     success: true, 
     url: session.url,
     sessionId: session.id 
   });
 } catch (error) {
   console.error('Create checkout session error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Failed to create checkout session' 
   });
 }
}];

// Handle Stripe webhook
exports.handleStripeWebhook = async (req, res) => {
 const sig = req.headers['stripe-signature'];
 const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
 
 let event;
 
 try {
   // Verify webhook signature
   event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
 } catch (error) {
   console.error('Webhook signature verification failed:', error);
   return res.status(400).send(`Webhook Error: ${error.message}`);
 }
 
 // Handle the event
 switch (event.type) {
   case 'checkout.session.completed':
     const session = event.data.object;
     
     try {
       if (session.mode === 'subscription') {
         // Handle subscription creation
         const subscription = await stripe.subscriptions.retrieve(session.subscription);
         const userId = session.metadata.userId;
         
         await User.findByIdAndUpdate(userId, {
           accountTier: 'unlimited',
           crushBalance: 999999, // Changed from 'crushes.available' to 'crushBalance'
           hasActiveSubscription: true,
           subscriptionEndDate: new Date(subscription.current_period_end * 1000),
           subscription: {
             stripeSubscriptionId: subscription.id,
             stripeCustomerId: subscription.customer,
             status: subscription.status,
             tier: 'unlimited',
             currentPeriodEnd: new Date(subscription.current_period_end * 1000),
             cancelAtPeriodEnd: subscription.cancel_at_period_end
           }
         });
         
         // Create transaction record
         await CrushTransaction.create({
           userId: userId,
           type: 'subscription_started',
           subscriptionTier: 'unlimited',
           change: 'activated',
           statusAfter: 'unlimited',
           description: 'Unlimited membership activated',
           stripeSessionId: session.id,
           stripeSubscriptionId: subscription.id,
           paymentAmount: session.amount_total / 100,
           subscriptionDetails: {
             plan: 'monthly',
             tier: 'unlimited',
             periodStart: new Date(subscription.current_period_start * 1000),
             periodEnd: new Date(subscription.current_period_end * 1000),
             features: ['Unlimited crushes', 'All features']
           }
         });
         
         console.log(`Unlimited subscription activated for user ${userId}`);
       } else {
         // Handle one-time crush purchase
         const { userId, packageId, crushes } = session.metadata;
         const crushCount = parseInt(crushes);
         
         const user = await User.findByIdAndUpdate(
           userId,
           { $inc: { crushBalance: crushCount } }, // Changed from 'crushes.available' to 'crushBalance'
           { new: true }
         );
         
         if (!user) {
           console.error('User not found for crush purchase:', userId);
           return res.status(404).json({ error: 'User not found' });
         }
         
         await CrushTransaction.create({
           userId: userId,
           type: 'purchased',
           amount: crushCount,
           change: crushCount,
           balanceAfter: user.crushBalance, // Changed from user.crushes.available
           description: `Purchased ${crushCount} crushes - ${packageId} pack`,
           stripeSessionId: session.id,
           paymentAmount: session.amount_total / 100
         });
         
         console.log(`Successfully added ${crushCount} crushes to user ${userId}`);
       }
     } catch (error) {
       console.error('Error processing successful payment:', error);
       return res.status(500).json({ error: 'Failed to process payment' });
     }
     break;
     
   case 'customer.subscription.updated':
     const subscription = event.data.object;
     
     try {
       const user = await User.findOneAndUpdate(
         { stripeCustomerId: subscription.customer },
         {
           'subscription.status': subscription.status,
           'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
           'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
           hasActiveSubscription: subscription.status === 'active',
           subscriptionEndDate: new Date(subscription.current_period_end * 1000)
         },
         { new: true }
       );
       
       // Check if subscription renewed
       if (subscription.status === 'active' && !subscription.cancel_at_period_end) {
         await CrushTransaction.create({
           userId: user._id,
           type: 'subscription_renewed',
           subscriptionTier: user.subscription.tier,
           change: 'renewed',
           statusAfter: user.subscription.tier,
           description: 'Subscription renewed successfully',
           stripeSubscriptionId: subscription.id,
           paymentAmount: subscription.items.data[0].price.unit_amount / 100,
           subscriptionDetails: {
             plan: 'monthly',
             tier: user.subscription.tier,
             periodStart: new Date(subscription.current_period_start * 1000),
             periodEnd: new Date(subscription.current_period_end * 1000)
           }
         });
       }
       
       console.log(`Subscription updated for customer ${subscription.customer}`);
     } catch (error) {
       console.error('Error updating subscription:', error);
     }
     break;
     
   case 'customer.subscription.deleted':
     const deletedSubscription = event.data.object;
     
     try {
       const user = await User.findOneAndUpdate(
         { stripeCustomerId: deletedSubscription.customer },
         {
           accountTier: 'free',
           hasActiveSubscription: false,
           'subscription.status': 'cancelled',
           'subscription.cancelledAt': new Date()
         },
         { new: true }
       );
       
       await CrushTransaction.create({
         userId: user._id,
         type: 'subscription_cancelled',
         subscriptionTier: user.subscription.tier,
         change: 'deactivated',
         statusAfter: 'free',
         description: 'Subscription ended',
         stripeSubscriptionId: deletedSubscription.id
       });
       
       console.log(`Subscription cancelled for customer ${deletedSubscription.customer}`);
     } catch (error) {
       console.error('Error handling subscription deletion:', error);
     }
     break;
     
   default:
     console.log(`Unhandled event type ${event.type}`);
 }
 
 // Return a 200 response to acknowledge receipt of the event
 res.status(200).json({ received: true });
};

// Add bonus credits (admin function)
exports.addBonusCredits = [verifyToken, async (req, res) => {
 try {
   const { userId, tier, duration, reason } = req.body;
   
   // TODO: Add admin role check here
   
   if (!userId || !tier || !duration) {
     return res.status(400).json({ 
       success: false, 
       message: 'Invalid user ID, tier, or duration' 
     });
   }
   
   const endDate = new Date();
   endDate.setDate(endDate.getDate() + duration);
   
   // Update user's account tier
   const user = await User.findByIdAndUpdate(
     userId,
     { 
       accountTier: tier,
       'subscription.tier': tier,
       'subscription.currentPeriodEnd': endDate
     },
     { new: true }
   );
   
   if (!user) {
     return res.status(404).json({ 
       success: false, 
       message: 'User not found' 
     });
   }
   
   // Create transaction record
   await CrushTransaction.create({
     userId: userId,
     type: 'bonus',
     subscriptionTier: tier,
     change: 'bonus_applied',
     statusAfter: tier,
     description: reason || `Bonus ${tier} access for ${duration} days`,
     addedBy: req.userId,
     subscriptionDetails: {
       tier: tier,
       periodEnd: endDate,
       features: getFeaturesByTier(tier)
     }
   });
   
   res.json({
     success: true,
     message: `Successfully granted ${tier} access for ${duration} days`,
     expiresAt: endDate
   });
 } catch (error) {
   console.error('Add bonus credits error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Failed to add bonus access' 
   });
 }
}];

// Process refund (admin function)
exports.refundPurchase = [verifyToken, async (req, res) => {
 try {
   const { userId, transactionId, reason } = req.body;
   
   // TODO: Add admin role check here
   
   if (!userId || !transactionId) {
     return res.status(400).json({ 
       success: false, 
       message: 'Invalid user ID or transaction ID' 
     });
   }
   
   // Find the original transaction
   const originalTransaction = await CrushTransaction.findById(transactionId);
   
   if (!originalTransaction || originalTransaction.userId.toString() !== userId) {
     return res.status(404).json({ 
       success: false, 
       message: 'Transaction not found' 
     });
   }
   
   // Create refund record
   await CrushTransaction.create({
     userId: userId,
     type: 'refund',
     subscriptionTier: originalTransaction.subscriptionTier,
     change: 'refunded',
     statusAfter: 'free',
     description: reason || `Refund processed for transaction ${transactionId}`,
     addedBy: req.userId,
     metadata: {
       originalTransactionId: transactionId
     }
   });
   
   // Downgrade user to free tier
   await User.findByIdAndUpdate(userId, {
     accountTier: 'free',
     'subscription.status': 'cancelled'
   });
   
   res.json({
     success: true,
     message: 'Refund processed successfully'
   });
 } catch (error) {
   console.error('Process refund error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Failed to process refund' 
   });
 }
}];

// Helper function to get features by tier
function getFeaturesByTier(tier) {
 const features = {
   basic: ['15 crushes per day', 'Basic filters', 'See who liked you'],
   premium: ['50 crushes per day', 'Advanced filters', 'Send images', 'Priority visibility'],
   elite: ['Unlimited crushes', 'All features', 'Profile boost', 'Exclusive badges'],
   unlimited: ['Unlimited crushes', 'All features', 'Profile boost', 'Priority matching']
 };
 
 return features[tier] || [];
}