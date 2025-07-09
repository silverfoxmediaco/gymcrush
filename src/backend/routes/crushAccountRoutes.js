// Crush Account Routes
// Path: src/backend/routes/crushAccountRoutes.js
// Purpose: Define crush account subscription and purchase-related API endpoints

import express from 'express';
import {
  getAccountData,
  createCheckoutSession,
  createSubscription,
  addBonusCredits,
  refundPurchase,
  getPurchaseHistory,
  cancelSubscription
} from '../controllers/crushAccountController.js';

const router = express.Router();

// GET /api/crush-account/data - Get user's account status and purchase history
router.get('/data', getAccountData);

// GET /api/crush-account/history - Get detailed purchase/transaction history
router.get('/history', getPurchaseHistory);

// POST /api/crush-account/create-checkout - Create Stripe checkout session for account upgrade
router.post('/create-checkout', createCheckoutSession);

// POST /api/crush-account/create-subscription - Create Stripe subscription for crush account membership
router.post('/create-subscription', createSubscription);

// POST /api/crush-account/cancel-subscription - Cancel active subscription
router.post('/cancel-subscription', cancelSubscription);

// POST /api/crush-account/bonus - Add bonus credits (admin only)
router.post('/bonus', addBonusCredits);

// POST /api/crush-account/refund - Process refund (admin only)
router.post('/refund', refundPurchase);

export default router;