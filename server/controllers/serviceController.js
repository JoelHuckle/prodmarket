// controllers/serviceController.js
const { Service, User } = require("../models");
const { Op } = require("sequelize");

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Seller only)
exports.createService = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      price,
      delivery_time_days,
      file_urls,
      preview_url,
      tags,
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !price) {
      return res.status(400).json({
        success: false,
        error: "Please provide title, description, type, and price",
      });
    }

    // Validate service type
    const validTypes = [
      "collaboration",
      "subscription",
      "loop_pack",
      "drum_kit",
      "preset_kit",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Invalid service type",
      });
    }

    // Validate price
    if (price < 1 || price > 10000) {
      return res.status(400).json({
        success: false,
        error: "Price must be between $1 and $10,000",
      });
    }

    // Create service
    const service = await Service.create({
      seller_id: req.user.id,
      title,
      description,
      type,
      price,
      delivery_time_days: delivery_time_days || 14,
      file_urls: file_urls || null,
      preview_url: preview_url || null,
      tags: tags || null,
      is_active: true,
      total_sales: 0,
    });

    res.status(201).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Create Service Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Get all services with filters
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const {
      type,
      price_min,
      price_max,
      seller_id,
      tags,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    // Build where clause
    const where = { is_active: true };

    if (type) {
      where.type = type;
    }

    if (price_min || price_max) {
      where.price = {};
      if (price_min) where.price[Op.gte] = parseFloat(price_min);
      if (price_max) where.price[Op.lte] = parseFloat(price_max);
    }

    if (seller_id) {
      where.seller_id = seller_id;
    }

    if (tags) {
      // Search for tags (JSON contains)
      where.tags = {
        [Op.like]: `%${tags}%`,
      };
    }

    // Determine sort order
    let order;
    switch (sort) {
      case "popular":
        order = [["total_sales", "DESC"]];
        break;
      case "price_low":
        order = [["price", "ASC"]];
        break;
      case "price_high":
        order = [["price", "DESC"]];
        break;
      case "newest":
      default:
        order = [["created_at", "DESC"]];
        break;
    }

    // Pagination
    const offset = (page - 1) * limit;

    // Fetch services
    const { count, rows: services } = await Service.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
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
      ],
    });

    res.status(200).json({
      success: true,
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get Services Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "seller",
          attributes: [
            "id",
            "username",
            "display_name",
            "avatar_url",
            "bio",
            "is_verified",
            "is_seller",
          ],
        },
      ],
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get Service Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Owner only)
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    // Verify ownership
    if (service.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this service",
      });
    }

    const {
      title,
      description,
      type,
      price,
      delivery_time_days,
      file_urls,
      preview_url,
      tags,
      is_active,
    } = req.body;

    // Update allowed fields
    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (type !== undefined) service.type = type;
    if (price !== undefined) {
      if (price < 1 || price > 10000) {
        return res.status(400).json({
          success: false,
          error: "Price must be between $1 and $10,000",
        });
      }
      service.price = price;
    }
    if (delivery_time_days !== undefined)
      service.delivery_time_days = delivery_time_days;
    if (file_urls !== undefined) service.file_urls = file_urls;
    if (preview_url !== undefined) service.preview_url = preview_url;
    if (tags !== undefined) service.tags = tags;
    if (is_active !== undefined) service.is_active = is_active;

    await service.save();

    const updatedService = await Service.findByPk(service.id, {
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
      ],
    });

    res.status(200).json({
      success: true,
      service: updatedService,
    });
  } catch (error) {
    console.error("Update Service Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Owner only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    // Verify ownership
    if (service.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this service",
      });
    }

    // Soft delete - set is_active to false
    service.is_active = false;
    await service.save();

    // Or hard delete (uncomment if you prefer):
    // await service.destroy();

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete Service Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Search services
// @route   GET /api/services/search
// @access  Public
exports.searchServices = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const offset = (page - 1) * limit;

    // Search in title, description, and tags
    const { count, rows: services } = await Service.findAndCountAll({
      where: {
        is_active: true,
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
          { tags: { [Op.like]: `%${q}%` } },
        ],
      },
      order: [
        ["total_sales", "DESC"],
        ["created_at", "DESC"],
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
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
      ],
    });

    res.status(200).json({
      success: true,
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Search Services Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
