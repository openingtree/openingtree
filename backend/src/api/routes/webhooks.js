const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../../db/connection');
const logger = require('../../utils/logger');
const config = require('../../config');

/**
 * POST /api/v1/webhooks/stripe
 * Handle Stripe webhook events
 */
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.webhookSecret
    );
  } catch (err) {
    logger.error('Stripe webhook signature verification failed', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  logger.info('Stripe webhook received', { type: event.type });

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        logger.info('Unhandled webhook event', { type: event.type });
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing error', { error, event: event.type });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions
async function handleSubscriptionUpdate(subscription) {
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  // Determine tier based on price ID
  let tier = 'free';
  if (subscription.items.data[0]) {
    const priceId = subscription.items.data[0].price.id;
    if (priceId === config.stripe.prices.proMonthly || priceId === config.stripe.prices.proYearly) {
      tier = 'pro';
    } else if (priceId === config.stripe.prices.team) {
      tier = 'team';
    }
  }

  await db.query(
    `UPDATE users
     SET subscription_tier = $1,
         subscription_status = $2,
         stripe_subscription_id = $3,
         subscription_ends_at = $4,
         reports_limit = $5
     WHERE stripe_customer_id = $6`,
    [
      tier,
      status,
      subscriptionId,
      new Date(subscription.current_period_end * 1000),
      tier === 'pro' ? config.rateLimits.pro : config.rateLimits.team,
      customerId,
    ]
  );

  logger.info('Subscription updated', { customerId, tier, status });
}

async function handleSubscriptionCancelled(subscription) {
  const customerId = subscription.customer;

  await db.query(
    `UPDATE users
     SET subscription_status = 'cancelled',
         subscription_ends_at = $1
     WHERE stripe_customer_id = $2`,
    [new Date(subscription.current_period_end * 1000), customerId]
  );

  logger.info('Subscription cancelled', { customerId });
}

async function handlePaymentSucceeded(invoice) {
  const customerId = invoice.customer;
  const amount = invoice.amount_paid;

  // Record transaction
  const user = await db.findOne('users', { stripe_customer_id: customerId });

  if (user) {
    await db.insert('payment_transactions', {
      user_id: user.id,
      stripe_invoice_id: invoice.id,
      stripe_payment_intent_id: invoice.payment_intent,
      amount_cents: amount,
      currency: invoice.currency.toUpperCase(),
      description: invoice.description || 'Subscription payment',
      status: 'succeeded',
      subscription_tier: user.subscription_tier,
      billing_period_start: new Date(invoice.period_start * 1000),
      billing_period_end: new Date(invoice.period_end * 1000),
    });
  }

  logger.info('Payment succeeded', { customerId, amount });
}

async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;

  const user = await db.findOne('users', { stripe_customer_id: customerId });

  if (user) {
    await db.insert('payment_transactions', {
      user_id: user.id,
      stripe_invoice_id: invoice.id,
      amount_cents: invoice.amount_due,
      currency: invoice.currency.toUpperCase(),
      status: 'failed',
    });
  }

  logger.warn('Payment failed', { customerId });
}

module.exports = router;
