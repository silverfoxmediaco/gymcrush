// Crush Routes
// Path: src/backend/routes/crushRoutes.js
// Purpose: Define crush-related API endpoints

import express from 'express';
import { 
  getCrushes, 
  getCrushData,
  getCrushBalance,
  verifyApplePurchase,
  verifyAppleSubscription,
  verifyAndroidPurchase,
  verifyAndroidSubscription,
  verifyPurchase,
  verifySubscription,
  restorePurchases
} from '../controllers/crushController.js';
import * as crushAccountController from '../controllers/crushAccountController.js';

const router = express.Router();

// GET /api/crushes - Get user's crushes data
router.get('/', getCrushes);

// GET /api/crushes/data - Get crush balance and history
router.get('/data', getCrushData);

// ============ GENERIC IAP ROUTES (iOS & Android) ============
// These routes automatically detect platform and route to correct handler
router.post('/verify-purchase', verifyPurchase);
router.post('/verify-subscription', verifySubscription);
router.post('/restore-purchases', restorePurchases);

// ============ PLATFORM-SPECIFIC ROUTES (kept for backward compatibility) ============
// Apple In-App Purchase routes
router.post('/verify-apple-purchase', verifyApplePurchase);
router.post('/verify-apple-subscription', verifyAppleSubscription);

// Android In-App Purchase routes
router.post('/verify-android-purchase', verifyAndroidPurchase);
router.post('/verify-android-subscription', verifyAndroidSubscription);

// Balance check
router.get('/balance', getCrushBalance);

// ============ WEB PAYMENT ROUTES (Stripe) ============
// Payment and subscription routes (Stripe - for web only)
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