require("dotenv").config();
const stripe = require("./config/stripe");

async function testStripe() {
  try {
    // List payment methods (should return empty array in test mode)
    const paymentMethods = await stripe.paymentMethods.list({ limit: 1 });
    console.log("✅ Connected to Stripe!");
    console.log(
      "Test mode:",
      !process.env.STRIPE_SECRET_KEY.includes("_live_")
    );
  } catch (error) {
    console.error("❌ Stripe connection failed:", error.message);
  }
}

testStripe();
