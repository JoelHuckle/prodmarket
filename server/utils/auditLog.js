const path = require("path");
const winston = require("winston");
require("winston-daily-rotate-file");

/**
 * Winston logger configured with daily log rotation.
 * Rotates every day, keeps 30 days of history, max 100MB per file.
 */
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      dirname: path.join(__dirname, "../logs"),
      filename: "audit-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "100m",
      maxFiles: "30d",
      zippedArchive: true,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

/**
 * Extract client IP from request
 */
const getClientIp = (req) =>
  req?.headers["x-forwarded-for"]?.split(",")[0].trim() ||
  req?.socket?.remoteAddress ||
  "unknown";

const logAuditEvent = (event, req) => {
  logger.info({ ...event, ip_address: getClientIp(req) });
};

exports.logPaymentCreated = (userId, serviceId, amount, paymentIntentId, req) => {
  logAuditEvent({
    action: "payment_created",
    user_id: userId,
    service_id: serviceId,
    amount,
    payment_intent_id: paymentIntentId,
  }, req);
};

exports.logOrderCreated = (orderId, buyerId, sellerId, amount, req) => {
  logAuditEvent({
    action: "order_created",
    order_id: orderId,
    buyer_id: buyerId,
    seller_id: sellerId,
    amount,
  }, req);
};

exports.logOrderStatusChange = (orderId, oldStatus, newStatus, userId, req) => {
  logAuditEvent({
    action: "order_status_changed",
    order_id: orderId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by_user_id: userId,
  }, req);
};

exports.logPayoutReleased = (orderId, sellerId, amount, req) => {
  logAuditEvent({
    action: "payout_released",
    order_id: orderId,
    seller_id: sellerId,
    amount,
  }, req);
};

exports.logDisputeCreated = (disputeId, orderId, raisedByUserId, reason, req) => {
  logAuditEvent({
    action: "dispute_created",
    dispute_id: disputeId,
    order_id: orderId,
    raised_by_user_id: raisedByUserId,
    reason,
  }, req);
};

exports.logDisputeResolved = (disputeId, resolution, resolvedByUserId, req) => {
  logAuditEvent({
    action: "dispute_resolved",
    dispute_id: disputeId,
    resolution,
    resolved_by_user_id: resolvedByUserId,
  }, req);
};

exports.logFileAccessed = (fileKey, userId, action, req) => {
  logAuditEvent({
    action: `file_${action || "download"}`,
    file_key: fileKey,
    user_id: userId,
  }, req);
};

exports.logAdminAction = (adminId, action, targetId, details, req) => {
  logAuditEvent({
    action: `admin_${action}`,
    admin_id: adminId,
    target_id: targetId,
    details,
  }, req);
};

exports.logSecurityEvent = (event, userId, details, req) => {
  logAuditEvent({
    action: `security_${event}`,
    user_id: userId,
    details,
  }, req);
};
