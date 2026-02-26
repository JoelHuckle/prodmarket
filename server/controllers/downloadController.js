const {
  Download,
  Order,
  SubscriptionPack,
  Subscription,
  Service,
  User,
} = require("../models");
const storageService = require("../utils/storageService");

/**
 * @desc    Download order files
 * @route   POST /api/downloads/order/:orderId
 * @access  Private (Buyer only)
 */
exports.downloadOrderFiles = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: Service,
          as: "service",
          attributes: ["id", "title", "type"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Verify buyer
    if (order.buyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to download files for this order",
      });
    }

    // Check order status - must be completed or delivered
    const allowedStatuses = ["delivered", "completed"];
    if (!allowedStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot download files. Order status is: ${order.status}`,
      });
    }

    // Get files to download
    let filesToDownload = [];

    // For collaborations - get seller delivered files
    if (order.service.type === "collaboration" && order.seller_files) {
      filesToDownload = order.seller_files.files || [];
    }

    // For instant products - get service files
    if (
      ["loop_pack", "drum_kit", "preset_kit"].includes(order.service.type) &&
      order.service.file_urls
    ) {
      const service = await Service.findByPk(order.service_id);
      filesToDownload = service.file_urls || [];
    }

    if (filesToDownload.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No files available for download",
      });
    }

    // Generate presigned URLs for all files
    const downloadUrls = await Promise.all(
      filesToDownload.map(async (fileUrl) => {
        try {
          const downloadUrl = await storageService.getDownloadUrl(fileUrl);
          return {
            originalUrl: fileUrl,
            downloadUrl,
            expiresIn: "1 hour",
          };
        } catch (error) {
          console.error(
            `Failed to generate URL for ${fileUrl}:`,
            error.message
          );
          return null;
        }
      })
    );

    // Filter out failed URLs
    const validDownloadUrls = downloadUrls.filter((url) => url !== null);

    // Track downloads
    const clientIp =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    await Promise.all(
      validDownloadUrls.map((urlObj) =>
        Download.create({
          user_id: req.user.id,
          order_id: order.id,
          subscription_pack_id: null,
          file_url: urlObj.originalUrl,
          ip_address: clientIp,
        })
      )
    );

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        service: order.service.title,
      },
      files: validDownloadUrls,
      message: `Generated ${validDownloadUrls.length} download link${
        validDownloadUrls.length !== 1 ? "s" : ""
      }`,
    });
  } catch (error) {
    console.error("Download Order Files Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate download links",
      details: error.message,
    });
  }
};

/**
 * @desc    Download subscription pack files
 * @route   POST /api/downloads/pack/:packId
 * @access  Private (Active subscriber only)
 */
exports.downloadPackFiles = async (req, res) => {
  try {
    const { packId } = req.params;

    // Get pack
    const pack = await SubscriptionPack.findByPk(packId, {
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
        error: "You must have an active subscription to download this pack",
      });
    }

    // Get files
    const filesToDownload = pack.file_urls || [];

    if (filesToDownload.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No files available in this pack",
      });
    }

    // Generate presigned URLs
    const downloadUrls = await Promise.all(
      filesToDownload.map(async (fileUrl) => {
        try {
          const downloadUrl = await storageService.getDownloadUrl(fileUrl);
          return {
            originalUrl: fileUrl,
            downloadUrl,
            expiresIn: "1 hour",
          };
        } catch (error) {
          console.error(
            `Failed to generate URL for ${fileUrl}:`,
            error.message
          );
          return null;
        }
      })
    );

    const validDownloadUrls = downloadUrls.filter((url) => url !== null);

    // Track downloads (only for subscribers, not sellers)
    if (!isSeller) {
      const clientIp =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress;

      await Promise.all(
        validDownloadUrls.map((urlObj) =>
          Download.create({
            user_id: req.user.id,
            order_id: null,
            subscription_pack_id: pack.id,
            file_url: urlObj.originalUrl,
            ip_address: clientIp,
          })
        )
      );
    }

    res.status(200).json({
      success: true,
      pack: {
        id: pack.id,
        title: pack.title,
        service: pack.service.title,
      },
      files: validDownloadUrls,
      message: `Generated ${validDownloadUrls.length} download link${
        validDownloadUrls.length !== 1 ? "s" : ""
      }`,
    });
  } catch (error) {
    console.error("Download Pack Files Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate download links",
      details: error.message,
    });
  }
};

/**
 * @desc    Get user's download history
 * @route   GET /api/downloads/my
 * @access  Private
 */
exports.getMyDownloads = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: downloads } = await Download.findAndCountAll({
      where: { user_id: req.user.id },
      order: [["downloaded_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["id", "order_number", "status"],
          required: false,
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["id", "title", "type"],
            },
          ],
        },
        {
          model: SubscriptionPack,
          as: "pack",
          attributes: ["id", "title"],
          required: false,
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

    // Group downloads by order/pack
    const groupedDownloads = downloads.reduce((acc, download) => {
      if (download.order_id) {
        const key = `order_${download.order_id}`;
        if (!acc[key]) {
          acc[key] = {
            type: "order",
            id: download.order_id,
            order_number: download.order?.order_number,
            service: download.order?.service?.title,
            files: [],
            lastDownloaded: download.downloaded_at,
          };
        }
        acc[key].files.push({
          file_url: download.file_url,
          downloaded_at: download.downloaded_at,
        });
      } else if (download.subscription_pack_id) {
        const key = `pack_${download.subscription_pack_id}`;
        if (!acc[key]) {
          acc[key] = {
            type: "pack",
            id: download.subscription_pack_id,
            pack_title: download.pack?.title,
            service: download.pack?.service?.title,
            files: [],
            lastDownloaded: download.downloaded_at,
          };
        }
        acc[key].files.push({
          file_url: download.file_url,
          downloaded_at: download.downloaded_at,
        });
      }
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      downloads: Object.values(groupedDownloads),
      totalDownloads: count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get My Downloads Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch download history",
    });
  }
};

/**
 * @desc    Get download statistics for seller
 * @route   GET /api/downloads/stats
 * @access  Private (Seller only)
 */
exports.getDownloadStats = async (req, res) => {
  try {
    const { service_id, period = "30" } = req.query;

    // Date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Build where clause for downloads
    const downloadWhere = {
      downloaded_at: {
        [require("sequelize").Op.gte]: startDate,
      },
    };

    // Get orders where user is seller
    const sellerOrders = await Order.findAll({
      where: {
        seller_id: req.user.id,
        ...(service_id && { service_id }),
      },
      attributes: ["id"],
    });

    const orderIds = sellerOrders.map((o) => o.id);

    // Get packs where user is seller
    const sellerPacks = await SubscriptionPack.findAll({
      where: {
        seller_id: req.user.id,
        ...(service_id && { service_id }),
      },
      attributes: ["id"],
    });

    const packIds = sellerPacks.map((p) => p.id);

    // Get download counts
    const orderDownloads = await Download.count({
      where: {
        ...downloadWhere,
        order_id: orderIds,
      },
    });

    const packDownloads = await Download.count({
      where: {
        ...downloadWhere,
        subscription_pack_id: packIds,
      },
    });

    // Get unique downloaders
    const uniqueDownloaders = await Download.findAll({
      where: {
        ...downloadWhere,
        [require("sequelize").Op.or]: [
          { order_id: orderIds },
          { subscription_pack_id: packIds },
        ],
      },
      attributes: [
        [
          require("sequelize").fn(
            "DISTINCT",
            require("sequelize").col("user_id")
          ),
          "user_id",
        ],
      ],
    });

    res.status(200).json({
      success: true,
      stats: {
        period: `Last ${period} days`,
        orderDownloads,
        packDownloads,
        totalDownloads: orderDownloads + packDownloads,
        uniqueDownloaders: uniqueDownloaders.length,
      },
    });
  } catch (error) {
    console.error("Get Download Stats Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch download statistics",
    });
  }
};

module.exports = exports;
