// controllers/adminController.js
const {
  User,
  Service,
  Order,
  Dispute,
  Transaction,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin only)
 */
exports.getDashboard = async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.count();
    const totalSellers = await User.count({ where: { is_seller: true } });
    const verifiedSellers = await User.count({
      where: { is_seller: true, is_verified: true },
    });

    // Service stats
    const totalServices = await Service.count();
    const activeServices = await Service.count({ where: { is_active: true } });

    // Order stats
    const totalOrders = await Order.count();
    const completedOrders = await Order.count({
      where: { status: "completed" },
    });
    const activeOrders = await Order.count({
      where: {
        status: {
          [Op.in]: ["pending", "awaiting_upload", "in_progress", "delivered"],
        },
      },
    });
    const disputedOrders = await Order.count({ where: { status: "disputed" } });

    // Dispute stats
    const openDisputes = await Dispute.count({ where: { status: "open" } });
    const underReviewDisputes = await Dispute.count({
      where: { status: "under_review" },
    });

    // Revenue stats
    const totalRevenue = await Order.sum("amount", {
      where: { status: "completed" },
    });
    const platformRevenue = await Order.sum("platform_fee", {
      where: { status: "completed" },
    });

    // Recent activity
    const recentOrders = await Order.findAll({
      order: [["created_at", "DESC"]],
      limit: 10,
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "username", "display_name"],
        },
        {
          model: User,
          as: "seller",
          attributes: ["id", "username", "display_name"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "title", "type"],
        },
      ],
    });

    const recentUsers = await User.findAll({
      order: [["created_at", "DESC"]],
      limit: 10,
      attributes: [
        "id",
        "username",
        "display_name",
        "email",
        "is_seller",
        "is_verified",
        "created_at",
      ],
    });

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          sellers: totalSellers,
          verified: verifiedSellers,
        },
        services: {
          total: totalServices,
          active: activeServices,
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          active: activeOrders,
          disputed: disputedOrders,
        },
        disputes: {
          open: openDisputes,
          underReview: underReviewDisputes,
        },
        revenue: {
          total: parseFloat(totalRevenue || 0).toFixed(2),
          platform: parseFloat(platformRevenue || 0).toFixed(2),
        },
      },
      recentActivity: {
        orders: recentOrders,
        users: recentUsers,
      },
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard data",
    });
  }
};

/**
 * @desc    Get all users with filters
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
exports.getUsers = async (req, res) => {
  try {
    const { is_seller, is_verified, search, page = 1, limit = 50 } = req.query;

    const where = {};

    if (is_seller !== undefined) {
      where.is_seller = is_seller === "true";
    }

    if (is_verified !== undefined) {
      where.is_verified = is_verified === "true";
    }

    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { display_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        "id",
        "username",
        "display_name",
        "email",
        "is_seller",
        "is_verified",
        "avatar_url",
        "bio",
        "instagram_handle",
        "created_at",
      ],
    });

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
};

/**
 * @desc    Get user details
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin only)
 */
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password_hash", "google_id"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get user's services
    const services = await Service.findAll({
      where: { seller_id: user.id },
      attributes: ["id", "title", "type", "price", "is_active", "total_sales"],
    });

    // Get user's orders (as buyer and seller)
    const purchaseCount = await Order.count({ where: { buyer_id: user.id } });
    const salesCount = await Order.count({ where: { seller_id: user.id } });

    // Get disputes
    const disputesRaised = await Dispute.count({
      where: { raised_by_user_id: user.id },
    });

    res.status(200).json({
      success: true,
      user: {
        ...user.toJSON(),
        services,
        stats: {
          purchases: purchaseCount,
          sales: salesCount,
          disputesRaised,
          servicesCount: services.length,
        },
      },
    });
  } catch (error) {
    console.error("Get User Details Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user details",
    });
  }
};

/**
 * @desc    Verify user (give verified badge)
 * @route   PUT /api/admin/users/:id/verify
 * @access  Private (Admin only)
 */
exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!user.is_seller) {
      return res.status(400).json({
        success: false,
        error: "User must be a seller to be verified",
      });
    }

    user.is_verified = true;
    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        is_verified: user.is_verified,
      },
      message: "User verified successfully",
    });
  } catch (error) {
    console.error("Verify User Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify user",
    });
  }
};

/**
 * @desc    Unverify user (remove verified badge)
 * @route   PUT /api/admin/users/:id/unverify
 * @access  Private (Admin only)
 */
exports.unverifyUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    user.is_verified = false;
    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        is_verified: user.is_verified,
      },
      message: "User unverified successfully",
    });
  } catch (error) {
    console.error("Unverify User Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to unverify user",
    });
  }
};

/**
 * @desc    Get all disputes
 * @route   GET /api/admin/disputes
 * @access  Private (Admin only)
 */
exports.getDisputes = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: disputes } = await Dispute.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: "raisedBy",
          attributes: ["id", "username", "display_name", "email"],
        },
        {
          model: Order,
          as: "order",
          attributes: [
            "id",
            "order_number",
            "buyer_id",
            "seller_id",
            "status",
            "amount",
          ],
          include: [
            {
              model: User,
              as: "buyer",
              attributes: ["id", "username", "display_name"],
            },
            {
              model: User,
              as: "seller",
              attributes: ["id", "username", "display_name"],
            },
            {
              model: Service,
              as: "service",
              attributes: ["id", "title", "type"],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      disputes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get Disputes Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch disputes",
    });
  }
};

/**
 * @desc    Resolve dispute
 * @route   PUT /api/admin/disputes/:id/resolve
 * @access  Private (Admin only)
 */
exports.resolveDispute = async (req, res) => {
  try {
    const { resolution, admin_notes } = req.body;

    if (!resolution) {
      return res.status(400).json({
        success: false,
        error: "Resolution is required",
      });
    }

    const validResolutions = [
      "refund_buyer",
      "release_to_seller",
      "partial_refund",
    ];
    if (!validResolutions.includes(resolution)) {
      return res.status(400).json({
        success: false,
        error: "Invalid resolution",
      });
    }

    const dispute = await Dispute.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: "order",
        },
      ],
    });

    if (!dispute) {
      return res.status(404).json({
        success: false,
        error: "Dispute not found",
      });
    }

    if (dispute.status === "resolved" || dispute.status === "closed") {
      return res.status(400).json({
        success: false,
        error: "Dispute is already resolved or closed",
      });
    }

    // Update dispute
    dispute.status = "resolved";
    dispute.resolution = resolution;
    dispute.admin_notes = admin_notes || "";
    dispute.resolved_at = new Date();
    dispute.resolved_by_admin_id = req.user.id;
    await dispute.save();

    // Update order based on resolution
    const order = dispute.order;

    switch (resolution) {
      case "refund_buyer":
        order.status = "refunded";
        if (order.escrow_status === "held") {
          order.escrow_status = "refunded";
        }
        // TODO: Process actual refund via Stripe
        break;

      case "release_to_seller":
        order.status = "completed";
        if (order.escrow_status === "held") {
          order.escrow_status = "released";
        }
        // TODO: Release escrow via payment controller
        break;

      case "partial_refund":
        order.status = "completed";
        // TODO: Process partial refund
        break;
    }

    await order.save();

    res.status(200).json({
      success: true,
      dispute,
      message: `Dispute resolved: ${resolution.replace("_", " ")}`,
    });
  } catch (error) {
    console.error("Resolve Dispute Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resolve dispute",
    });
  }
};

/**
 * @desc    Delete service (moderation)
 * @route   DELETE /api/admin/services/:id
 * @access  Private (Admin only)
 */
exports.deleteService = async (req, res) => {
  try {
    const { reason } = req.body;

    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    // Soft delete - set inactive
    service.is_active = false;
    await service.save();

    // TODO: Notify seller about deletion

    res.status(200).json({
      success: true,
      message: "Service deactivated successfully",
      reason: reason || "Moderation action",
    });
  } catch (error) {
    console.error("Delete Service Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete service",
    });
  }
};

/**
 * @desc    Get all transactions
 * @route   GET /api/admin/transactions
 * @access  Private (Admin only)
 */
exports.getTransactions = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 50 } = req.query;

    const where = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "username", "display_name"],
          required: false,
        },
        {
          model: User,
          as: "seller",
          attributes: ["id", "username", "display_name"],
          required: false,
        },
        {
          model: Order,
          as: "order",
          attributes: ["id", "order_number"],
          required: false,
        },
      ],
    });

    // Calculate totals
    const totalAmount = transactions.reduce(
      (sum, t) => sum + parseFloat(t.amount || 0),
      0
    );
    const totalPlatformFee = transactions.reduce(
      (sum, t) => sum + parseFloat(t.platform_fee || 0),
      0
    );

    res.status(200).json({
      success: true,
      transactions,
      totals: {
        amount: totalAmount.toFixed(2),
        platformFee: totalPlatformFee.toFixed(2),
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get Transactions Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transactions",
    });
  }
};

module.exports = exports;
