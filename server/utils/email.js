const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = `"ProdMarket" <${process.env.EMAIL_USER}>`;

/**
 * Send email verification link to a newly registered user.
 */
exports.sendVerificationEmail = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verify your ProdMarket email",
    html: `
      <p>Thanks for signing up! Please verify your email address by clicking the link below.</p>
      <p>This link expires in 24 hours.</p>
      <a href="${url}">${url}</a>
    `,
  });
};

/**
 * Send password reset link.
 */
exports.sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your ProdMarket password",
    html: `
      <p>We received a request to reset your password.</p>
      <p>Click the link below to set a new password. This link expires in 1 hour.</p>
      <a href="${url}">${url}</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
};
