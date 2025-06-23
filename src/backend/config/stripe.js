// Stripe Configuration
// Path: src/backend/config/stripe.js
// Purpose: Initialize Stripe with secret key

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;