const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err.stack);

  const statusCode = err.statusCode || 500;

  // In production, never expose internal error messages for 500s
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
