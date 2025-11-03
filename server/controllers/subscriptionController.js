// controllers/subscriptionController.js
const { Subscription, SubscriptionPack, Service, User } = require("../models");
const stripe = require("../config/stripe");

/**
 * @desc    Create new subscription
 * @route   POST /api/subscriptions
 * @access  Private
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

    // Verify service is subscription type
    if (service.type !== "subscription") {
      return res.status(400).json({
        success: false,
        error: "Service is not a subscription",
      });
    }

    // Check if user already has active subscription for this service
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

    // Get or create Stripe customer
    const buyer = await User.findByPk(req.user.id);
    let customerId = buyer.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: buyer.email,
        name: buyer.display_name || buyer.username,
        metadata: {
          user_id: buyer.id,
          username: buyer.username,
        },
      });
      customerId = customer.id;
      buyer.stripe_customer_id = customerId;
      await buyer.save();
    }

    // Attach payment method to customer (if provided)
    if (payment_method_id) {
      await stripe.paymentMethods.attach(payment_method_id, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: payment_method_id,
        },
      });
    }

    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: service.title,
              description: service.description,
              metadata: {
                service_id: service.id,
                service_type: "subscription",
              },
            },
            recurring: {
              interval: "month",
            },
            unit_amount: Math.round(parseFloat(service.price) * 100), // Convert to cents
          },
        },
      ],
      metadata: {
        service_id: service.id,
        buyer_id: req.user.id,
        seller_id: service.seller_id,
      },
      // Application fee (8% platform fee)
      application_fee_percent: 8,
    });

    // Create subscription record
    const subscription = await Subscription.create({
      buyer_id: req.user.id,
      seller_id: service.seller_id,
      service_id: service.id,
      stripe_subscription_id: stripeSubscription.id,
      status: "active",
      current_period_start: new Date(
        stripeSubscription.current_period_start * 1000
      ),
      current_period_end: new Date(
        stripeSubscription.current_period_end * 1000
      ),
    });

    // Fetch complete subscription with relationships
    const completeSubscription = await Subscription.findByPk(subscription.id, {
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "username", "display_name", "avatar_url"],
        },
        {
          model: User,
          as: "seller",
          attributes: ["id", "username", "display_name", "avatar_url"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "title", "description", "price", "type"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      subscription: completeSubscription,
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
 * @desc    Get user's subscriptions
 * @route   GET /api/subscriptions/my
 * @access  Private
 */
exports.getMySubscriptions = async (req, res) => {
  try {
    const { role = "buyer", status } = req.query;

    // Build where clause
    const where = {};
    if (role === "buyer") {
      where.buyer_id = req.user.id;
    } else if (role === "seller") {
      where.seller_id = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    // Fetch subscriptions
    const subscriptions = await Subscription.findAll({
      where,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "username", "display_name", "avatar_url"],
        },
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
          attributes: ["id", "title", "description", "price", "type"],
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
exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "username", "display_name", "avatar_url", "email"],
        },
        {
          model: User,
          as: "seller",
          attributes: ["id", "username", "display_name", "avatar_url", "email"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "title", "description", "price", "type"],
        },
      ],
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found",
      });
    }

    // Verify user is buyer or seller
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

    // Cancel in Stripe
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);

    // Update subscription
    subscription.status = "cancelled";
    subscription.cancelled_at = new Date();
    await subscription.save();

    res.status(200).json({
      success: true,
      subscription,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel Subscription Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel subscription",
    });
  }
};

/**
 * @desc    Upload monthly pack for subscription
 * @route   POST /api/subscriptions/:service_id/upload-pack
 * @access  Private (Seller only)
 */
exports.uploadSubscriptionPack = async (req, res) => {
  try {
    const { service_id } = req.params;
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

    // Get service
    const service = await Service.findByPk(service_id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    // Verify seller
    if (service.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to upload pack for this service",
      });
    }

    // Verify service is subscription type
    if (service.type !== "subscription") {
      return res.status(400).json({
        success: false,
        error: "Service is not a subscription",
      });
    }

    // Create subscription pack
    const pack = await SubscriptionPack.create({
      service_id: service.id,
      seller_id: req.user.id,
      title,
      description: description || "",
      file_urls,
      file_size_mb: file_size_mb || null,
      uploaded_at: new Date(),
    });

    // Get active subscribers count
    const subscriberCount = await Subscription.count({
      where: {
        service_id: service.id,
        status: "active",
      },
    });

    res.status(201).json({
      success: true,
      pack,
      subscriberCount,
      message: `Pack uploaded successfully. ${subscriberCount} subscriber(s) will be notified.`,
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
 * @route   GET /api/subscriptions/:service_id/packs
 * @access  Private (Subscriber or Seller)
 */
exports.getSubscriptionPacks = async (req, res) => {
  try {
    const { service_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if user is subscriber or seller
    const service = await Service.findByPk(service_id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    const isSeller = service.seller_id === req.user.id;
    const isSubscriber = await Subscription.findOne({
      where: {
        service_id: service_id,
        buyer_id: req.user.id,
        status: "active",
      },
    });

    if (!isSeller && !isSubscriber) {
      return res.status(403).json({
        success: false,
        error: "You must be subscribed to view packs",
      });
    }

    // Fetch packs
    const offset = (page - 1) * limit;
    const { count, rows: packs } = await SubscriptionPack.findAndCountAll({
      where: { service_id },
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
 * @desc    Get subscription statistics
 * @route   GET /api/subscriptions/stats
 * @access  Private
 */
exports.getSubscriptionStats = async (req, res) => {
  try {
    const { role = "buyer" } = req.query;

    const whereClause =
      role === "buyer" ? { buyer_id: req.user.id } : { seller_id: req.user.id };

    // Count by status
    const active = await Subscription.count({
      where: { ...whereClause, status: "active" },
    });

    const cancelled = await Subscription.count({
      where: { ...whereClause, status: "cancelled" },
    });

    const pastDue = await Subscription.count({
      where: { ...whereClause, status: "past_due" },
    });

    // Total amount (for sellers)
    let totalRevenue = 0;
    if (role === "seller") {
      const subscriptions = await Subscription.findAll({
        where: { ...whereClause, status: "active" },
        include: [
          {
            model: Service,
            as: "service",
            attributes: ["price"],
          },
        ],
      });

      totalRevenue = subscriptions.reduce((sum, sub) => {
        const price = parseFloat(sub.service.price);
        const sellerAmount = price * 0.92; // 8% platform fee
        return sum + sellerAmount;
      }, 0);
    }

    res.status(200).json({
      success: true,
      stats: {
        active,
        cancelled,
        past_due,
        total: active + cancelled + pastDue,
        ...(role === "seller"
          ? { monthlyRevenue: totalRevenue.toFixed(2) }
          : {}),
      },
    });
  } catch (error) {
    console.error("Get Subscription Stats Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subscription stats",
    });
  }
};

module.exports = exports;
