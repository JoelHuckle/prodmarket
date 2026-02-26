// controllers/orderController.js
const { Order, Service, User } = require("../models");
const { Op, sequelize } = require("sequelize");
const validator = require("../utils/validator");
const auditLog = require("../utils/auditLog");

/**
 * @desc    Create new order (manual creation if needed)
 * @route   POST /api/orders
 * @access  Private
 * @note    Orders are typically created via payment confirmation,
 *          but this endpoint allows manual order creation for special cases
 */
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { service_id, amount, notes } = req.body;

    if (!service_id || !amount) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "Service ID and amount are required",
      });
    }

    // Validate amount
    const amountValidation = validator.validateOrderAmount(amount);
    if (!amountValidation.valid) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: amountValidation.error,
      });
    }

    // Get service
    const service = await Service.findByPk(service_id, { transaction });
    if (!service) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    // Validate amount matches service price (if service has fixed price)
    const servicePrice = parseFloat(service.price);
    const requestedAmount = parseFloat(amount);
    if (Math.abs(servicePrice - requestedAmount) > 0.01) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: `Amount must match service price: $${servicePrice}`,
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Calculate platform fee (8%)
    const platformFee = (parseFloat(amount) * 0.08).toFixed(2);
    const sellerAmount = (parseFloat(amount) - platformFee).toFixed(2);

    // Determine initial status based on service type
    let status = "pending";
    let escrowStatus = null;
    let deliveryDeadline = null;

    if (service.type === "collaboration") {
      status = "awaiting_upload";
      escrowStatus = "held";
      deliveryDeadline = new Date(
        Date.now() + service.delivery_time_days * 24 * 60 * 60 * 1000,
      );
    }

    // Create order within transaction
    const order = await Order.create(
      {
        order_number: orderNumber,
        buyer_id: req.user.id,
        seller_id: service.seller_id,
        service_id: service.id,
        status,
        amount,
        platform_fee: platformFee,
        seller_amount: sellerAmount,
        escrow_status: escrowStatus,
        delivery_deadline: deliveryDeadline,
      },
      { transaction },
    );

    // Fetch complete order with relationships
    const completeOrder = await Order.findByPk(order.id, {
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
          attributes: ["id", "title", "type", "delivery_time_days"],
        },
      ],
      transaction,
    });

    // Commit transaction
    await transaction.commit();

    // Log audit event
    auditLog.logOrderCreated(order.id, req.user.id, service.seller_id, amount, req);

    res.status(201).json({
      success: true,
      order: completeOrder,
      message: "Order created successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create order",
    });
  }
};

/**
 * @desc    Get all orders for current user
 * @route   GET /api/orders
 * @access  Private
 * @query   role (buyer|seller), status, page, limit
 */
exports.getOrders = async (req, res) => {
  try {
    const { role = "buyer", status, page = 1, limit = 20 } = req.query;

    // Validate pagination
    const paginationValidation = validator.validatePagination(page, limit);
    if (!paginationValidation.valid) {
      return res.status(400).json({
        success: false,
        error: paginationValidation.error,
      });
    }

    const { page: p, limit: l } = paginationValidation;

    // Build where clause based on role
    const where = {};
    if (role === "buyer") {
      where.buyer_id = req.user.id;
    } else if (role === "seller") {
      where.seller_id = req.user.id;
    } else if (role === "all") {
      where[Op.or] = [{ buyer_id: req.user.id }, { seller_id: req.user.id }];
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be "buyer", "seller", or "all"',
      });
    }

    // Filter by status if provided
    if (status) {
      const validStatuses = [
        "pending",
        "awaiting_upload",
        "in_progress",
        "awaiting_delivery",
        "delivered",
        "completed",
        "cancelled",
        "refunded",
        "disputed",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status: ${status}`,
        });
      }
      where.status = status;
    }

    // Pagination
    const offset = (p - 1) * l;

    // Fetch orders
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: l,
      offset,
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
          attributes: ["id", "title", "type", "price", "delivery_time_days"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        page: p,
        limit: l,
        total: count,
        totalPages: Math.ceil(count / l),
      },
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
    });
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private (must be buyer or seller)
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "username", "display_name", "avatar_url", "email"],
        },
        {
          model: User,
          as: "seller",
          attributes: [
            "id",
            "username",
            "display_name",
            "avatar_url",
            "email",
            "is_verified",
          ],
        },
        {
          model: Service,
          as: "service",
          attributes: [
            "id",
            "title",
            "description",
            "type",
            "price",
            "delivery_time_days",
            "preview_url",
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Verify user has access to this order
    if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch order",
    });
  }
};

/**
 * @desc    Upload buyer files (for collaborations)
 * @route   PUT /api/orders/:id/upload-files
 * @access  Private (Buyer only)
 */
exports.uploadBuyerFiles = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { file_urls, instructions } = req.body;

    // Validate file URLs
    const fileValidation = validator.validateFileUrls(file_urls);
    if (!fileValidation.valid) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: fileValidation.error,
      });
    }

    // Validate instructions if provided
    if (instructions) {
      const instructionsValidation = validator.validateText(instructions, {
        maxLength: 2000,
        required: false,
      });
      if (!instructionsValidation.valid) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: instructionsValidation.error,
        });
      }
    }

    const order = await Order.findByPk(req.params.id, { transaction });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Verify buyer
    if (order.buyer_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        error: "Not authorized to upload files for this order",
      });
    }

    // Check order status
    if (order.status !== "awaiting_upload") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "Order is not awaiting file upload",
      });
    }

    // Validate status transition
    const statusValidation = validator.validateStatusTransition(
      order.status,
      "in_progress",
    );
    if (!statusValidation.valid) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: statusValidation.error,
      });
    }

    // Update order with buyer files
    order.buyer_files = {
      files: file_urls,
      instructions: instructions || "",
      uploaded_at: new Date(),
    };
    order.status = "in_progress";
    await order.save({ transaction });

    await transaction.commit();

    // Log audit event
    auditLog.logOrderStatusChange(
      order.id,
      "awaiting_upload",
      "in_progress",
      req.user.id,
      req,
    );

    res.status(200).json({
      success: true,
      order,
      message: "Files uploaded successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Upload Buyer Files Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload files",
    });
  }
};

/**
 * @desc    Deliver order (seller uploads completed work)
 * @route   PUT /api/orders/:id/deliver
 * @access  Private (Seller only)
 */
exports.deliverOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { file_urls, delivery_notes } = req.body;

    // Validate file URLs
    const fileValidation = validator.validateFileUrls(file_urls);
    if (!fileValidation.valid) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: fileValidation.error,
      });
    }

    // Validate delivery notes if provided
    if (delivery_notes) {
      const notesValidation = validator.validateText(delivery_notes, {
        maxLength: 2000,
        required: false,
      });
      if (!notesValidation.valid) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: notesValidation.error,
        });
      }
    }

    const order = await Order.findByPk(req.params.id, { transaction });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Verify seller
    if (order.seller_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        error: "Not authorized to deliver this order",
      });
    }

    // Check order status - can deliver if in_progress or awaiting_delivery
    const oldStatus = order.status;
    const validStatuses = ["in_progress", "awaiting_delivery"];
    if (!validStatuses.includes(oldStatus)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: `Cannot deliver order with status: ${oldStatus}`,
      });
    }

    // Validate status transition
    const statusValidation = validator.validateStatusTransition(
      oldStatus,
      "delivered",
    );
    if (!statusValidation.valid) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: statusValidation.error,
      });
    }

    // Update order with seller files
    order.seller_files = {
      files: file_urls,
      delivery_notes: delivery_notes || "",
      delivered_at: new Date(),
    };
    order.status = "delivered";
    await order.save({ transaction });

    await transaction.commit();

    // Log audit event
    auditLog.logOrderStatusChange(
      order.id,
      oldStatus,
      "delivered",
      req.user.id,
      req,
    );

    res.status(200).json({
      success: true,
      order,
      message: "Order delivered successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Deliver Order Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to deliver order",
    });
  }
};

/**
 * @desc    Complete order (buyer confirms delivery)
 * @route   PUT /api/orders/:id/complete
 * @access  Private (Buyer only)
 */
exports.completeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(req.params.id, { transaction });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Verify buyer
    if (order.buyer_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        error: "Not authorized to complete this order",
      });
    }

    // Check order status
    const oldStatus = order.status;
    const statusValidation = validator.validateStatusTransition(
      oldStatus,
      "completed",
    );
    if (!statusValidation.valid) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: statusValidation.error,
      });
    }

    // Update order status
    order.status = "completed";
    order.completed_at = new Date();

    // If escrow was held, release it
    if (order.escrow_status === "held") {
      order.escrow_status = "released";
    }

    await order.save({ transaction });

    await transaction.commit();

    // Log audit event
    auditLog.logOrderStatusChange(
      order.id,
      oldStatus,
      "completed",
      req.user.id,
      req,
    );

    res.status(200).json({
      success: true,
      order,
      message: "Order completed successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Complete Order Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to complete order",
    });
  }
};

module.exports = exports;
