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
      resolve(answer);
    });
  });
}

const issues = [
  // ========================================
  // PHASE 1: AUTHENTICATION (Issues 1-4)
  // ========================================
  {
    title: "🔐 AUTH-001: Setup Google Cloud Console",
    body: `Configure Google Cloud Console for OAuth.

## Steps:
1. [ ] Go to https://console.cloud.google.com
2. [ ] Create new project "Producer Marketplace"
3. [ ] Enable Google+ API
4. [ ] Create OAuth 2.0 credentials
5. [ ] Add authorized JavaScript origins: \`http://localhost:5173\`, \`https://yourdomain.com\`
6. [ ] Add authorized redirect URIs
7. [ ] Save Client ID and Client Secret to .env

## Acceptance Criteria:
- Google Cloud Console configured
- Credentials saved in .env
- Can test OAuth flow

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "authentication", "setup"],
    milestone: 1,
  },

  {
    title: "🔐 AUTH-002: Implement Real Google OAuth Backend",
    body: `Replace test auth endpoint with real Google OAuth.

## Steps:
1. [ ] Update authController.js googleAuth function
2. [ ] Test token verification with real Google tokens
3. [ ] Handle new vs returning users
4. [ ] Generate unique usernames
5. [ ] Store google_id correctly
6. [ ] Test in Postman with real Google token

## Acceptance Criteria:
- Can login with real Google account
- User created/updated in database
- JWT token returned
- Test endpoint removed

## Files to modify:
- controllers/authController.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "authentication", "backend"],
    milestone: 1,
  },

  {
    title: "🔐 AUTH-003: Build Frontend Google Login Button",
    body: `Create Google login UI component.

## Steps:
1. [ ] Install @react-oauth/google package
2. [ ] Create GoogleLoginButton component
3. [ ] Wrap app in GoogleOAuthProvider
4. [ ] Handle successful login response
5. [ ] Send token to backend /api/auth/google
6. [ ] Store JWT in localStorage
7. [ ] Redirect to dashboard
8. [ ] Test login flow end-to-end

## Acceptance Criteria:
- Google login button works
- User can login with Google account
- JWT stored and working
- Redirects appropriately

## Files to create/modify:
- components/GoogleLoginButton.jsx
- App.jsx

## Estimated Time: 1 day`,
    labels: ["phase-1", "authentication", "frontend"],
    milestone: 1,
  },

  {
    title: "🔐 AUTH-004: Implement Token Refresh Logic",
    body: `Handle JWT token expiration and auto-refresh.

## Steps:
1. [ ] Create token refresh endpoint in authController
2. [ ] Add route POST /api/auth/refresh
3. [ ] Create useAuth hook with refresh logic
4. [ ] Check token expiry on app load
5. [ ] Auto-refresh before expiry (e.g., 5 min before)
6. [ ] Handle refresh failures (logout user)
7. [ ] Test refresh flow

## Acceptance Criteria:
- Tokens auto-refresh before expiry
- User stays logged in seamlessly
- Failed refresh logs user out

## Files to create/modify:
- controllers/authController.js (already has refreshToken)
- hooks/useAuth.js
- context/AuthContext.jsx

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "authentication", "frontend", "backend"],
    milestone: 1,
  },

  // ========================================
  // PHASE 1: USER MANAGEMENT (Issues 5-9)
  // ========================================
  {
    title: "👤 USER-001: Create User Controller - Get User",
    body: `Build endpoints to retrieve user data.

## Steps:
1. [ ] Create getUserById function in userController.js
2. [ ] Create getUserByUsername function
3. [ ] Add validation for user ID/username
4. [ ] Exclude sensitive fields (password_hash, google_id)
5. [ ] Handle user not found errors
6. [ ] Test in Postman

## Acceptance Criteria:
- GET /api/users/:id returns user
- GET /api/users/username/:username returns user
- Sensitive data excluded
- 404 if user not found

## Files to create:
- controllers/userController.js

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "user-management", "backend"],
    milestone: 1,
  },

  {
    title: "👤 USER-002: Create User Routes",
    body: `Setup user API routes.

## Steps:
1. [ ] Create routes/users.js file
2. [ ] Add GET /users/:id (public)
3. [ ] Add GET /users/username/:username (public)
4. [ ] Add PUT /users/profile (protected)
5. [ ] Add POST /users/become-seller (protected)
6. [ ] Add PUT /users/seller-info (protected, seller only)
7. [ ] Import routes in routes/index.js
8. [ ] Test all routes in Postman

## Acceptance Criteria:
- All routes respond correctly
- Protected routes require auth
- Public routes accessible without token

## Files to create:
- routes/users.js

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "user-management", "backend"],
    milestone: 1,
  },

  {
    title: "👤 USER-003: Update User Profile",
    body: `Allow users to update their profile.

## Steps:
1. [ ] Create updateProfile function in userController
2. [ ] Allow updating: display_name, bio, instagram_handle
3. [ ] Validate input data
4. [ ] Ensure user can only update own profile
5. [ ] Return updated user data
6. [ ] Test in Postman

## Acceptance Criteria:
- PUT /api/users/profile updates user
- Only owner can update
- Validation works correctly
- Updated data returned

## Files to modify:
- controllers/userController.js

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "user-management", "backend"],
    milestone: 1,
  },

  {
    title: "👤 USER-004: Become Seller Feature",
    body: `Allow users to enable seller account.

## Steps:
1. [ ] Create becomeSeller function in userController
2. [ ] Update user.is_seller to true
3. [ ] Add timestamp for when became seller
4. [ ] Return success message
5. [ ] Test in Postman
6. [ ] Ensure can't become seller twice

## Acceptance Criteria:
- POST /api/users/become-seller enables seller mode
- is_seller set to true
- Idempotent (can call multiple times safely)

## Files to modify:
- controllers/userController.js

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "user-management", "backend"],
    milestone: 1,
  },

  {
    title: "👤 USER-005: Update Seller Information",
    body: `Allow sellers to update additional seller info.

## Steps:
1. [ ] Create updateSellerInfo function
2. [ ] Check user is_seller = true
3. [ ] Allow updating seller-specific fields
4. [ ] Add validation
5. [ ] Test in Postman

## Acceptance Criteria:
- PUT /api/users/seller-info works
- Only sellers can access
- Validation in place

## Files to modify:
- controllers/userController.js

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "user-management", "backend"],
    milestone: 1,
  },

  // ========================================
  // PHASE 1: SERVICES (Issues 10-15)
  // ========================================
  {
    title: "🎵 SERVICE-001: Create Service Model Validation",
    body: `Add validation helpers for service creation.

## Steps:
1. [ ] Create validation middleware for service data
2. [ ] Validate title (min 5, max 200 chars)
3. [ ] Validate price (min $1, max $10,000)
4. [ ] Validate type (enum: collaboration, subscription, etc.)
5. [ ] Validate delivery_time_days (1-90)
6. [ ] Add validation to routes

## Acceptance Criteria:
- Invalid data rejected with clear errors
- Valid data passes through

## Files to create:
- middleware/validation.js

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "services", "backend"],
    milestone: 1,
  },

  {
    title: "🎵 SERVICE-002: Create Service - Basic CRUD",
    body: `Build service creation endpoint.

## Steps:
1. [ ] Create serviceController.js
2. [ ] Implement createService function
3. [ ] Check user is_seller = true
4. [ ] Set seller_id from req.user.id
5. [ ] Validate all required fields
6. [ ] Save service to database
7. [ ] Return created service
8. [ ] Test in Postman

## Acceptance Criteria:
- POST /api/services creates service
- Only sellers can create
- Validation works
- Service saved correctly

## Files to create:
- controllers/serviceController.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "services", "backend"],
    milestone: 1,
  },

  {
    title: "🎵 SERVICE-003: List & Filter Services",
    body: `Build service listing with filters.

## Steps:
1. [ ] Create getServices function
2. [ ] Implement query filters: type, price_min, price_max, seller_id, tags
3. [ ] Add sorting: popular, newest, price_low, price_high
4. [ ] Implement pagination (page, limit)
5. [ ] Return total count for pagination
6. [ ] Test all filter combinations in Postman

## Acceptance Criteria:
- GET /api/services returns paginated list
- Filters work correctly
- Sorting works
- Includes pagination metadata

## Files to modify:
- controllers/serviceController.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "services", "backend"],
    milestone: 1,
  },

  {
    title: "🎵 SERVICE-004: Get Service Detail",
    body: `Retrieve single service with full details.

## Steps:
1. [ ] Create getServiceById function
2. [ ] Include seller information (join User)
3. [ ] Include related data (total_sales, etc.)
4. [ ] Handle service not found
5. [ ] Test in Postman

## Acceptance Criteria:
- GET /api/services/:id returns full service
- Includes seller info
- 404 if not found

## Files to modify:
- controllers/serviceController.js

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "services", "backend"],
    milestone: 1,
  },

  {
    title: "🎵 SERVICE-005: Update & Delete Service",
    body: `Allow service owners to modify their services.

## Steps:
1. [ ] Create updateService function
2. [ ] Verify owner (seller_id = req.user.id)
3. [ ] Update allowed fields
4. [ ] Create deleteService function
5. [ ] Soft delete (set is_active = false) or hard delete
6. [ ] Test in Postman

## Acceptance Criteria:
- PUT /api/services/:id updates service
- DELETE /api/services/:id deletes service
- Only owner can modify
- 403 if not owner

## Files to modify:
- controllers/serviceController.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "services", "backend"],
    milestone: 1,
  },

  {
    title: "🎵 SERVICE-006: Search Services",
    body: `Implement service search functionality.

## Steps:
1. [ ] Create searchServices function
2. [ ] Search in title, description, tags
3. [ ] Use SQL LIKE or full-text search
4. [ ] Return ranked results
5. [ ] Test search queries in Postman

## Acceptance Criteria:
- GET /api/services/search?q=trap returns matching services
- Searches title, description, tags
- Results are relevant

## Files to modify:
- controllers/serviceController.js

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "services", "backend"],
    milestone: 1,
  },

  // ========================================
  // PHASE 1: FILE UPLOADS (Issues 16-19)
  // ========================================
  {
    title: "📁 FILE-001: Setup Cloud Storage Account",
    body: `Configure AWS S3 or Cloudflare R2.

## Steps:
1. [ ] Choose between AWS S3 or Cloudflare R2
2. [ ] Create account
3. [ ] Create bucket (e.g., "producer-marketplace-files")
4. [ ] Configure bucket permissions (private)
5. [ ] Get access credentials
6. [ ] Add credentials to .env
7. [ ] Test connection

## Acceptance Criteria:
- Cloud storage account created
- Bucket configured
- Credentials in .env
- Can connect from backend

## Estimated Time: 1 day`,
    labels: ["phase-1", "file-upload", "setup"],
    milestone: 1,
  },

  {
    title: "📁 FILE-002: Setup Multer Middleware",
    body: `Configure file upload handling.

## Steps:
1. [ ] Install multer package
2. [ ] Create middleware/upload.js
3. [ ] Configure file type validation (WAV, MP3, ZIP, MIDI)
4. [ ] Set file size limit (1GB)
5. [ ] Configure multer storage (memory or disk temp)
6. [ ] Add error handling
7. [ ] Test file upload

## Acceptance Criteria:
- Multer configured
- File types validated
- Size limits enforced
- Errors handled gracefully

## Files to create:
- middleware/upload.js

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "file-upload", "backend"],
    milestone: 1,
  },

  {
    title: "📁 FILE-003: Upload Files to Cloud Storage",
    body: `Build file upload to S3/R2 endpoint.

## Steps:
1. [ ] Create fileController.js
2. [ ] Install aws-sdk or @aws-sdk/client-s3
3. [ ] Create uploadFile function
4. [ ] Accept file from multer
5. [ ] Generate unique filename
6. [ ] Upload to S3/R2
7. [ ] Save file metadata to database
8. [ ] Return file URL
9. [ ] Test in Postman

## Acceptance Criteria:
- POST /api/files/upload uploads file
- File stored in cloud
- Metadata saved in database
- URL returned

## Files to create:
- controllers/fileController.js
- routes/files.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "file-upload", "backend"],
    milestone: 1,
  },

  {
    title: "📁 FILE-004: Generate Download URLs",
    body: `Create presigned URLs for secure downloads.

## Steps:
1. [ ] Create getDownloadUrl function
2. [ ] Verify user has access to file
3. [ ] Generate presigned URL (expires in 1 hour)
4. [ ] Return URL to frontend
5. [ ] Test download in Postman

## Acceptance Criteria:
- GET /api/files/download/:id returns presigned URL
- URL expires after set time
- Only authorized users get access
- Downloads work

## Files to modify:
- controllers/fileController.js

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "file-upload", "backend"],
    milestone: 1,
  },

  // ========================================
  // PHASE 1: PAYMENTS (Issues 20-24)
  // ========================================
  {
    title: "💳 PAYMENT-001: Setup Stripe Account",
    body: `Create and configure Stripe account.

## Steps:
1. [ ] Create Stripe account at stripe.com
2. [ ] Complete business verification (can do later for test mode)
3. [ ] Get test mode API keys
4. [ ] Add keys to .env (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY)
5. [ ] Install stripe package: npm install stripe
6. [ ] Test connection

## Acceptance Criteria:
- Stripe account created
- Test keys in .env
- Can make test API calls

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "payments", "setup"],
    milestone: 1,
  },

  {
    title: "💳 PAYMENT-002: Setup Stripe Connect",
    body: `Configure Stripe Connect for marketplace payments.

## Steps:
1. [ ] Enable Stripe Connect in dashboard
2. [ ] Choose "Platform" account type
3. [ ] Configure onboarding settings
4. [ ] Create seller onboarding endpoint
5. [ ] Generate account links for sellers
6. [ ] Test seller onboarding flow

## Acceptance Criteria:
- Stripe Connect enabled
- Sellers can connect accounts
- Can transfer money to connected accounts

## Estimated Time: 1 day`,
    labels: ["phase-1", "payments", "backend"],
    milestone: 1,
  },

  {
    title: "💳 PAYMENT-003: Create Payment Intent Endpoint",
    body: `Build endpoint to initialize payments.

## Steps:
1. [ ] Create paymentController.js
2. [ ] Create createPaymentIntent function
3. [ ] Calculate amount + 8% platform fee
4. [ ] Create Stripe PaymentIntent
5. [ ] For collaborations: set capture_method to 'manual' (escrow)
6. [ ] For products: auto-capture
7. [ ] Return client_secret to frontend
8. [ ] Test in Postman

## Acceptance Criteria:
- POST /api/payments/create-intent creates payment
- Escrow works for collaborations
- Auto-capture for products
- Client secret returned

## Files to create:
- controllers/paymentController.js
- routes/payments.js

## Estimated Time: 1.5 days`,
    labels: ["phase-1", "payments", "backend"],
    milestone: 1,
  },

  {
    title: "💳 PAYMENT-004: Setup Stripe Webhooks",
    body: `Handle Stripe webhook events.

## Steps:
1. [ ] Create webhooks/stripeWebhook.js
2. [ ] Add webhook route POST /api/payments/webhook
3. [ ] Verify webhook signature
4. [ ] Handle payment_intent.succeeded
5. [ ] Handle payment_intent.payment_failed
6. [ ] Handle transfer.created
7. [ ] Update order status based on events
8. [ ] Test with Stripe CLI

## Acceptance Criteria:
- Webhooks verified and processed
- Order statuses update correctly
- Errors logged appropriately

## Files to create:
- webhooks/stripeWebhook.js

## Estimated Time: 1.5 days`,
    labels: ["phase-1", "payments", "backend"],
    milestone: 1,
  },

  {
    title: "💳 PAYMENT-005: Escrow Release Logic",
    body: `Build logic to release escrowed payments.

## Steps:
1. [ ] Create releaseEscrow function in paymentController
2. [ ] Verify order is delivered
3. [ ] Capture payment intent
4. [ ] Transfer to seller (minus 8% fee)
5. [ ] Update order.escrow_status to 'released'
6. [ ] Create transaction record
7. [ ] Test escrow flow end-to-end

## Acceptance Criteria:
- Escrow released when order delivered
- Seller receives payment minus fee
- Transaction recorded

## Files to modify:
- controllers/paymentController.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "payments", "backend"],
    milestone: 1,
  },

  // ========================================
  // PHASE 1: ORDERS (Issues 25-30)
  // ========================================
  {
    title: "🛒 ORDER-001: Create Order Endpoint",
    body: `Build order creation with payment.

## Steps:
1. [ ] Create orderController.js
2. [ ] Create createOrder function
3. [ ] Validate service exists and is active
4. [ ] Create payment intent
5. [ ] Generate order_number (ORD-YYYYMMDD-XXXX)
6. [ ] Calculate amounts (total, fee, seller amount)
7. [ ] Set delivery_deadline (created_at + 14 days for collaborations)
8. [ ] Create order in database
9. [ ] Return order + payment info
10. [ ] Test in Postman

## Acceptance Criteria:
- POST /api/orders creates order
- Payment processed
- Order saved with correct status
- Deadlines set correctly

## Files to create:
- controllers/orderController.js
- routes/orders.js

## Estimated Time: 2 days`,
    labels: ["phase-1", "orders", "backend"],
    milestone: 1,
  },

  {
    title: "🛒 ORDER-002: List User Orders",
    body: `Get orders filtered by role.

## Steps:
1. [ ] Create getOrders function
2. [ ] Filter by buyer_id if role=buyer
3. [ ] Filter by seller_id if role=seller
4. [ ] Include service and user details (joins)
5. [ ] Add pagination
6. [ ] Sort by created_at DESC
7. [ ] Test in Postman

## Acceptance Criteria:
- GET /api/orders?role=buyer returns buyer's orders
- GET /api/orders?role=seller returns seller's orders
- Includes related data
- Paginated

## Files to modify:
- controllers/orderController.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "orders", "backend"],
    milestone: 1,
  },

  {
    title: "🛒 ORDER-003: Get Order Detail",
    body: `Retrieve single order with full details.

## Steps:
1. [ ] Create getOrderById function
2. [ ] Verify user is buyer or seller
3. [ ] Include service details
4. [ ] Include buyer and seller info
5. [ ] Include contract if collaboration
6. [ ] Return full order data
7. [ ] Test in Postman

## Acceptance Criteria:
- GET /api/orders/:id returns order
- Only buyer/seller can access
- All related data included
- 403 if unauthorized

## Files to modify:
- controllers/orderController.js

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "orders", "backend"],
    milestone: 1,
  },

  {
    title: "🛒 ORDER-004: Upload Buyer Files (Collaboration)",
    body: `Allow buyer to upload loops for collaboration.

## Steps:
1. [ ] Create uploadBuyerFiles function
2. [ ] Verify user is buyer
3. [ ] Verify service type is collaboration
4. [ ] Verify order status is awaiting_upload
5. [ ] Accept file uploads (multiple files)
6. [ ] Save files to S3/R2
7. [ ] Update order.buyer_files with URLs
8. [ ] Update status to in_progress
9. [ ] Notify seller
10. [ ] Test in Postman

## Acceptance Criteria:
- PUT /api/orders/:id/upload-files accepts files
- Only buyer can upload
- Status changes correctly
- Seller notified

## Files to modify:
- controllers/orderController.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "orders", "backend"],
    milestone: 1,
  },

  {
    title: "🛒 ORDER-005: Deliver Seller Files",
    body: `Allow seller to deliver finished work.

## Steps:
1. [ ] Create deliverOrder function
2. [ ] Verify user is seller
3. [ ] Verify order status is in_progress
4. [ ] Accept file uploads
5. [ ] Save files to S3/R2
6. [ ] Update order.seller_files with URLs
7. [ ] Update status to delivered
8. [ ] Notify buyer
9. [ ] Test in Postman

## Acceptance Criteria:
- PUT /api/orders/:id/deliver uploads files
- Only seller can deliver
- Status changes to delivered
- Buyer notified

## Files to modify:
- controllers/orderController.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "orders", "backend"],
    milestone: 1,
  },

  {
    title: "🛒 ORDER-006: Complete Order & Release Payment",
    body: `Finalize order and release escrow.

## Steps:
1. [ ] Create completeOrder function
2. [ ] Verify user is buyer
3. [ ] Verify order status is delivered
4. [ ] Update status to completed
5. [ ] Set completed_at timestamp
6. [ ] Trigger escrow release
7. [ ] Update service.total_sales count
8. [ ] Test in Postman

## Acceptance Criteria:
- PUT /api/orders/:id/complete finalizes order
- Only buyer can complete
- Payment released to seller
- Stats updated

## Files to modify:
- controllers/orderController.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "orders", "backend"],
    milestone: 1,
  },

  // ========================================
  // PHASE 1: CONTRACTS (Issues 31-32)
  // ========================================
  {
    title: "📜 CONTRACT-001: Create Contract Template",
    body: `Define standard collaboration contract terms.

## Steps:
1. [ ] Write standard contract text
2. [ ] Define variables: {buyer_name}, {seller_name}, {price}, {date}
3. [ ] Include terms: delivery time, rights, credits, refunds
4. [ ] Save template as string or file
5. [ ] Review for legal basics (consult lawyer later)

## Acceptance Criteria:
- Contract template created
- All variables defined
- Terms are clear

## Files to create:
- templates/contractTemplate.js

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "contracts", "backend"],
    milestone: 1,
  },

  {
    title: "📜 CONTRACT-002: Generate & Store Contracts",
    body: `Auto-generate contracts for collaborations.

## Steps:
1. [ ] Install pdfkit: npm install pdfkit
2. [ ] Create contractController.js
3. [ ] Create generateContract function
4. [ ] Replace template variables with order data
5. [ ] Generate PDF
6. [ ] Upload PDF to S3/R2
7. [ ] Save contract record to database
8. [ ] Link to order
9. [ ] Test contract generation

## Acceptance Criteria:
- Contract auto-generated on collaboration purchase
- PDF created and stored
- Contract linked to order
- Accessible to both parties

## Files to create:
- controllers/contractController.js
- utils/pdfGenerator.js

## Estimated Time: 1.5 days`,
    labels: ["phase-1", "contracts", "backend"],
    milestone: 1,
  },

  // ========================================
  // PHASE 1: SUBSCRIPTIONS (Issues 33-35)
  // ========================================
  {
    title: "📦 SUB-001: Create Subscription Endpoint",
    body: `Handle recurring subscriptions via Stripe.

## Steps:
1. [ ] Create subscriptionController.js
2. [ ] Create createSubscription function
3. [ ] Create Stripe subscription
4. [ ] Save subscription to database
5. [ ] Grant access to all past packs
6. [ ] Return subscription data
7. [ ] Test in Postman

## Acceptance Criteria:
- POST /api/subscriptions creates subscription
- Stripe subscription created
- Database record saved
- Access granted to packs

## Files to create:
- controllers/subscriptionController.js
- routes/subscriptions.js

## Estimated Time: 1.5 days`,
    labels: ["phase-1", "subscriptions", "backend"],
    milestone: 1,
  },

  {
    title: "📦 SUB-002: Upload Subscription Pack",
    body: `Allow sellers to upload monthly packs.

## Steps:
1. [ ] Create uploadPack function
2. [ ] Verify user owns subscription service
3. [ ] Accept file uploads
4. [ ] Create pack title & description
5. [ ] Save files to S3/R2
6. [ ] Create SubscriptionPack record
7. [ ] Notify all active subscribers
8. [ ] Test in Postman

## Acceptance Criteria:
- POST /api/subscriptions/:service_id/upload-pack uploads pack
- Only service owner can upload
- Subscribers notified
- Pack accessible immediately

## Files to modify:
- controllers/subscriptionController.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "subscriptions", "backend"],
    milestone: 1,
  },

  {
    title: "📦 SUB-003: Cancel Subscription",
    body: `Allow users to cancel subscriptions.

## Steps:
1. [ ] Create cancelSubscription function
2. [ ] Verify user owns subscription
3. [ ] Cancel in Stripe
4. [ ] Update subscription status to cancelled
5. [ ] Set cancelled_at timestamp
6. [ ] User keeps downloaded content
7. [ ] Test in Postman

## Acceptance Criteria:
- DELETE /api/subscriptions/:id cancels subscription
- Stripe subscription cancelled
- No future charges
- Past downloads retained

## Files to modify:
- controllers/subscriptionController.js

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "subscriptions", "backend"],
    milestone: 1,
  },

  // ========================================
  // PHASE 1: DOWNLOADS (Issues 36)
  // ========================================
  {
    title: "📥 DOWNLOAD-001: Build Download Tracking",
    body: `Track and manage file downloads.

## Steps:
1. [ ] Create downloadController.js
2. [ ] Create downloadFile function
3. [ ] Verify user has access (purchased or subscribed)
4. [ ] Generate presigned URL
5. [ ] Record download in database
6. [ ] Return download URL
7. [ ] Create getMyDownloads function (history)
8. [ ] Test in Postman

## Acceptance Criteria:
- POST /api/downloads/order/:orderId downloads files
- POST /api/downloads/pack/:packId downloads pack
- GET /api/downloads/my shows history
- Access control works

## Files to create:
- controllers/downloadController.js
- routes/downloads.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "downloads", "backend"],
    milestone: 1,
  },

  // ========================================
  // PHASE 1: DISPUTES (Issues 37-38)
  // ========================================
  {
    title: "🚨 DISPUTE-001: Create Dispute System",
    body: `Build dispute creation endpoint.

## Steps:
1. [ ] Create disputeController.js
2. [ ] Create createDispute function
3. [ ] Verify user is buyer or seller
4. [ ] Accept reason, description, evidence_urls
5. [ ] Create dispute record
6. [ ] Update order status to disputed
7. [ ] Notify other party
8. [ ] Test in Postman

## Acceptance Criteria:
- POST /api/disputes creates dispute
- Order status updates
- Both parties notified

## Files to create:
- controllers/disputeController.js
- routes/disputes.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "disputes", "backend"],
    milestone: 1,
  },

  {
    title: "🚨 DISPUTE-002: Admin Dispute Resolution",
    body: `Allow admins to resolve disputes.

## Steps:
1. [ ] Create resolveDispute function in adminController
2. [ ] Verify user is admin (add is_admin to User model)
3. [ ] Accept resolution: refund_buyer, release_to_seller, partial_refund
4. [ ] Process resolution (refund or release payment)
5. [ ] Update dispute status to resolved
6. [ ] Set resolved_at timestamp
7. [ ] Notify both parties
8. [ ] Test in Postman

## Acceptance Criteria:
- PUT /admin/disputes/:id/resolve processes resolution
- Only admins can access
- Payment processed correctly
- Both parties notified

## Files to create:
- controllers/adminController.js
- middleware/isAdmin.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "disputes", "admin", "backend"],
    milestone: 1,
  },

  // ========================================
  // PHASE 1: ADMIN (Issues 39-40)
  // ========================================
  {
    title: "👑 ADMIN-001: Setup Admin System",
    body: `Create admin role and middleware.

## Steps:
1. [ ] Add is_admin field to User model
2. [ ] Run migration to add column
3. [ ] Create middleware/isAdmin.js
4. [ ] Check if req.user.is_admin === true
5. [ ] Return 403 if not admin
6. [ ] Manually set your user to admin in database
7. [ ] Test admin access

## Acceptance Criteria:
- is_admin field exists
- Admin middleware works
- Non-admins get 403
- Your account is admin

## Files to modify:
- models/User.js

## Files to create:
- middleware/isAdmin.js

## Estimated Time: 0.5 day`,
    labels: ["phase-1", "admin", "backend"],
    milestone: 1,
  },

  {
    title: "👑 ADMIN-002: Admin Dashboard & Stats",
    body: `Build admin dashboard with platform stats.

## Steps:
1. [ ] Create getDashboardStats function
2. [ ] Count total users
3. [ ] Count total sellers
4. [ ] Count total services
5. [ ] Count total orders
6. [ ] Calculate total revenue
7. [ ] Count active disputes
8. [ ] Return all stats
9. [ ] Test in Postman

## Acceptance Criteria:
- GET /admin/dashboard returns stats
- Only admins can access
- All metrics calculated correctly

## Files to modify:
- controllers/adminController.js

## Files to create:
- routes/admin.js

## Estimated Time: 1 day`,
    labels: ["phase-1", "admin", "backend"],
    milestone: 1,
  },

  // ========================================
  // PHASE 2: FRONTEND SETUP (Issues 41-44)
  // ========================================
  {
    title: "🎨 UI-001: Create Design System",
    body: `Define colors, typography, and spacing.

## Steps:
1. [ ] Define color palette (primary, secondary, accent, grays)
2. [ ] Configure Tailwind theme in tailwind.config.js
3. [ ] Define typography scale
4. [ ] Create spacing/sizing system
5. [ ] Document design tokens
6. [ ] Test colors in UI

## Acceptance Criteria:
- Colors defined and working
- Typography consistent
- Tailwind config updated

## Files to modify:
- tailwind.config.js

## Estimated Time: 0.5 day`,
    labels: ["phase-2", "frontend", "design"],
    milestone: 2,
  },

  {
    title: "🎨 UI-002: Build Reusable Components",
    body: `Create component library.

## Steps:
1. [ ] Create Button component (variants: primary, secondary, danger)
2. [ ] Create Input component
3. [ ] Create Card component
4. [ ] Create Modal component
5. [ ] Create LoadingSpinner component
6. [ ] Create Toast/Alert component
7. [ ] Test all components

## Acceptance Criteria:
- All base components created
- Props work correctly
- Consistent styling

## Files to create:
- components/ui/Button.jsx
- components/ui/Input.jsx
- components/ui/Card.jsx
- components/ui/Modal.jsx
- components/ui/LoadingSpinner.jsx
- components/ui/Toast.jsx

## Estimated Time: 2 days`,
    labels: ["phase-2", "frontend", "ui"],
    milestone: 2,
  },

  {
    title: "🎨 UI-003: Create Layout Components",
    body: `Build app layout structure.

## Steps:
1. [ ] Create Navbar component
2. [ ] Create Footer component
3. [ ] Create Sidebar component (for dashboards)
4. [ ] Create MainLayout wrapper
5. [ ] Add responsive breakpoints
6. [ ] Test on mobile/tablet/desktop

## Acceptance Criteria:
- Layout components created
- Responsive design works
- Navigation functional

## Files to create:
- components/layout/Navbar.jsx
- components/layout/Footer.jsx
- components/layout/Sidebar.jsx
- components/layout/MainLayout.jsx

## Estimated Time: 1.5 days`,
    labels: ["phase-2", "frontend", "ui"],
    milestone: 2,
  },

  {
    title: "🔐 AUTH-UI-001: Create Auth Context & Hooks",
    body: `Build authentication state management.

## Steps:
1. [ ] Create AuthContext.jsx
2. [ ] Create AuthProvider component
3. [ ] Implement login function
4. [ ] Implement logout function
5. [ ] Store token in localStorage
6. [ ] Create useAuth hook
7. [ ] Handle token refresh
8. [ ] Test auth flow

## Acceptance Criteria:
- AuthContext provides auth state
- useAuth hook works
- Tokens stored/retrieved correctly
- Auto-refresh implemented

## Files to create:
- context/AuthContext.jsx
- hooks/useAuth.js

## Estimated Time: 1 day`,
    labels: ["phase-2", "frontend", "authentication"],
    milestone: 2,
  },

  {
    title: "🔐 AUTH-UI-002: Build Login Page",
    body: `Create Google login UI.

## Steps:
1. [ ] Install @react-oauth/google
2. [ ] Create Login.jsx page
3. [ ] Add GoogleOAuthProvider to App.jsx
4. [ ] Create Google login button
5. [ ] Handle successful login
6. [ ] Send token to backend
7. [ ] Store JWT and user data
8. [ ] Redirect to dashboard
9. [ ] Test login flow

## Acceptance Criteria:
- Login page renders
- Google login works
- User redirected after login
- Token stored correctly

## Files to create:
- pages/Login.jsx
- components/GoogleLoginButton.jsx

## Estimated Time: 1 day`,
    labels: ["phase-2", "frontend", "authentication"],
    milestone: 2,
  },

  {
    title: "🔐 AUTH-UI-003: Create Protected Routes",
    body: `Implement route protection.

## Steps:
1. [ ] Create ProtectedRoute component
2. [ ] Check if user is logged in
3. [ ] Redirect to login if not authenticated
4. [ ] Create SellerRoute for seller-only pages
5. [ ] Test protected routes

## Acceptance Criteria:
- Protected routes require auth
- Redirects work correctly
- Seller routes check is_seller

## Files to create:
- components/ProtectedRoute.jsx
- components/SellerRoute.jsx

## Estimated Time: 0.5 day`,
    labels: ["phase-2", "frontend", "authentication"],
    milestone: 2,
  },

  {
    title: "🏠 PAGE-001: Build Homepage",
    body: `Create landing page.

## Steps:
1. [ ] Create Home.jsx page
2. [ ] Build hero section
3. [ ] Add "How it works" section
4. [ ] Show featured services
5. [ ] Add CTA buttons
6. [ ] Make responsive
7. [ ] Test on all devices

## Acceptance Criteria:
- Homepage looks professional
- All sections present
- Responsive design
- CTAs work

## Files to create:
- pages/Home.jsx

## Estimated Time: 2 days`,
    labels: ["phase-2", "frontend", "ui"],
    milestone: 2,
  },

  {
    title: "🔍 PAGE-002: Build Browse Services Page",
    body: `Create service listing page.

## Steps:
1. [ ] Create Browse.jsx page
2. [ ] Fetch services from API
3. [ ] Create ServiceCard component
4. [ ] Implement filters (type, price)
5. [ ] Add search bar
6. [ ] Implement pagination
7. [ ] Add loading states
8. [ ] Test filters and search

## Acceptance Criteria:
- Services display in grid
- Filters work
- Search works
- Pagination works
- Loading states shown

## Files to create:
- pages/Browse.jsx
- components/ServiceCard.jsx
- components/Filters.jsx

## Estimated Time: 2.5 days`,
    labels: ["phase-2", "frontend", "services"],
    milestone: 2,
  },

  {
    title: "🎵 PAGE-003: Build Service Detail Page",
    body: `Create individual service page.

## Steps:
1. [ ] Create ServiceDetail.jsx page
2. [ ] Fetch service by ID
3. [ ] Display service info
4. [ ] Show seller profile card
5. [ ] Add audio preview player (if applicable)
6. [ ] Add "Purchase" button
7. [ ] Show sample files/preview
8. [ ] Test page

## Acceptance Criteria:
- Service details display correctly
- Seller info shown
- Purchase button works
- Responsive design

## Files to create:
- pages/ServiceDetail.jsx

## Estimated Time: 1.5 days`,
    labels: ["phase-2", "frontend", "services"],
    milestone: 2,
  },

  {
    title: "💳 PAGE-004: Build Checkout Page",
    body: `Create payment flow UI.

## Steps:
1. [ ] Install @stripe/stripe-js @stripe/react-stripe-js
2. [ ] Create Checkout.jsx page
3. [ ] Display order summary
4. [ ] Show contract (if collaboration)
5. [ ] Add Stripe payment form
6. [ ] Handle payment submission
7. [ ] Show loading during payment
8. [ ] Redirect to success page
9. [ ] Handle errors
10. [ ] Test with test cards

## Acceptance Criteria:
- Checkout page works
- Stripe form renders
- Payment processes
- Errors handled
- Success redirect works

## Files to create:
- pages/Checkout.jsx
- components/StripePaymentForm.jsx

## Estimated Time: 2 days`,
    labels: ["phase-2", "frontend", "payments"],
    milestone: 2,
  },

  {
    title: "📊 PAGE-005: Build Buyer Dashboard",
    body: `Create buyer's order management page.

## Steps:
1. [ ] Create BuyerDashboard.jsx page
2. [ ] Fetch buyer's orders
3. [ ] Display orders in tabs (active, completed)
4. [ ] Show order cards with status
5. [ ] Add download buttons
6. [ ] Show active subscriptions
7. [ ] Test dashboard

## Acceptance Criteria:
- Dashboard displays orders
- Filtering works
- Download buttons work
- Subscriptions shown

## Files to create:
- pages/BuyerDashboard.jsx
- components/OrderCard.jsx

## Estimated Time: 2 days`,
    labels: ["phase-2", "frontend", "dashboard"],
    milestone: 2,
  },

  {
    title: "📊 PAGE-006: Build Seller Dashboard",
    body: `Create seller's management page.

## Steps:
1. [ ] Create SellerDashboard.jsx page
2. [ ] Show revenue stats
3. [ ] List seller's services
4. [ ] Show active orders
5. [ ] Add "Create Service" button
6. [ ] Display pending deliveries
7. [ ] Show analytics
8. [ ] Test dashboard

## Acceptance Criteria:
- Dashboard shows stats
- Services listed
- Orders displayed
- Create service works

## Files to create:
- pages/SellerDashboard.jsx

## Estimated Time: 2 days`,
    labels: ["phase-2", "frontend", "dashboard"],
    milestone: 2,
  },

  {
    title: "🎵 PAGE-007: Build Create Service Form",
    body: `Create multi-step service creation.

## Steps:
1. [ ] Create CreateService.jsx page
2. [ ] Build multi-step form
3. [ ] Step 1: Basic info (title, description, type)
4. [ ] Step 2: Pricing
5. [ ] Step 3: File uploads (if applicable)
6. [ ] Step 4: Preview & publish
7. [ ] Add validation
8. [ ] Handle form submission
9. [ ] Test form

## Acceptance Criteria:
- Form works step-by-step
- Validation prevents errors
- Service created successfully
- Files uploaded

## Files to create:
- pages/CreateService.jsx
- components/ServiceForm.jsx

## Estimated Time: 2.5 days`,
    labels: ["phase-2", "frontend", "services"],
    milestone: 2,
  },

  {
    title: "📦 PAGE-008: Build Order Detail Page",
    body: `Create order management UI.

## Steps:
1. [ ] Create OrderDetail.jsx page
2. [ ] Display order information
3. [ ] Show status timeline
4. [ ] Add file upload for buyer (collaboration)
5. [ ] Add file delivery for seller (collaboration)
6. [ ] Add download button
7. [ ] Add complete order button
8. [ ] Add dispute button
9. [ ] Test all actions

## Acceptance Criteria:
- Order info displays
- Status timeline visual
- Upload/delivery works
- Downloads work
- Actions functional

## Files to create:
- pages/OrderDetail.jsx
- components/OrderTimeline.jsx

## Estimated Time: 2.5 days`,
    labels: ["phase-2", "frontend", "orders"],
    milestone: 2,
  },

  // ========================================
  // PHASE 3: POLISH (Issues 55-60)
  // ========================================
  {
    title: "✨ POLISH-001: Add Loading States",
    body: `Implement loading indicators everywhere.

## Steps:
1. [ ] Add loading spinners to all API calls
2. [ ] Create skeleton loaders for cards
3. [ ] Add loading state to buttons
4. [ ] Disable forms during submission
5. [ ] Test all loading states

## Acceptance Criteria:
- Loading shown during API calls
- Skeleton loaders for content
- Buttons show loading state

## Estimated Time: 1 day`,
    labels: ["phase-3", "frontend", "polish"],
    milestone: 3,
  },

  {
    title: "✨ POLISH-002: Add Error Handling",
    body: `Implement comprehensive error handling.

## Steps:
1. [ ] Create ErrorBoundary component
2. [ ] Add error messages to all forms
3. [ ] Show API error messages to users
4. [ ] Add retry buttons where appropriate
5. [ ] Log errors to console
6. [ ] Test error scenarios

## Acceptance Criteria:
- Errors caught and displayed
- User-friendly error messages
- App doesn't crash on errors

## Files to create:
- components/ErrorBoundary.jsx

## Estimated Time: 1 day`,
    labels: ["phase-3", "frontend", "polish"],
    milestone: 3,
  },

  {
    title: "✨ POLISH-003: Add Animations",
    body: `Enhance UI with smooth transitions.

## Steps:
1. [ ] Add page transition animations
2. [ ] Add hover effects on cards
3. [ ] Animate modals opening/closing
4. [ ] Add smooth scrolling
5. [ ] Animate list items
6. [ ] Keep subtle and professional

## Acceptance Criteria:
- Transitions smooth
- Animations enhance UX
- Performance not impacted

## Estimated Time: 1 day`,
    labels: ["phase-3", "frontend", "polish"],
    milestone: 3,
  },

  {
    title: "📧 EMAIL-001: Setup Email Service",
    body: `Configure transactional emails.

## Steps:
1. [ ] Choose email service (SendGrid, Mailgun, or Gmail)
2. [ ] Install nodemailer
3. [ ] Configure credentials in .env
4. [ ] Create email templates
5. [ ] Test sending emails

## Acceptance Criteria:
- Email service configured
- Can send test emails
- Templates created

## Files to create:
- services/emailService.js
- templates/emailTemplates.js

## Estimated Time: 1 day`,
    labels: ["phase-3", "backend", "email"],
    milestone: 3,
  },

  {
    title: "📧 EMAIL-002: Implement Email Triggers",
    body: `Send emails for key events.

## Steps:
1. [ ] Welcome email (new user)
2. [ ] Order confirmation (buyer)
3. [ ] Order received (seller)
4. [ ] Files uploaded (collaboration)
5. [ ] Order delivered
6. [ ] Payment received (seller)
7. [ ] Subscription renewal reminder
8. [ ] New pack uploaded (subscribers)
9. [ ] Dispute opened
10. [ ] Test all emails

## Acceptance Criteria:
- All email triggers work
- Emails look professional
- Links work correctly

## Files to modify:
- controllers/* (add email calls)

## Estimated Time: 1.5 days`,
    labels: ["phase-3", "backend", "email"],
    milestone: 3,
  },

  {
    title: "🔒 SECURITY-001: Add Rate Limiting",
    body: `Prevent API abuse.

## Steps:
1. [ ] Install express-rate-limit
2. [ ] Add rate limiting to auth endpoints (5/min)
3. [ ] Add rate limiting to file uploads (10/hour)
4. [ ] Add rate limiting to general API (100/min)
5. [ ] Add rate limiting to search (30/min)
6. [ ] Test rate limits

## Acceptance Criteria:
- Rate limits enforced
- Returns 429 when exceeded
- Different limits per endpoint type

## Files to create:
- middleware/rateLimiter.js

## Estimated Time: 0.5 day`,
    labels: ["phase-3", "backend", "security"],
    milestone: 3,
  },

  // ========================================
  // PHASE 4: DEPLOYMENT (Issues 61-65)
  // ========================================
  {
    title: "🚀 DEPLOY-001: Setup Production Database",
    body: `Configure production MySQL database.

## Steps:
1. [ ] Choose database host (PlanetScale, AWS RDS, or DigitalOcean)
2. [ ] Create production database
3. [ ] Configure connection
4. [ ] Add production DB credentials to .env
5. [ ] Run migrations
6. [ ] Test connection

## Acceptance Criteria:
- Production database created
- Migrations run successfully
- Backend can connect

## Estimated Time: 1 day`,
    labels: ["phase-4", "deployment", "database"],
    milestone: 4,
  },

  {
    title: "🚀 DEPLOY-002: Deploy Backend to Production",
    body: `Host backend API.

## Steps:
1. [ ] Choose host (Railway, Render, or DigitalOcean)
2. [ ] Create account and project
3. [ ] Connect GitHub repo
4. [ ] Configure environment variables
5. [ ] Set build commands
6. [ ] Deploy backend
7. [ ] Setup custom domain (optional)
8. [ ] Test API endpoints

## Acceptance Criteria:
- Backend deployed and running
- Environment variables set
- API accessible via HTTPS
- Health endpoint works

## Estimated Time: 1.5 days`,
    labels: ["phase-4", "deployment", "backend"],
    milestone: 4,
  },

  {
    title: "🚀 DEPLOY-003: Deploy Frontend to Production",
    body: `Host React frontend.

## Steps:
1. [ ] Choose host (Vercel or Netlify)
2. [ ] Connect GitHub repo
3. [ ] Configure build settings
4. [ ] Set environment variables (API_URL, STRIPE_KEY)
5. [ ] Deploy frontend
6. [ ] Setup custom domain
7. [ ] Configure CORS on backend
8. [ ] Test app end-to-end

## Acceptance Criteria:
- Frontend deployed
- Connected to production API
- Custom domain works
- HTTPS enabled

## Estimated Time: 1 day`,
    labels: ["phase-4", "deployment", "frontend"],
    milestone: 4,
  },

  {
    title: "🚀 DEPLOY-004: Switch Stripe to Live Mode",
    body: `Activate real payments.

## Steps:
1. [ ] Complete Stripe business verification
2. [ ] Switch to live API keys
3. [ ] Update .env with live keys
4. [ ] Test live payment with real card (refund after)
5. [ ] Configure live webhook endpoint
6. [ ] Test webhooks in production

## Acceptance Criteria:
- Stripe account verified
- Live payments work
- Webhooks functional
- Can process real transactions

## Estimated Time: 1 day (+ waiting for Stripe approval)`,
    labels: ["phase-4", "deployment", "payments"],
    milestone: 4,
  },

  {
    title: "🚀 DEPLOY-005: Setup Domain & SSL",
    body: `Configure custom domain.

## Steps:
1. [ ] Buy domain (Namecheap, Google Domains)
2. [ ] Configure DNS records
3. [ ] Point domain to frontend host
4. [ ] Point api subdomain to backend
5. [ ] Setup SSL certificates
6. [ ] Test HTTPS on both
7. [ ] Update all URLs in code

## Acceptance Criteria:
- Custom domain works
- SSL/HTTPS enabled
- Frontend at yourdomain.com
- API at api.yourdomain.com

## Estimated Time: 0.5 day`,
    labels: ["phase-4", "deployment", "setup"],
    milestone: 4,
  },

  // ========================================
  // PHASE 5: LAUNCH (Issues 66-68)
  // ========================================
  {
    title: "📄 LEGAL-001: Create Legal Pages",
    body: `Add required legal documentation.

## Steps:
1. [ ] Write Terms of Service (use template)
2. [ ] Write Privacy Policy (use template)
3. [ ] Write Refund Policy
4. [ ] Write Cookie Policy (if needed)
5. [ ] Create legal pages in frontend
6. [ ] Link from footer
7. [ ] Get legal review (optional but recommended)

## Acceptance Criteria:
- All legal pages created
- Accessible from footer
- Professional and clear

## Files to create:
- pages/Terms.jsx
- pages/Privacy.jsx
- pages/Refund.jsx

## Estimated Time: 1 day`,
    labels: ["phase-5", "legal", "frontend"],
    milestone: 5,
  },

  {
    title: "🧪 TEST-001: Beta Testing",
    body: `Test with real users before launch.

## Steps:
1. [ ] Invite 10-20 producers you know
2. [ ] Give them test accounts
3. [ ] Ask them to complete full workflows
4. [ ] Collect feedback in Google Form
5. [ ] Fix critical bugs
6. [ ] Implement quick wins
7. [ ] Thank beta testers

## Acceptance Criteria:
- Beta testers recruited
- Feedback collected
- Critical bugs fixed
- App stable

## Estimated Time: 3-5 days`,
    labels: ["phase-5", "testing"],
    milestone: 5,
  },

  {
    title: "🎉 LAUNCH-001: Public Launch",
    body: `Go live to the world!

## Steps:
1. [ ] Prepare launch announcement
2. [ ] Create demo video
3. [ ] Take screenshots
4. [ ] Post on Reddit (r/trapproduction, r/makinghiphop)
5. [ ] Post on Twitter/X
6. [ ] Post in producer Discord servers
7. [ ] Post on Instagram
8. [ ] Monitor for issues
9. [ ] Respond to feedback
10. [ ] Celebrate! 🎉

## Acceptance Criteria:
- Announcement posted
- Traffic coming in
- No critical errors
- Users signing up

## Estimated Time: Ongoing`,
    labels: ["phase-5", "launch", "marketing"],
    milestone: 5,
  },
];

// Function to create a single issue
async function createIssue(issue, token, owner, repo) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(issue);

    const options = {
      hostname: "api.github.com",
      path: `/repos/${owner}/${repo}/issues`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
        Authorization: `token ${token}`,
        "User-Agent": "Node.js",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(body));
        } else {
          reject(
            new Error(`Failed to create issue (${res.statusCode}): ${body}`)
          );
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// Main execution
async function main() {
  console.log("🚀 GitHub Issues Generator for Producer Marketplace\n");

  // Get GitHub info from user
  const token = await prompt("Enter your GitHub Personal Access Token: ");
  const owner = await prompt("Enter your GitHub username: ");
  const repo = await prompt("Enter your repository name: ");

  console.log(
    `\n📋 About to create ${issues.length} issues in ${owner}/${repo}`
  );
  const confirm = await prompt("Continue? (yes/no): ");

  if (confirm.toLowerCase() !== "yes") {
    console.log("Cancelled.");
    rl.close();
    return;
  }

  console.log(`\n⏳ Creating ${issues.length} issues...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < issues.length; i++) {
    try {
      const result = await createIssue(issues[i], token, owner, repo);
      successCount++;
      console.log(
        `✅ [${i + 1}/${issues.length}] Created issue #${result.number}: ${
          issues[i].title
        }`
      );

      // Wait 1 second between requests to avoid rate limiting
      if (i < issues.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      failCount++;
      console.error(
        `❌ [${i + 1}/${issues.length}] Failed: ${issues[i].title}`
      );
      console.error(`   Error: ${error.message}\n`);
    }
  }

  console.log(`\n🎉 Done!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(
    `\nView your issues at: https://github.com/${owner}/${repo}/issues`
  );

  rl.close();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  rl.close();
  process.exit(1);
});
