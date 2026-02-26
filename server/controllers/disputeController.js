const { Dispute, Order, User, Service } = require("../models");
const { Op, sequelize } = require("sequelize");
const validator = require("../utils/validator");
const auditLog = require("../utils/auditLog");

/**
 * @desc    Create new dispute
 * @route   POST /api/disputes
 * @access  Private (Buyer or Seller)
 */
exports.createDispute = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { order_id, reason, description, evidence_urls } = req.body;

    // Validation
    if (!order_id || !reason || !description) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "Order ID, reason, and description are required",
      });
    }

    // Validate dispute reason
    const reasonValidation = validator.validateDisputeReason(reason);
    if (!reasonValidation.valid) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: reasonValidation.error,
      });
    }

    // Validate description
    const descriptionValidation = validator.validateText(description, {
      minLength: 10,
      maxLength: 5000,
    });
    if (!descriptionValidation.valid) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: descriptionValidation.error,
      });
    }

    // Get order
    const order = await Order.findByPk(order_id, { transaction });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Verify user is buyer or seller
    if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        error: "Not authorized to create dispute for this order",
      });
    }

    // Check if dispute already exists for this order
    const existingDispute = await Dispute.findOne({
      where: {
        order_id,
        status: {
          [Op.in]: ["open", "under_review"],
        },
      },
      transaction,
    });

    if (existingDispute) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "An active dispute already exists for this order",
      });
    }

    // Create dispute
    const dispute = await Dispute.create(
      {
        order_id,
        raised_by_user_id: req.user.id,
        reason,
        description,
        evidence_urls: evidence_urls || null,
        status: "open",
      },
      { transaction },
    );

    // Update order status to disputed
    order.status = "disputed";
    await order.save({ transaction });

    // Fetch complete dispute with relationships
    const completeDispute = await Dispute.findByPk(dispute.id, {
      include: [
        {
          model: User,
          as: "raisedBy",
          attributes: ["id", "username", "display_name", "email"],
        },
        {
          model: Order,
          as: "order",
          attributes: ["id", "order_number", "status", "amount"],
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["id", "title", "type"],
            },
          ],
        },
      ],
      transaction,
    });

    await transaction.commit();

    // Log audit event
    auditLog.logDisputeCreated(dispute.id, order_id, req.user.id, reason, req);
    auditLog.logOrderStatusChange(order_id, "pending", "disputed", req.user.id, req);

    res.status(201).json({
      success: true,
      dispute: completeDispute,
      message: "Dispute created successfully. An admin will review it shortly.",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Create Dispute Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create dispute",
    });
  }
};

/**
 * @desc    Get all disputes for current user
 * @route   GET /api/disputes
 * @access  Private
 */
exports.getMyDisputes = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Build where clause - get disputes where user is involved (via order)
    const orderWhere = {
      [Op.or]: [{ buyer_id: req.user.id }, { seller_id: req.user.id }],
    };

    // Get all order IDs for this user
    const userOrders = await Order.findAll({
      where: orderWhere,
      attributes: ["id"],
    });

    const orderIds = userOrders.map((o) => o.id);

    const where = {
      order_id: {
        [Op.in]: orderIds,
      },
    };

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
          attributes: ["id", "username", "display_name"],
        },
        {
          model: Order,
          as: "order",
          attributes: ["id", "order_number", "buyer_id", "seller_id", "amount"],
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
    console.error("Get My Disputes Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch disputes",
    });
  }
};

/**
 * @desc    Get dispute by ID
 * @route   GET /api/disputes/:id
 * @access  Private (Involved party or Admin)
 */
exports.getDisputeById = async (req, res) => {
  try {
    const dispute = await Dispute.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "raisedBy",
          attributes: ["id", "username", "display_name", "email", "avatar_url"],
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
            "platform_fee",
            "seller_amount",
            "escrow_status",
          ],
          include: [
            {
              model: User,
              as: "buyer",
              attributes: [
                "id",
                "username",
                "display_name",
                "email",
                "avatar_url",
              ],
            },
            {
              model: User,
              as: "seller",
              attributes: [
                "id",
                "username",
                "display_name",
                "email",
                "avatar_url",
              ],
            },
            {
              model: Service,
              as: "service",
              attributes: ["id", "title", "description", "type", "price"],
            },
          ],
        },
        {
          model: User,
          as: "resolvedBy",
          attributes: ["id", "username", "display_name"],
          required: false,
        },
      ],
    });

    if (!dispute) {
      return res.status(404).json({
        success: false,
        error: "Dispute not found",
      });
    }

    // Verify user has access (buyer, seller, or admin)
    const isInvolved =
      dispute.order.buyer_id === req.user.id ||
      dispute.order.seller_id === req.user.id;

    // TODO: Add admin check when admin system is built
    // const isAdmin = req.user.is_admin;

    if (!isInvolved) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view this dispute",
      });
    }

    res.status(200).json({
      success: true,
      dispute,
    });
  } catch (error) {
    console.error("Get Dispute Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dispute",
    });
  }
};

/**
 * @desc    Update dispute (add information)
 * @route   PUT /api/disputes/:id
 * @access  Private (Reporter only)
 */
exports.updateDispute = async (req, res) => {
  try {
    const { description, evidence_urls } = req.body;

    const dispute = await Dispute.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["buyer_id", "seller_id"],
        },
      ],
    });

    if (!dispute) {
      return res.status(404).json({
        success: false,
        error: "Dispute not found",
      });
    }

    // Only the person who raised the dispute can update it
    if (dispute.raised_by_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this dispute",
      });
    }

    // Can only update open or under_review disputes
    if (!["open", "under_review"].includes(dispute.status)) {
      return res.status(400).json({
        success: false,
        error: "Cannot update a resolved or closed dispute",
      });
    }

    // Update fields
    if (description) {
      dispute.description = description;
    }

    if (evidence_urls) {
      // Merge with existing evidence
      const currentEvidence = dispute.evidence_urls || [];
      dispute.evidence_urls = [...currentEvidence, ...evidence_urls];
    }

    await dispute.save();

    // Fetch updated dispute with relationships
    const updatedDispute = await Dispute.findByPk(dispute.id, {
      include: [
        {
          model: User,
          as: "raisedBy",
          attributes: ["id", "username", "display_name"],
        },
        {
          model: Order,
          as: "order",
          attributes: ["id", "order_number"],
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["id", "title"],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      dispute: updatedDispute,
      message: "Dispute updated successfully",
    });
  } catch (error) {
    console.error("Update Dispute Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update dispute",
    });
  }
};

/**
 * @desc    Add response to dispute (other party)
 * @route   POST /api/disputes/:id/respond
 * @access  Private (Other party)
 */
exports.respondToDispute = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        error: "Response is required",
      });
    }

    const dispute = await Dispute.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["buyer_id", "seller_id"],
        },
      ],
    });

    if (!dispute) {
      return res.status(404).json({
        success: false,
        error: "Dispute not found",
      });
    }

    // Must be the other party (not the one who raised it)
    const isOtherParty =
      (dispute.order.buyer_id === req.user.id ||
        dispute.order.seller_id === req.user.id) &&
      dispute.raised_by_user_id !== req.user.id;

    if (!isOtherParty) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to respond to this dispute",
      });
    }

    // Can only respond to open or under_review disputes
    if (!["open", "under_review"].includes(dispute.status)) {
      return res.status(400).json({
        success: false,
        error: "Cannot respond to a resolved or closed dispute",
      });
    }

    // Store response in admin_notes for now
    // In a full system, you'd have a separate responses table
    const currentNotes = dispute.admin_notes || "";
    dispute.admin_notes = `${currentNotes}\n\n[Response from User ${req.user.id}]:\n${response}`;

    // Move to under_review if it was open
    if (dispute.status === "open") {
      dispute.status = "under_review";
    }

    await dispute.save();

    res.status(200).json({
      success: true,
      message: "Response added successfully",
    });
  } catch (error) {
    console.error("Respond to Dispute Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add response",
    });
  }
};

/**
 * @desc    Get dispute statistics
 * @route   GET /api/disputes/stats
 * @access  Private
 */
exports.getDisputeStats = async (req, res) => {
  try {
    // Get user's orders
    const userOrders = await Order.findAll({
      where: {
        [Op.or]: [{ buyer_id: req.user.id }, { seller_id: req.user.id }],
      },
      attributes: ["id"],
    });

    const orderIds = userOrders.map((o) => o.id);

    // Get dispute counts
    const open = await Dispute.count({
      where: {
        order_id: { [Op.in]: orderIds },
        status: "open",
      },
    });

    const underReview = await Dispute.count({
      where: {
        order_id: { [Op.in]: orderIds },
        status: "under_review",
      },
    });

    const resolved = await Dispute.count({
      where: {
        order_id: { [Op.in]: orderIds },
        status: "resolved",
      },
    });

    const closed = await Dispute.count({
      where: {
        order_id: { [Op.in]: orderIds },
        status: "closed",
      },
    });

    // Disputes raised by user
    const raisedByMe = await Dispute.count({
      where: {
        raised_by_user_id: req.user.id,
      },
    });

    res.status(200).json({
      success: true,
      stats: {
        open,
        underReview,
        resolved,
        closed,
        total: open + underReview + resolved + closed,
        raisedByMe,
      },
    });
  } catch (error) {
    console.error("Get Dispute Stats Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dispute statistics",
    });
  }
};

module.exports = exports;
