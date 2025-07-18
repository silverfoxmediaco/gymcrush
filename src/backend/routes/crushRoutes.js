// Crush Routes
// Path: src/backend/routes/crushRoutes.js
// Purpose: Define crush-related API endpoints

import express from 'express';
import { getCrushes, getCrushData } from '../controllers/crushController.js';
import * as crushAccountController from '../controllers/crushAccountController.js';

const router = express.Router();

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

export default router;