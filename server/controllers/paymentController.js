// controllers/paymentController.js
const stripe = require("../config/stripe");
const { Order, Service, User, Transaction } = require("../models");

// Platform fee percentage (8%)
const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT) || 8;

/**
 * Calculate amounts for a transaction
 * @param {Number} servicePrice - Service price
 * @returns {Object} - Amount breakdown
 */
const calculateAmounts = (servicePrice) => {
  const amount = parseFloat(servicePrice);
  const platformFee = (amount * PLATFORM_FEE_PERCENT) / 100;
  const sellerAmount = amount - platformFee;

  return {
    amount: amount.toFixed(2),
    platformFee: platformFee.toFixed(2),
    sellerAmount: sellerAmount.toFixed(2),
  };
};

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { service_id, idempotency_key } = req.body;

    if (!service_id) {
      return res.status(400).json({
        success: false,
        error: "Service ID is required",
      });
    }

    // Generate or use provided idempotency key for retry safety
    const key = idempotency_key || `${req.user.id}-${service_id}-${Date.now()}`;

    // Get service details
    const service = await Service.findByPk(service_id, {
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "stripe_account_id"],
        },
      ],
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    if (!service.is_active) {
      return res.status(400).json({
        success: false,
        error: "Service is not available",
      });
    }

    // Calculate amounts
    const amounts = calculateAmounts(service.price);

    // Determine if this is a collaboration (needs escrow)
    const isCollaboration = service.type === "collaboration";

    // Create payment intent
    const paymentIntentData = {
      amount: Math.round(parseFloat(amounts.amount) * 100), // Convert to cents
      currency: "usd",
      metadata: {
        service_id: service.id,
        buyer_id: req.user.id,
        seller_id: service.seller_id,
        service_type: service.type,
        platform_fee: amounts.platformFee,
        seller_amount: amounts.sellerAmount,
        idempotency_key: key,
      },
      description: `Purchase: ${service.title}`,
    };

    // For collaborations, use manual capture (escrow)
    if (isCollaboration) {
      paymentIntentData.capture_method = "manual";
    }

    // Pass idempotency key to Stripe to prevent duplicate charges on retry
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentData,
      {
        idempotencyKey: key,
      },
    );

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amounts.amount,
      platformFee: amounts.platformFee,
      sellerAmount: amounts.sellerAmount,
      isEscrow: isCollaboration,
      idempotency_key: key,
    });
  } catch (error) {
    console.error("Create Payment Intent Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create payment intent",
    });
  }
};

// @desc    Confirm payment and create order
// @route   POST /api/payments/confirm
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const { payment_intent_id, service_id } = req.body;

    if (!payment_intent_id || !service_id) {
      return res.status(400).json({
        success: false,
        error: "Payment intent ID and service ID are required",
      });
    }

    // Check if order already exists for this payment intent (idempotency)
    const existingOrder = await Order.findOne({
      where: { stripe_payment_intent_id: payment_intent_id },
    });

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        order: {
          id: existingOrder.id,
          order_number: existingOrder.order_number,
          status: existingOrder.status,
          amount: existingOrder.amount,
          escrow_status: existingOrder.escrow_status,
        },
        message: "Order already created for this payment intent",
        isIdempotentResponse: true,
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent =
      await stripe.paymentIntents.retrieve(payment_intent_id);

    if (
      paymentIntent.status !== "succeeded" &&
      paymentIntent.status !== "requires_capture"
    ) {
      return res.status(400).json({
        success: false,
        error: "Payment not successful",
      });
    }

    // Get service
    const service = await Service.findByPk(service_id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    // Calculate amounts
    const amounts = calculateAmounts(service.price);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Determine order status based on service type
    let orderStatus = "pending";
    let escrowStatus = null;
    let deliveryDeadline = null;

    if (service.type === "collaboration") {
      orderStatus = "awaiting_upload";
      escrowStatus = "held";
      deliveryDeadline = new Date(
        Date.now() + service.delivery_time_days * 24 * 60 * 60 * 1000,
      );
    } else {
      orderStatus = "completed"; // Instant digital products
    }

    // Create order
    const order = await Order.create({
      order_number: orderNumber,
      buyer_id: req.user.id,
      seller_id: service.seller_id,
      service_id: service.id,
      status: orderStatus,
      amount: amounts.amount,
      platform_fee: amounts.platformFee,
      seller_amount: amounts.sellerAmount,
      stripe_payment_intent_id: payment_intent_id,
      escrow_status: escrowStatus,
      delivery_deadline: deliveryDeadline,
    });

    // Create transaction record
    await Transaction.create({
      order_id: order.id,
      buyer_id: req.user.id,
      seller_id: service.seller_id,
      type: "purchase",
      amount: amounts.amount,
      platform_fee: amounts.platformFee,
      stripe_payment_id: payment_intent_id,
      status: "completed",
    });

    // Increment service total sales
    service.total_sales += 1;
    await service.save();

    // Auto-generate contract for collaborations
    if (service.type === "collaboration") {
      try {
        const contractController = require("./contractController");

        const mockReq = {
          params: { orderId: order.id },
          user: req.user,
        };
        const mockRes = {
          status: () => ({ json: () => {} }),
        };

        await contractController.generateContract(mockReq, mockRes);
        console.log(`✓ Contract generated for order ${order.id}`);
      } catch (contractError) {
        // Don't fail the order if contract generation fails
        console.error("Contract generation failed:", contractError.message);
        // Contract can be generated later manually
      }
    }

    // For instant products, transfer money immediately
    if (service.type !== "collaboration") {
      // Transfer to seller (we'll implement this next)
      // await transferToSeller(order);
    }

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        amount: order.amount,
        escrow_status: order.escrow_status,
      },
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Confirm Payment Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to confirm payment",
    });
  }
};

// @desc    Release escrow payment
// @route   POST /api/payments/release-escrow
// @access  Private (System/Admin)
exports.releaseEscrow = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        error: "Order ID is required",
      });
    }

    // Get order
    const order = await Order.findByPk(order_id, {
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "stripe_account_id"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    if (order.escrow_status !== "held") {
      return res.status(400).json({
        success: false,
        error: "Escrow is not held for this order",
      });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        success: false,
        error: "Order must be delivered before releasing escrow",
      });
    }

    // Capture the payment (release from escrow)
    const paymentIntent = await stripe.paymentIntents.capture(
      order.stripe_payment_intent_id,
    );

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Failed to capture payment");
    }

    // TODO: Transfer to seller's Stripe Connect account
    // This requires seller to have connected Stripe account
    // We'll implement Stripe Connect in the next step

    // Update order
    order.escrow_status = "released";
    order.status = "completed";
    order.completed_at = new Date();
    await order.save();

    // Create payout transaction
    await Transaction.create({
      order_id: order.id,
      buyer_id: order.buyer_id,
      seller_id: order.seller_id,
      type: "payout",
      amount: order.seller_amount,
      platform_fee: 0,
      status: "completed",
    });

    res.status(200).json({
      success: true,
      message: "Escrow released successfully",
      order: {
        id: order.id,
        escrow_status: order.escrow_status,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("Release Escrow Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to release escrow",
    });
  }
};

// @desc    Get seller onboarding link (Stripe Connect)
// @route   GET /api/payments/connect-onboard
// @access  Private (Seller)
// In controllers/paymentController.js
exports.getConnectOnboardingLink = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user.is_seller) {
      return res.status(403).json({
        success: false,
        error: "User must be a seller to connect Stripe",
      });
    }

    let accountId = user.stripe_account_id;

    // Create Stripe Connect account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        business_type: "individual", // Most producers are individuals

        business_profile: {
          mcc: "5815", // Digital goods
          name: user.display_name || user.username,
          product_description:
            "Digital music production content: beats, loops, drum kits, samples, and production services",
          support_email: user.email,
          url: `${process.env.FRONTEND_URL}/users/${user.username}`,
        },

        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },

        metadata: {
          user_id: user.id,
          username: user.username,
          platform: "prodmarket",
          seller_type: "music_producer",
        },
      });

      accountId = account.id;
      user.stripe_account_id = accountId;
      await user.save();
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/seller/connect/refresh`,
      return_url: `${process.env.FRONTEND_URL}/seller/connect/complete`,
      type: "account_onboarding",
    });

    res.status(200).json({
      success: true,
      url: accountLink.url,
    });
  } catch (error) {
    console.error("Connect Onboarding Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create onboarding link",
    });
  }
};

// @desc    Check Stripe Connect status
// @route   GET /api/payments/connect-status
// @access  Private (Seller)
exports.getConnectStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user.stripe_account_id) {
      return res.status(200).json({
        success: true,
        connected: false,
        charges_enabled: false,
        payouts_enabled: false,
      });
    }

    const account = await stripe.accounts.retrieve(user.stripe_account_id);

    res.status(200).json({
      success: true,
      connected: true,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    });
  } catch (error) {
    console.error("Connect Status Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check connect status",
    });
  }
};

