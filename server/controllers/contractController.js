// controllers/contractController.js
const { Contract, Order, User, Service } = require("../models");
const PDFDocument = require("pdfkit");
const storageService = require("../utils/storageService");

/**
 * Generate contract terms based on service and order details
 */
const generateContractTerms = (order, service, buyer, seller) => {
  const terms = `
MUSIC PRODUCTION COLLABORATION AGREEMENT

This Agreement is entered into as of ${new Date().toLocaleDateString()} by and between:

PRODUCER ("Seller"): ${seller.display_name || seller.username}
Email: ${seller.email}

CLIENT ("Buyer"): ${buyer.display_name || buyer.username}
Email: ${buyer.email}

1. SERVICES
The Producer agrees to provide the following services:
${service.title}
${service.description}

2. COMPENSATION
Total Project Fee: $${order.amount}
Platform Fee: $${order.platform_fee}
Producer Payment: $${order.seller_amount}

Payment shall be held in escrow and released upon completion and approval by Client.

3. DELIVERY
Delivery Timeline: ${service.delivery_time_days} days from project start
Delivery Deadline: ${
    order.delivery_deadline
      ? new Date(order.delivery_deadline).toLocaleDateString()
      : "TBD"
  }

4. REVISIONS
Client is entitled to up to 2 (two) rounds of reasonable revisions.
Additional revisions may be negotiated separately.

5. OWNERSHIP & RIGHTS
Upon full payment, Client shall own all rights to the final delivered work.
Producer retains the right to use the work for portfolio and promotional purposes unless otherwise agreed.

6. CONFIDENTIALITY
Both parties agree to keep project details confidential unless otherwise agreed.

7. CANCELLATION
- Buyer may cancel before Producer begins work for a full refund
- After work begins, cancellation terms will be handled via platform dispute resolution

8. DISPUTE RESOLUTION
Any disputes shall be resolved through the ProdMarket platform dispute system.

9. GOVERNING LAW
This Agreement shall be governed by applicable laws.

By proceeding with this order, both parties acknowledge and agree to these terms.

Order Number: ${order.order_number}
Agreement Date: ${new Date().toLocaleDateString()}
`;

  return terms;
};

/**
 * Generate PDF contract document
 */
const generateContractPDF = async (contract, order, service, buyer, seller) => {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // Header
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("COLLABORATION AGREEMENT", { align: "center" })
        .moveDown();

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Contract ID: ${contract.id}`, { align: "center" })
        .text(`Order Number: ${order.order_number}`, { align: "center" })
        .text(`Date: ${new Date().toLocaleDateString()}`, { align: "center" })
        .moveDown(2);

      // Parties
      doc.fontSize(14).font("Helvetica-Bold").text("PARTIES");
      doc.moveDown(0.5);

      doc.fontSize(10).font("Helvetica-Bold").text("Producer (Seller):");
      doc
        .font("Helvetica")
        .text(`Name: ${seller.display_name || seller.username}`)
        .text(`Email: ${seller.email}`)
        .text(`Username: @${seller.username}`)
        .moveDown();

      doc.fontSize(10).font("Helvetica-Bold").text("Client (Buyer):");
      doc
        .font("Helvetica")
        .text(`Name: ${buyer.display_name || buyer.username}`)
        .text(`Email: ${buyer.email}`)
        .text(`Username: @${buyer.username}`)
        .moveDown(2);

      // Services
      doc.fontSize(14).font("Helvetica-Bold").text("1. SERVICES");
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica").text(service.title, { bold: true });
      doc.text(service.description);
      doc.moveDown(2);

      // Compensation
      doc.fontSize(14).font("Helvetica-Bold").text("2. COMPENSATION");
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Total Project Fee: $${order.amount}`)
        .text(`Platform Fee (8%): $${order.platform_fee}`)
        .text(`Producer Payment: $${order.seller_amount}`)
        .moveDown();
      doc.text(
        "Payment shall be held in escrow and released upon completion and approval by Client."
      );
      doc.moveDown(2);

      // Delivery
      doc.fontSize(14).font("Helvetica-Bold").text("3. DELIVERY TERMS");
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Delivery Timeline: ${service.delivery_time_days} days`)
        .text(
          `Delivery Deadline: ${
            order.delivery_deadline
              ? new Date(order.delivery_deadline).toLocaleDateString()
              : "TBD"
          }`
        );
      doc.moveDown(2);

      // Revisions
      doc.fontSize(14).font("Helvetica-Bold").text("4. REVISIONS");
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          "Client is entitled to up to 2 (two) rounds of reasonable revisions."
        )
        .text("Additional revisions may be negotiated separately.");
      doc.moveDown(2);

      // Ownership
      doc.fontSize(14).font("Helvetica-Bold").text("5. OWNERSHIP & RIGHTS");
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          "Upon full payment, Client shall own all rights to the final delivered work."
        )
        .text(
          "Producer retains the right to use the work for portfolio and promotional purposes unless otherwise agreed."
        );
      doc.moveDown(2);

      // Add new page for remaining terms
      doc.addPage();

      // Confidentiality
      doc.fontSize(14).font("Helvetica-Bold").text("6. CONFIDENTIALITY");
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          "Both parties agree to keep project details confidential unless otherwise agreed."
        );
      doc.moveDown(2);

      // Cancellation
      doc.fontSize(14).font("Helvetica-Bold").text("7. CANCELLATION POLICY");
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          "• Buyer may cancel before Producer begins work for a full refund"
        )
        .text(
          "• After work begins, cancellation terms will be handled via platform dispute resolution"
        );
      doc.moveDown(2);

      // Dispute Resolution
      doc.fontSize(14).font("Helvetica-Bold").text("8. DISPUTE RESOLUTION");
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          "Any disputes shall be resolved through the ProdMarket platform dispute system."
        );
      doc.moveDown(2);

      // Agreement
      doc.fontSize(14).font("Helvetica-Bold").text("9. AGREEMENT");
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          "By proceeding with this order, both parties acknowledge and agree to these terms."
        );
      doc.moveDown(2);

      // Signatures
      doc.fontSize(12).font("Helvetica-Bold").text("AGREED AND ACCEPTED:");
      doc.moveDown();

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Buyer: ${buyer.display_name || buyer.username}`)
        .text(
          `Agreed Date: ${new Date(
            contract.buyer_agreed_at
          ).toLocaleDateString()}`
        )
        .moveDown();

      doc
        .text(`Seller: ${seller.display_name || seller.username}`)
        .text(
          `Agreed Date: ${new Date(
            contract.seller_agreed_at
          ).toLocaleDateString()}`
        )
        .moveDown(2);

      // Footer
      doc
        .fontSize(8)
        .font("Helvetica")
        .text("Generated by ProdMarket", { align: "center" })
        .text(`Contract ID: ${contract.id}`, { align: "center" })
        .text(`Generated: ${new Date().toISOString()}`, { align: "center" });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @desc    Generate contract for an order
 * @route   POST /api/contracts/generate/:orderId
 * @access  Private (Buyer or Seller of the order)
 */
exports.generateContract = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order with all relationships
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "username", "display_name", "email"],
        },
        {
          model: User,
          as: "seller",
          attributes: ["id", "username", "display_name", "email"],
        },
        {
          model: Service,
          as: "service",
          attributes: [
            "id",
            "title",
            "description",
            "type",
            "delivery_time_days",
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

    // Verify user is buyer or seller
    if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to generate contract for this order",
      });
    }

    // Check if contract already exists
    let contract = await Contract.findOne({ where: { order_id: orderId } });

    if (contract) {
      return res.status(200).json({
        success: true,
        contract,
        message: "Contract already exists",
      });
    }

    // Generate contract terms
    const contractTerms = generateContractTerms(
      order,
      order.service,
      order.buyer,
      order.seller
    );

    // Create contract record
    contract = await Contract.create({
      order_id: order.id,
      buyer_id: order.buyer_id,
      seller_id: order.seller_id,
      collaboration_price: order.amount,
      contract_terms: contractTerms,
      buyer_agreed_at: new Date(),
      seller_agreed_at: new Date(),
    });

    // Generate PDF
    const pdfBuffer = await generateContractPDF(
      contract,
      order,
      order.service,
      order.buyer,
      order.seller
    );

    // Upload PDF to storage
    const fileName = `contracts/contract-${contract.id}-${order.order_number}.pdf`;
    const uploadResult = await storageService.uploadFile(
      pdfBuffer,
      fileName,
      "application/pdf"
    );

    // Update contract with PDF URL
    contract.contract_pdf_url = uploadResult.key;
    await contract.save();

    res.status(201).json({
      success: true,
      contract,
      message: "Contract generated successfully",
    });
  } catch (error) {
    console.error("Generate Contract Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate contract",
      details: error.message,
    });
  }
};

/**
 * @desc    Get contract by ID
 * @route   GET /api/contracts/:id
 * @access  Private (Buyer or Seller)
 */
exports.getContract = async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: "order",
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

    if (!contract) {
      return res.status(404).json({
        success: false,
        error: "Contract not found",
      });
    }

    // Verify user is buyer or seller
    if (
      contract.buyer_id !== req.user.id &&
      contract.seller_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view this contract",
      });
    }

    res.status(200).json({
      success: true,
      contract,
    });
  } catch (error) {
    console.error("Get Contract Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch contract",
    });
  }
};

/**
 * @desc    Get contract by order ID
 * @route   GET /api/contracts/order/:orderId
 * @access  Private (Buyer or Seller)
 */
exports.getContractByOrderId = async (req, res) => {
  try {
    const contract = await Contract.findOne({
      where: { order_id: req.params.orderId },
      include: [
        {
          model: Order,
          as: "order",
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["id", "title", "type"],
            },
          ],
        },
      ],
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        error: "Contract not found for this order",
      });
    }

    // Verify user is buyer or seller
    if (
      contract.buyer_id !== req.user.id &&
      contract.seller_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view this contract",
      });
    }

    res.status(200).json({
      success: true,
      contract,
    });
  } catch (error) {
    console.error("Get Contract By Order Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch contract",
    });
  }
};

/**
 * @desc    Download contract PDF
 * @route   GET /api/contracts/:id/download
 * @access  Private (Buyer or Seller)
 */
exports.downloadContract = async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        error: "Contract not found",
      });
    }

    // Verify user is buyer or seller
    if (
      contract.buyer_id !== req.user.id &&
      contract.seller_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to download this contract",
      });
    }

    if (!contract.contract_pdf_url) {
      return res.status(404).json({
        success: false,
        error: "Contract PDF not available",
      });
    }

    // Generate presigned download URL
    const downloadUrl = await storageService.getDownloadUrl(
      contract.contract_pdf_url
    );

    res.status(200).json({
      success: true,
      downloadUrl,
      expiresIn: "1 hour",
    });
  } catch (error) {
    console.error("Download Contract Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate download URL",
    });
  }
};

/**
 * @desc    Get all contracts for current user
 * @route   GET /api/contracts
 * @access  Private
 */
exports.getContracts = async (req, res) => {
  try {
    const { role = "buyer", page = 1, limit = 20 } = req.query;

    const where = {};
    if (role === "buyer") {
      where.buyer_id = req.user.id;
    } else if (role === "seller") {
      where.seller_id = req.user.id;
    }

    const offset = (page - 1) * limit;

    const { count, rows: contracts } = await Contract.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["id", "order_number", "status"],
          include: [
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
      contracts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get Contracts Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch contracts",
    });
  }
};

module.exports = exports;
