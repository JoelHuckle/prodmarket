// controllers/subscriptionController.js
const stripe = require("../config/stripe");
const {
  Subscription,
  SubscriptionPack,
  Service,
  User,
  Transaction,
} = require("../models");
const { Op } = require("sequelize");

// Platform fee percentage (8%)
const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT) || 8;

/**
 * @desc    Create new subscription
 * @route   POST /api/subscriptions
 * @access  Private (Buyer)
 */
exports.createSubscription = async (req, res) => {
  try {
    const { service_id, payment_method_id } = req.body;

    if (!service_id) {
      return res.status(400).json({
        success: false,
        error: "Service ID is required",
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

    // Verify service type is subscription
    if (service.type !== "subscription") {
      return res.status(400).json({
        success: false,
        error: "Service must be of type 'subscription'",
      });
    }

    if (!service.is_active) {
      return res.status(400).json({
        success: false,
        error: "Service is not available",
      });
    }

    // Check if user already has active subscription to this service
    const existingSubscription = await Subscription.findOne({
      where: {
        buyer_id: req.user.id,
        service_id: service.id,
        status: "active",
      },
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        error: "You already have an active subscription to this service",
      });
    }

    // Calculate amounts
    const amount = parseFloat(service.price);
    const platformFee = (amount * PLATFORM_FEE_PERCENT) / 100;
    const sellerAmount = amount - platformFee;

    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: req.user.stripe_customer_id || "cus_test", // Use test customer if none
      items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: service.title,
              description: `Monthly subscription to ${service.title}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
            recurring: {
              interval: "month",
            },
          },
        },
      ],
      metadata: {
        service_id: service.id,
        buyer_id: req.user.id,
        seller_id: service.seller_id,
        platform_fee: platformFee.toFixed(2),
        seller_amount: sellerAmount.toFixed(2),
      },
    });

    // Create subscription record
    const subscription = await Subscription.create({
      buyer_id: req.user.id,
      seller_id: service.seller_id,
      service_id: service.id,
      stripe_subscription_id: stripeSubscription.id,
      status: "active",
      current_period_start: new Date(
        stripeSubscription.current_period_start * 1000,
      ),
      current_period_end: new Date(
        stripeSubscription.current_period_end * 1000,
      ),
    });

    // Create initial transaction
    await Transaction.create({
      order_id: null, // Subscriptions don't have orders
      buyer_id: req.user.id,
      seller_id: service.seller_id,
      type: "subscription",
      amount: amount.toFixed(2),
      platform_fee: platformFee.toFixed(2),
      stripe_payment_id: stripeSubscription.id,
      status: "completed",
    });

    res.status(201).json({
      success: true,
      subscription,
      message: "Subscription created successfully",
    });
  } catch (error) {
    console.error("Create Subscription Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create subscription",
      details: error.message,
    });
  }
};

/**
 * @desc    Get all subscriptions for current user
 * @route   GET /api/subscriptions/my
 * @access  Private
 */
exports.getMySubscriptions = async (req, res) => {
  try {
    const { status } = req.query;

    const where = { buyer_id: req.user.id };

    if (status) {
      where.status = status;
    }

    const subscriptions = await Subscription.findAll({
      where,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "seller",
          attributes: [
            "id",
            "username",
            "display_name",
            "avatar_url",
            "is_verified",
          ],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "title", "description", "type", "price"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      subscriptions,
      count: subscriptions.length,
    });
  } catch (error) {
    console.error("Get My Subscriptions Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subscriptions",
    });
  }
};

/**
 * @desc    Get subscription by ID
 * @route   GET /api/subscriptions/:id
 * @access  Private (Buyer or Seller)
 */
exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "username", "display_name", "email", "avatar_url"],
        },
        {
          model: User,
          as: "seller",
          attributes: ["id", "username", "display_name", "email", "avatar_url"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "title", "description", "type", "price"],
        },
      ],
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found",
      });
    }

    // Verify user has access
    if (
      subscription.buyer_id !== req.user.id &&
      subscription.seller_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view this subscription",
      });
    }

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("Get Subscription Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subscription",
    });
  }
};

/**
 * @desc    Cancel subscription
 * @route   DELETE /api/subscriptions/:id
 * @access  Private (Buyer only)
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found",
      });
    }

    // Verify buyer
    if (subscription.buyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to cancel this subscription",
      });
    }

    // Check if already cancelled
    if (subscription.status === "cancelled") {
      return res.status(400).json({
        success: false,
        error: "Subscription is already cancelled",
      });
    }

    // Only cancel in Stripe if it's a real Stripe subscription
    if (!subscription.stripe_subscription_id.startsWith("TEST_")) {
      try {
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      } catch (stripeError) {
        console.error("Stripe cancellation error:", stripeError.message);
        // Continue anyway - maybe subscription doesn't exist in Stripe
      }
    }

    // Update subscription
    subscription.status = "cancelled";
    subscription.cancelled_at = new Date();
    await subscription.save();

    res.status(200).json({
      success: true,
      subscription,
      message:
        "Subscription cancelled successfully. You'll keep access until the end of the current billing period.",
    });
  } catch (error) {
    console.error("Cancel Subscription Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel subscription",
      details: error.message,
    });
  }
};

/**
 * @desc    Upload subscription pack (seller)
 * @route   POST /api/subscriptions/:serviceId/upload-pack
 * @access  Private (Seller only)
 */
exports.uploadSubscriptionPack = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { title, description, file_urls, file_size_mb } = req.body;

    if (
      !title ||
      !file_urls ||
      !Array.isArray(file_urls) ||
      file_urls.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Title and file URLs are required",
      });
    }

    // Get service and verify ownership
    const service = await Service.findByPk(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    if (service.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to upload packs for this service",
      });
    }

    if (service.type !== "subscription") {
      return res.status(400).json({
        success: false,
        error: "Service must be of type 'subscription'",
      });
    }

    // Create subscription pack
    const pack = await SubscriptionPack.create({
      service_id: serviceId,
      seller_id: req.user.id,
      title,
      description: description || "",
      file_urls,
      file_size_mb: file_size_mb || null,
      uploaded_at: new Date(),
    });

    // Count active subscribers
    const subscriberCount = await Subscription.count({
      where: {
        service_id: serviceId,
        status: "active",
      },
    });

    res.status(201).json({
      success: true,
      pack,
      subscriberCount,
      message: `Pack uploaded successfully and is now available to ${subscriberCount} active subscriber${
        subscriberCount !== 1 ? "s" : ""
      }`,
    });
  } catch (error) {
    console.error("Upload Subscription Pack Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload subscription pack",
    });
  }
};

/**
 * @desc    Get subscription packs for a service
 * @route   GET /api/subscriptions/:serviceId/packs
 * @access  Private (Active subscriber or seller)
 */
exports.getSubscriptionPacks = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if user is seller or active subscriber
    const service = await Service.findByPk(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    const isSeller = service.seller_id === req.user.id;

    // Check if user has active subscription
    const hasSubscription = await Subscription.findOne({
      where: {
        buyer_id: req.user.id,
        service_id: serviceId,
        status: "active",
      },
    });

    if (!isSeller && !hasSubscription) {
      return res.status(403).json({
        success: false,
        error: "You must have an active subscription to view packs",
      });
    }

    // Get packs
    const offset = (page - 1) * limit;

    const { count, rows: packs } = await SubscriptionPack.findAndCountAll({
      where: { service_id: serviceId },
      order: [["uploaded_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      packs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get Subscription Packs Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subscription packs",
    });
  }
};

/**
 * @desc    Get single subscription pack
 * @route   GET /api/subscriptions/packs/:packId
 * @access  Private (Active subscriber or seller)
 */
exports.getSubscriptionPack = async (req, res) => {
  try {
    const pack = await SubscriptionPack.findByPk(req.params.packId, {
      include: [
        {
          model: Service,
          as: "service",
          attributes: ["id", "title", "seller_id"],
        },
      ],
    });

    if (!pack) {
      return res.status(404).json({
        success: false,
        error: "Pack not found",
      });
    }

    const isSeller = pack.seller_id === req.user.id;

    // Check if user has active subscription
    const hasSubscription = await Subscription.findOne({
      where: {
        buyer_id: req.user.id,
        service_id: pack.service_id,
        status: "active",
      },
    });

    if (!isSeller && !hasSubscription) {
      return res.status(403).json({
        success: false,
        error: "You must have an active subscription to view this pack",
      });
    }

    res.status(200).json({
      success: true,
      pack,
    });
  } catch (error) {
    console.error("Get Subscription Pack Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pack",
    });
  }
};

/**
 * @desc    Get seller's subscribers
 * @route   GET /api/subscriptions/subscribers
 * @access  Private (Seller only)
 */
exports.getSubscribers = async (req, res) => {
  try {
    const { service_id, status = "active" } = req.query;

    const where = { seller_id: req.user.id };

    if (service_id) {
      where.service_id = service_id;
    }

    if (status) {
      where.status = status;
    }

    const subscribers = await Subscription.findAll({
      where,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "username", "display_name", "email", "avatar_url"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "title", "price"],
        },
      ],
    });

    // Calculate stats
    const stats = {
      total: subscribers.length,
      active: subscribers.filter((s) => s.status === "active").length,
      cancelled: subscribers.filter((s) => s.status === "cancelled").length,
      monthlyRevenue: subscribers
        .filter((s) => s.status === "active")
        .reduce((sum, s) => {
          const price = parseFloat(s.service.price);
          const platformFee = (price * PLATFORM_FEE_PERCENT) / 100;
          return sum + (price - platformFee);
        }, 0)
        .toFixed(2),
    };

    res.status(200).json({
      success: true,
      subscribers,
      stats,
    });
  } catch (error) {
    console.error("Get Subscribers Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subscribers",
    });
  }
};

// ==========================================
// TEST ENDPOINT - REMOVE IN PRODUCTION
// ==========================================
exports.testCreateSubscription = async (req, res) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== "development") {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    // Require test API key
    const testKey = req.headers["x-test-key"];
    if (!testKey || testKey !== process.env.TEST_KEY) {
      return res.status(403).json({
        success: false,
        error: "Invalid test API key",
      });
    }

    const { service_id } = req.body;

    if (!service_id) {
      return res.status(400).json({
        success: false,
        error: "Service ID is required",
      });
    }

    const service = await Service.findByPk(service_id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    if (service.type !== "subscription") {
      return res.status(400).json({
        success: false,
        error: "Service must be of type 'subscription'",
      });
    }

    const existingSubscription = await Subscription.findOne({
      where: {
        buyer_id: req.user.id,
        service_id: service.id,
        status: "active",
      },
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        error: "You already have an active subscription to this service",
      });
    }

    const amount = parseFloat(service.price);
    const platformFee = (amount * PLATFORM_FEE_PERCENT) / 100;

    const subscription = await Subscription.create({
      buyer_id: req.user.id,
      seller_id: service.seller_id,
      service_id: service.id,
      stripe_subscription_id: "TEST_SUB_" + Date.now(),
      status: "active",
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await Transaction.create({
      order_id: null,
      buyer_id: req.user.id,
      seller_id: service.seller_id,
      type: "subscription",
      amount: amount.toFixed(2),
      platform_fee: platformFee.toFixed(2),
      stripe_payment_id: "TEST_" + Date.now(),
      status: "completed",
    });

    res.status(201).json({
      success: true,
      subscription,
      message: "TEST subscription created (no real Stripe)",
    });
  } catch (error) {
    console.error("Test Create Subscription Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create test subscription",
      details: error.message,
    });
  }
};

module.exports = exports;
