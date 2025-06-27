// Crush Routes
// Path: src/backend/routes/crushRoutes.js
// Purpose: Define crush-related API endpoints

const express = require('express');
const router = express.Router();
const { getCrushes, getCrushData } = require('../controllers/crushController');
const crushAccountController = require('../controllers/crushAccountController');

// GET /api/crushes - Get user's crushes data
router.get('/', getCrushes);

// GET /api/crushes/data - Get crush balance and history
router.get('/data', getCrushData);

// Payment and subscription routes
router.post('/create-checkout', crushAccountController.createCheckoutSession);
router.post('/create-subscription', crushAccountController.createSubscription);
router.post('/cancel-subscription', crushAccountController.cancelSubscription);
router.get('/account-data', crushAccountController.getAccountData);
router.get('/purchase-history', crushAccountController.getPurchaseHistory);

// Admin routes
router.post('/add-bonus', crushAccountController.addBonusCredits);
router.post('/refund', crushAccountController.refundPurchase);

// Stripe webhook (Note: This needs express.raw() middleware)
router.post('/webhook', express.raw({type: 'application/json'}), crushAccountController.handleStripeWebhook);

module.exports = router;