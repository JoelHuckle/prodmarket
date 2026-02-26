#!/usr/bin/env node

const https = require("https");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Simplified issue list - Remove milestone references
const issues = [
  {
    title: "🔐 AUTH-001: Setup Google Cloud Console",
    body: `Configure Google Cloud Console for OAuth.

## Steps:
1. Go to https://console.cloud.google.com
2. Create new project "Producer Marketplace"
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins
6. Save Client ID and Client Secret to .env

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "authentication", "setup"],
  },
  {
    title: "🔐 AUTH-002: Implement Real Google OAuth Backend",
    body: `Replace test auth endpoint with real Google OAuth.

## Steps:
1. Update authController.js googleAuth function
2. Test token verification with real Google tokens
3. Handle new vs returning users
4. Generate unique usernames
5. Store google_id correctly
6. Test in Postman

## Files to modify:
- controllers/authController.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "authentication", "backend"],
  },
  {
    title: "🔐 AUTH-003: Build Frontend Google Login Button",
    body: `Create Google login UI component.

## Steps:
1. Install @react-oauth/google package
2. Create GoogleLoginButton component
3. Wrap app in GoogleOAuthProvider
4. Handle successful login response
5. Send token to backend
6. Store JWT in localStorage
7. Redirect to dashboard

## Files to create:
- components/GoogleLoginButton.jsx

## Estimated Time: 1 day`,
    labels: ["phase-1", "authentication", "frontend"],
  },
  {
    title: "👤 USER-001: Create User Controller",
    body: `Build user CRUD endpoints.

## Endpoints:
- GET /users/:id
- GET /users/username/:username
- PUT /users/profile
- POST /users/become-seller

## Files to create:
- controllers/userController.js
- routes/users.js

## Estimated Time: 2 days`,
    labels: ["phase-1", "user-management", "backend"],
  },
  {
    title: "🎵 SERVICE-001: Create Service CRUD",
    body: `Build service creation and management.

## Endpoints:
- POST /services
- GET /services
- GET /services/:id
- PUT /services/:id
- DELETE /services/:id

## Files to create:
- controllers/serviceController.js
- routes/services.js

## Estimated Time: 3 days`,
    labels: ["phase-1", "services", "backend"],
  },
  {
    title: "📁 FILE-001: Setup Cloud Storage",
    body: `Configure AWS S3 or Cloudflare R2.

## Steps:
1. Choose S3 or R2
2. Create bucket
3. Configure credentials
4. Test connection

## Estimated Time: 1 day`,
    labels: ["phase-1", "file-upload", "setup"],
  },
  {
    title: "📁 FILE-002: Build File Upload System",
    body: `Implement file uploads.

## Steps:
1. Setup Multer middleware
2. Create upload endpoint
3. Upload to cloud storage
4. Generate presigned URLs

## Files to create:
- middleware/upload.js
- controllers/fileController.js

## Estimated Time: 1.5 days`,
    labels: ["phase-1", "file-upload", "backend"],
  },
  {
    title: "💳 PAYMENT-001: Setup Stripe",
    body: `Configure Stripe for payments.

## Steps:
1. Create Stripe account
2. Get test API keys
3. Setup Stripe Connect
4. Add keys to .env

## Estimated Time: 1 day`,
    labels: ["phase-1", "payments", "setup"],
  },
  {
    title: "💳 PAYMENT-002: Build Payment Endpoints",
    body: `Implement Stripe payment processing.

## Endpoints:
- POST /payments/create-intent
- POST /payments/webhook
- POST /payments/release-escrow

## Files to create:
- controllers/paymentController.js
- webhooks/stripeWebhook.js

## Estimated Time: 3 days`,
    labels: ["phase-1", "payments", "backend"],
  },
  {
    title: "🛒 ORDER-001: Create Order System",
    body: `Build order management.

## Endpoints:
- POST /orders
- GET /orders
- GET /orders/:id
- PUT /orders/:id/upload-files
- PUT /orders/:id/deliver
- PUT /orders/:id/complete

## Files to create:
- controllers/orderController.js
- routes/orders.js

## Estimated Time: 4 days`,
    labels: ["phase-1", "orders", "backend"],
  },
  {
    title: "📜 CONTRACT-001: Build Contract System",
    body: `Auto-generate contracts for collaborations.

## Steps:
1. Create contract template
2. Setup PDF generation
3. Store contracts in S3
4. Link to orders

## Files to create:
- controllers/contractController.js
- templates/contractTemplate.js

## Estimated Time: 2 days`,
    labels: ["phase-1", "contracts", "backend"],
  },
  {
    title: "📦 SUB-001: Build Subscription System",
    body: `Handle recurring subscriptions.

## Endpoints:
- POST /subscriptions
- GET /subscriptions/my
- DELETE /subscriptions/:id
- POST /subscriptions/:service_id/upload-pack

## Files to create:
- controllers/subscriptionController.js
- routes/subscriptions.js

## Estimated Time: 3 days`,
    labels: ["phase-1", "subscriptions", "backend"],
  },
  {
    title: "📥 DOWNLOAD-001: Build Download Tracking",
    body: `Track file downloads.

## Endpoints:
- POST /downloads/order/:orderId
- POST /downloads/pack/:packId
- GET /downloads/my

## Files to create:
- controllers/downloadController.js
- routes/downloads.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "downloads", "backend"],
  },
  {
    title: "🚨 DISPUTE-001: Build Dispute System",
    body: `Handle order disputes.

## Endpoints:
- POST /disputes
- GET /disputes
- GET /disputes/:id

## Files to create:
- controllers/disputeController.js
- routes/disputes.js

## Estimated Time: 2 days`,
    labels: ["phase-1", "disputes", "backend"],
  },
  {
    title: "👑 ADMIN-001: Build Admin System",
    body: `Create admin panel and routes.

## Endpoints:
- GET /admin/dashboard
- GET /admin/users
- PUT /admin/users/:id/verify
- PUT /admin/disputes/:id/resolve

## Files to create:
- controllers/adminController.js
- routes/admin.js
- middleware/isAdmin.js

## Estimated Time: 2 days`,
    labels: ["phase-1", "admin", "backend"],
  },
  {
    title: "🎨 UI-001: Create Design System",
    body: `Define colors and components.

## Steps:
1. Configure Tailwind theme
2. Create Button component
3. Create Input component
4. Create Card component
5. Create Modal component

## Files to create:
- components/ui/Button.jsx
- components/ui/Input.jsx
- components/ui/Card.jsx
- components/ui/Modal.jsx

## Estimated Time: 2 days`,
    labels: ["phase-2", "frontend", "ui"],
  },
  {
    title: "🎨 UI-002: Create Layout Components",
    body: `Build app layout.

## Files to create:
- components/layout/Navbar.jsx
- components/layout/Footer.jsx
- components/layout/MainLayout.jsx

## Estimated Time: 1.5 days`,
    labels: ["phase-2", "frontend", "ui"],
  },
  {
    title: "🔐 AUTH-UI-001: Create Auth Context",
    body: `Build authentication state management.

## Files to create:
- context/AuthContext.jsx
- hooks/useAuth.js

## Estimated Time: 1 day`,
    labels: ["phase-2", "frontend", "authentication"],
  },
  {
    title: "🏠 PAGE-001: Build Homepage",
    body: `Create landing page.

## Files to create:
- pages/Home.jsx

## Estimated Time: 2 days`,
    labels: ["phase-2", "frontend", "ui"],
  },
  {
    title: "🔍 PAGE-002: Build Browse Services Page",
    body: `Create service listing.

## Files to create:
- pages/Browse.jsx
- components/ServiceCard.jsx
- components/Filters.jsx

## Estimated Time: 2.5 days`,
    labels: ["phase-2", "frontend", "services"],
  },
  {
    title: "🎵 PAGE-003: Build Service Detail Page",
    body: `Create service detail view.

## Files to create:
- pages/ServiceDetail.jsx

## Estimated Time: 1.5 days`,
    labels: ["phase-2", "frontend", "services"],
  },
  {
    title: "💳 PAGE-004: Build Checkout Page",
    body: `Create payment flow.

## Files to create:
- pages/Checkout.jsx
- components/StripePaymentForm.jsx

## Estimated Time: 2 days`,
    labels: ["phase-2", "frontend", "payments"],
  },
  {
    title: "📊 PAGE-005: Build Buyer Dashboard",
    body: `Create buyer order management.

## Files to create:
- pages/BuyerDashboard.jsx
- components/OrderCard.jsx

## Estimated Time: 2 days`,
    labels: ["phase-2", "frontend", "dashboard"],
  },
  {
    title: "📊 PAGE-006: Build Seller Dashboard",
    body: `Create seller management page.

## Files to create:
- pages/SellerDashboard.jsx

## Estimated Time: 2 days`,
    labels: ["phase-2", "frontend", "dashboard"],
  },
  {
    title: "🎵 PAGE-007: Build Create Service Form",
    body: `Create service creation UI.

## Files to create:
- pages/CreateService.jsx
- components/ServiceForm.jsx

## Estimated Time: 2.5 days`,
    labels: ["phase-2", "frontend", "services"],
  },
  {
    title: "✨ POLISH-001: Add Loading & Error States",
    body: `Implement UX improvements.

## Tasks:
- Add loading spinners
- Add error messages
- Add skeleton loaders
- Create ErrorBoundary

## Estimated Time: 2 days`,
    labels: ["phase-3", "frontend", "polish"],
  },
  {
    title: "📧 EMAIL-001: Setup Email System",
    body: `Configure transactional emails.

## Tasks:
- Setup email service (SendGrid/Mailgun)
- Create email templates
- Implement email triggers

## Estimated Time: 2 days`,
    labels: ["phase-3", "backend", "email"],
  },
  {
    title: "🔒 SECURITY-001: Add Rate Limiting",
    body: `Prevent API abuse.

## Tasks:
- Install express-rate-limit
- Add rate limiting to all endpoints
- Test rate limits

## Estimated Time: 0.5 day`,
    labels: ["phase-3", "backend", "security"],
  },
  {
    title: "🚀 DEPLOY-001: Setup Production Database",
    body: `Configure production MySQL.

## Tasks:
- Choose database host
- Create production database
- Run migrations

## Estimated Time: 1 day`,
    labels: ["phase-4", "deployment", "database"],
  },
  {
    title: "🚀 DEPLOY-002: Deploy Backend",
    body: `Host backend API.

## Tasks:
- Choose host (Railway/Render)
- Deploy backend
- Configure environment variables
- Setup custom domain

## Estimated Time: 1.5 days`,
    labels: ["phase-4", "deployment", "backend"],
  },
  {
    title: "🚀 DEPLOY-003: Deploy Frontend",
    body: `Host React app.

## Tasks:
- Choose host (Vercel/Netlify)
- Deploy frontend
- Configure environment variables
- Setup custom domain

## Estimated Time: 1 day`,
    labels: ["phase-4", "deployment", "frontend"],
  },
  {
    title: "🚀 DEPLOY-004: Switch Stripe to Live Mode",
    body: `Activate real payments.

## Tasks:
- Complete Stripe verification
- Switch to live API keys
- Test live payments
- Configure webhooks

## Estimated Time: 1 day`,
    labels: ["phase-4", "deployment", "payments"],
  },
  {
    title: "📄 LEGAL-001: Create Legal Pages",
    body: `Add required documentation.

## Files to create:
- pages/Terms.jsx
- pages/Privacy.jsx
- pages/Refund.jsx

## Estimated Time: 1 day`,
    labels: ["phase-5", "legal", "frontend"],
  },
  {
    title: "🧪 TEST-001: Beta Testing",
    body: `Test with real users.

## Tasks:
- Invite 10-20 beta testers
- Collect feedback
- Fix critical bugs

## Estimated Time: 3-5 days`,
    labels: ["phase-5", "testing"],
  },
  {
    title: "🎉 LAUNCH-001: Public Launch",
    body: `Go live!

## Tasks:
- Prepare announcement
- Post on social media
- Monitor for issues
- Celebrate! 🎉

## Estimated Time: Ongoing`,
    labels: ["phase-5", "launch", "marketing"],
  },
];

// Function to create issue
async function createIssue(issue, token, owner, repo) {
  return new Promise((resolve, reject) => {
    const payload = {
      title: issue.title,
      body: issue.body,
      labels: issue.labels,
    };

    const data = JSON.stringify(payload);

    const options = {
      hostname: "api.github.com",
      path: `/repos/${owner}/${repo}/issues`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Producer-Marketplace-Issues",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// Main function
async function main() {
  console.log("🚀 GitHub Issues Generator\n");

  const token = await prompt("GitHub Personal Access Token: ");
  const owner = await prompt("GitHub Username: ");
  const repo = await prompt("Repository Name: ");

  console.log(`\n📋 Will create ${issues.length} issues in ${owner}/${repo}`);
  const confirm = await prompt("\nContinue? (yes/no): ");

  if (confirm.toLowerCase() !== "yes" && confirm.toLowerCase() !== "y") {
    console.log("Cancelled.");
    rl.close();
    return;
  }

  console.log("\n⏳ Creating issues...\n");

  let success = 0;
  let failed = 0;

  for (let i = 0; i < issues.length; i++) {
    try {
      const result = await createIssue(issues[i], token, owner, repo);
      success++;
      console.log(
        `✅ [${i + 1}/${issues.length}] #${result.number}: ${issues[i].title}`
      );

      // Wait 1 second between requests
      if (i < issues.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (error) {
      failed++;
      console.error(
        `❌ [${i + 1}/${issues.length}] Failed: ${issues[i].title}`
      );
      console.error(`   ${error.message}\n`);
    }
  }

  console.log(`\n✨ Done!`);
  console.log(`   Success: ${success}`);
  console.log(`   Failed: ${failed}`);
  console.log(`\n🔗 View: https://github.com/${owner}/${repo}/issues\n`);

  rl.close();
}

main().catch((error) => {
  console.error("Fatal error:", error.message);
  rl.close();
  process.exit(1);
});
