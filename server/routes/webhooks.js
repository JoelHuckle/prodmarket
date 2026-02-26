/**
 * routes/webhooks.js
 * Stripe webhook handlers with signature verification
 */

const express = require("express");
const router = express.Router();
const stripe = require("../config/stripe");
const { Order, Transaction } = require("../models");
const auditLog = require("../utils/auditLog");

// Stripe webhook signature secret
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_WEBHOOK_SECRET) {
  console.warn("⚠️  STRIPE_WEBHOOK_SECRET not configured. Webhooks will fail.");
}

/**
 * Verify Stripe webhook signature
 * Prevents webhook spoofing by verifying signature from Stripe
 */
const verifyWebhookSignature = (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).json({
      success: false,
      error: "Missing stripe-signature header",
    });
  }

  try {
    // CRITICAL: Must use raw body buffer, not parsed JSON
    const event = stripe.webhooks.constructEvent(
      req.rawBody || req.body,
      sig,
      STRIPE_WEBHOOK_SECRET,
    );

    req.stripeEvent = event;
    next();
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    auditLog.logSecurityEvent(
      "webhook_signature_verification_failed",
      null,
      err.message,
      req,
    );
    return res.status(400).json({
      success: false,
      error: "Webhook signature verification failed",
    });
  }
};

// Apply signature verification to all webhook routes
router.use(verifyWebhookSignature);

/**
 * Handle payment_intent.succeeded
 * Called when payment is successful (after 3D Secure, etc.)
 */
const handlePaymentIntentSucceeded = async (event, req) => {
  const paymentIntent = event.data.object;
  const { service_id, buyer_id, seller_id } = paymentIntent.metadata;

  console.log(`✓ Payment succeeded: ${paymentIntent.id}`);

  // Check if order already exists for this payment
  const existingOrder = await Order.findOne({
    where: { stripe_payment_intent_id: paymentIntent.id },
  });

  if (existingOrder) {
    console.log(`Order ${existingOrder.id} already created for this payment`);
    return;
  }

  // Note: Order creation is typically handled by confirmPayment endpoint
  // This webhook is for async confirmation (e.g., 3D Secure)
  auditLog.logPaymentCreated(
    buyer_id,
    service_id,
    paymentIntent.amount / 100,
    paymentIntent.id,
    req,
  );
};

/**
 * Handle payment_intent.payment_failed
 * Called when payment fails
 */
const handlePaymentIntentFailed = async (event, req) => {
  const paymentIntent = event.data.object;
  const { order_id, buyer_id } = paymentIntent.metadata;

  console.error(`✗ Payment failed: ${paymentIntent.id}`);
  console.error(
    `Failure message: ${paymentIntent.last_payment_error?.message}`,
  );

  // If order exists, mark as cancelled
  if (order_id) {
    const order = await Order.findByPk(order_id);
    if (order && order.status !== "cancelled") {
      order.status = "cancelled";
      order.cancelled_at = new Date();
      await order.save();

      auditLog.logOrderStatusChange(
        order_id,
        order.status,
        "cancelled",
        buyer_id,
        req,
      );
    }
  }

  auditLog.logSecurityEvent(
    "payment_failed",
    buyer_id,
    paymentIntent.last_payment_error?.message,
    req,
  );
};

/**
 * Handle charge.refunded
 * Called when a charge is refunded
 */
const handleChargeRefunded = async (event, req) => {
  const charge = event.data.object;
  const paymentIntentId = charge.payment_intent;

  console.log(
    `⟳ Charge refunded: ${charge.id} (Payment Intent: ${paymentIntentId})`,
  );

  // Find order by payment intent
  const order = await Order.findOne({
    where: { stripe_payment_intent_id: paymentIntentId },
  });

  if (order) {
    order.status = "refunded";
    order.cancelled_at = new Date();
    await order.save();

    // Create refund transaction
    await Transaction.create({
      order_id: order.id,
      buyer_id: order.buyer_id,
      seller_id: order.seller_id,
      type: "refund",
      amount: charge.amount_refunded / 100,
      platform_fee: 0,
      stripe_payment_id: paymentIntentId,
      status: "completed",
    });

    auditLog.logOrderStatusChange(
      order.id,
      "completed",
      "refunded",
      order.buyer_id,
      req,
    );
  }
};

/**
 * Main webhook endpoint
 * @route   POST /api/webhooks/stripe
 * @access  Public (signature verified)
 */
router.post("/stripe", async (req, res) => {
  const event = req.stripeEvent;

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event, req);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event, req);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event, req);
        break;

      // Add more event handlers as needed
      // case "charge.dispute.created":
      //   await handleDisputeCreated(event);
      //   break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Always respond with 200 to acknowledge receipt
    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    auditLog.logSecurityEvent("webhook_processing_error", null, error.message, req);

    // Still return 200 to prevent retries
    res.json({ received: true, error: error.message });
  }
});

module.exports = router;
