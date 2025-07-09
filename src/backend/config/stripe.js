// Stripe Configuration
// Path: src/backend/config/stripe.js
// Purpose: Initialize Stripe with secret key

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;