# ProdMarket Server — Documentation

> **Version:** 1.0 · **Last updated:** 2026-02-24
>
> This document is the single source of truth for the ProdMarket backend API. It covers
> architecture, data models, every API endpoint, authentication flows, payment mechanics,
> and all supporting utilities.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Getting Started](#2-getting-started)
3. [Database Schema](#3-database-schema)
4. [API Reference](#4-api-reference)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Payment & Escrow Flow](#6-payment--escrow-flow)
7. [Order Lifecycle](#7-order-lifecycle)
8. [File Handling](#8-file-handling)
9. [Middleware](#9-middleware)
10. [Utilities](#10-utilities)
11. [Security](#11-security)
12. [Audit Logging](#12-audit-logging)
13. [Subscription System](#13-subscription-system)
14. [Dispute System](#14-dispute-system)
15. [Admin Panel](#15-admin-panel)

---

## 1. Project Overview

ProdMarket is a **music production freelance marketplace** — a platform where music producers
(sellers) offer services to clients (buyers). Sellers can list collaboration gigs, sell digital
sample packs, offer subscriptions, or sell preset/drum kits. Buyers can purchase services, track
orders, download files, and raise disputes if something goes wrong.

### Tech Stack

| Layer             | Technology                                   |
|-------------------|----------------------------------------------|
| Runtime           | Node.js                                      |
| Web framework     | Express.js                                   |
| Database          | MySQL 8                                      |
| ORM               | Sequelize 6                                  |
| File storage      | Cloudflare R2 (AWS S3-compatible)            |
| Payments          | Stripe (PaymentIntents + Connect)            |
| Authentication    | JWT (access + refresh) + Google OAuth 2.0   |
| Email             | Nodemailer over SMTP                         |
| Virus scanning    | VirusTotal API (async, fire-and-forget)      |
| Logging           | Winston + daily-rotate-file                  |
| Security headers  | Helmet.js                                    |

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Express App (app.js)                                           │
│  ┌───────────┐  ┌────────────────────────────────────────────┐  │
│  │  Helmet   │  │  Global rate limiter (100 req / 15 min)   │  │
│  │  CORS     │  │  Auth rate limiter  (20 req / 15 min)     │  │
│  │  Morgan   │  │  Body parser (10 kb JSON / URL-encoded)   │  │
│  └───────────┘  └────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Routes  →  Middleware  →  Controllers  →  Models        │   │
│  │  /api/auth  /api/users  /api/services  /api/orders       │   │
│  │  /api/payments  /api/subscriptions  /api/files           │   │
│  │  /api/downloads  /api/contracts  /api/disputes           │   │
│  │  /api/admin  /api/webhooks/stripe                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Utils: storageService · tokenBlacklist · virusScanner   │   │
│  │         email · validator · auditLog                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │                   │                    │
    MySQL / Sequelize    Cloudflare R2         Stripe API
```

---

## 2. Getting Started

### Prerequisites

- Node.js ≥ 18
- MySQL 8
- A Cloudflare R2 bucket (or any S3-compatible bucket)
- Stripe account with Connect enabled
- Google Cloud project with OAuth 2.0 credentials
- (Optional) VirusTotal API key

### Environment Variables

Copy `.env.example` to `.env` and fill in every value.

| Variable                | Required | Description                                             |
|-------------------------|----------|---------------------------------------------------------|
| `PORT`                  | No       | HTTP port (default: `5000`)                            |
| `NODE_ENV`              | No       | `development` / `production` / `test`                  |
| `JWT_SECRET`            | **Yes**  | Secret for signing access tokens                       |
| `JWT_REFRESH_SECRET`    | No       | Secret for refresh tokens (falls back to JWT_SECRET)   |
| `JWT_EXPIRE`            | No       | Access token TTL (default: `15m`)                      |
| `DB_HOST`               | **Yes**  | MySQL hostname                                         |
| `DB_PORT`               | No       | MySQL port (default: `3306`)                           |
| `DB_NAME`               | **Yes**  | Database name                                          |
| `DB_USER`               | **Yes**  | Database user                                          |
| `DB_PASSWORD`           | No       | Database password                                      |
| `STRIPE_SECRET_KEY`     | **Yes**  | Stripe secret key (`sk_live_…` / `sk_test_…`)         |
| `STRIPE_PUBLISHABLE_KEY`| No       | Stripe publishable key (sent to frontend)              |
| `STRIPE_WEBHOOK_SECRET` | No       | Stripe webhook signing secret (`whsec_…`)              |
| `PLATFORM_FEE_PERCENT`  | No       | Platform fee percentage (default: `8`)                 |
| `R2_ENDPOINT`           | No       | Cloudflare R2 endpoint URL                             |
| `R2_ACCESS_KEY_ID`      | No       | R2 access key                                          |
| `R2_SECRET_ACCESS_KEY`  | No       | R2 secret key                                          |
| `R2_BUCKET_NAME`        | No       | R2 bucket name                                         |
| `R2_PUBLIC_URL`         | No       | Public CDN URL for R2 (if enabled)                    |
| `GOOGLE_CLIENT_ID`      | No       | Google OAuth client ID                                 |
| `GOOGLE_CLIENT_SECRET`  | No       | Google OAuth client secret                             |
| `EMAIL_HOST`            | No       | SMTP host (e.g. `smtp.gmail.com`)                     |
| `EMAIL_PORT`            | No       | SMTP port (e.g. `587`)                                |
| `EMAIL_USER`            | No       | SMTP username                                          |
| `EMAIL_PASS`            | No       | SMTP password / app password                           |
| `FRONTEND_URL`          | No       | Frontend origin for CORS and email links               |
| `MAX_FILE_SIZE_MB`      | No       | Max upload size in MB (default: `1024`)               |
| `HEALTH_CHECK_TOKEN`    | No       | Secret sent via `x-health-token` header               |
| `VIRUSTOTAL_API_KEY`    | No       | VirusTotal API key for async file scanning             |

> **Important:** The server will refuse to start if any of the following are missing:
> `JWT_SECRET`, `DB_HOST`, `DB_NAME`, `DB_USER`, `STRIPE_SECRET_KEY`.

### Database Setup

```bash
# 1. Create the MySQL database
mysql -u root -p -e "CREATE DATABASE prodmarket;"

# 2. Install dependencies
npm install

# 3. Run all migrations
npm run migrate

# 4. (Optional) Seed data
npm run seed
```

### Running the Server

```bash
# Development (with model auto-sync)
NODE_ENV=development npm start

# Production
NODE_ENV=production npm start
```

> In `development` mode, `sequelize.sync({ alter: false })` is called on startup, which
> creates any tables that don't yet exist. **Do not use `sync` in production** — rely on
> migrations exclusively.

### Available Scripts

| Script             | Description                          |
|--------------------|--------------------------------------|
| `npm start`        | Start server (`node server.js`)      |
| `npm run migrate`  | Run pending Sequelize migrations     |
| `npm run migrate:undo` | Roll back the last migration    |
| `npm run seed`     | Run all seed files                   |
| `npm test`         | Run Jest tests                       |

### Health Check

```
GET /health
Headers: x-health-token: <HEALTH_CHECK_TOKEN>
```

Returns `{ "status": "ok", "timestamp": "..." }` when the token matches the environment variable.
Returns `401` otherwise. The `/health` path is excluded from Morgan request logging.

---

## 3. Database Schema

### 3.1 Association Map

```
User ──────< Service (seller_id)
User ──────< Order   (buyer_id)
User ──────< Order   (seller_id)
User ──────< Subscription (buyer_id)
User ──────< Subscription (seller_id)
User ──────< Transaction  (buyer_id)
User ──────< Transaction  (seller_id)
User ──────< Download     (user_id)
User ──────< Dispute      (raised_by_user_id)
User ──────< Contract     (buyer_id)
User ──────< Contract     (seller_id)

Service ───< Order
Service ───< Subscription
Service ───< SubscriptionPack

Order ──────1 Contract
Order ──────< Transaction
Order ──────< Download
Order ──────< Dispute

SubscriptionPack ──< Download

Dispute ──> User (resolved_by_admin_id)
```

---

### 3.2 Users

Table: `users`

| Column                      | Type           | Constraints                   | Notes                                       |
|-----------------------------|----------------|-------------------------------|---------------------------------------------|
| `id`                        | INTEGER        | PK, AUTO_INCREMENT            |                                             |
| `email`                     | VARCHAR(255)   | NOT NULL, UNIQUE              | Validated as email format                   |
| `password_hash`             | VARCHAR(255)   | NULLABLE                      | Null for Google OAuth users                 |
| `username`                  | VARCHAR(50)    | NOT NULL, UNIQUE              | Lowercase, alphanumeric                     |
| `display_name`              | VARCHAR(100)   | NULLABLE                      |                                             |
| `bio`                       | TEXT           | NULLABLE                      |                                             |
| `avatar_url`                | VARCHAR(500)   | NULLABLE                      |                                             |
| `is_verified`               | BOOLEAN        | DEFAULT false                 | Email verified OR admin-verified seller     |
| `is_seller`                 | BOOLEAN        | DEFAULT false                 | Unlocked via `/api/users/become-seller`     |
| `is_admin`                  | BOOLEAN        | DEFAULT false                 | Added via migration; set manually in DB     |
| `stripe_account_id`         | VARCHAR(255)   | NULLABLE                      | Stripe Connect Express account ID           |
| `stripe_customer_id`        | VARCHAR(255)   | NULLABLE                      | Stripe customer ID for subscriptions        |
| `instagram_handle`          | VARCHAR(100)   | NULLABLE                      |                                             |
| `google_id`                 | VARCHAR(255)   | NULLABLE, UNIQUE              | Google OAuth sub claim                      |
| `verification_token`        | VARCHAR(255)   | NULLABLE                      | Cleared after verification                  |
| `verification_token_expires`| DATE           | NULLABLE                      | 24-hour window                              |
| `reset_token`               | VARCHAR(255)   | NULLABLE                      | SHA-256 hash of raw token                   |
| `reset_token_expires`       | DATE           | NULLABLE                      | 1-hour window                               |
| `created_at`                | DATETIME       | AUTO                          |                                             |
| `updated_at`                | DATETIME       | AUTO                          |                                             |

---

### 3.3 Services

Table: `services`

| Column              | Type                                                                 | Constraints               | Notes                             |
|---------------------|----------------------------------------------------------------------|---------------------------|-----------------------------------|
| `id`                | INTEGER                                                              | PK                        |                                   |
| `seller_id`         | INTEGER                                                              | NOT NULL, FK → users      | Indexed                           |
| `title`             | VARCHAR(200)                                                         | NOT NULL                  |                                   |
| `description`       | TEXT                                                                 | NOT NULL                  |                                   |
| `type`              | ENUM(`collaboration`, `subscription`, `loop_pack`, `drum_kit`, `preset_kit`) | NOT NULL      | Indexed                           |
| `price`             | DECIMAL(10,2)                                                        | NOT NULL                  |                                   |
| `delivery_time_days`| INTEGER                                                              | DEFAULT 14                | Only relevant for `collaboration` |
| `is_active`         | BOOLEAN                                                              | DEFAULT true              | Indexed; soft-delete by admin     |
| `file_urls`         | JSON                                                                 | NULLABLE                  | Array of R2 keys (digital packs)  |
| `file_size_mb`      | DECIMAL(10,2)                                                        | NULLABLE                  |                                   |
| `preview_url`       | VARCHAR(500)                                                         | NULLABLE                  | Audio preview URL                 |
| `tags`              | JSON                                                                 | NULLABLE                  | Array of tag strings              |
| `total_sales`       | INTEGER                                                              | DEFAULT 0                 | Incremented on each purchase      |
| `created_at`        | DATETIME                                                             | AUTO                      | Indexed                           |
| `updated_at`        | DATETIME                                                             | AUTO                      |                                   |

---

### 3.4 Orders

Table: `orders`

| Column                    | Type                                                                                                           | Constraints          |
|---------------------------|----------------------------------------------------------------------------------------------------------------|----------------------|
| `id`                      | INTEGER                                                                                                        | PK                   |
| `order_number`            | VARCHAR(50)                                                                                                    | NOT NULL, UNIQUE     |
| `buyer_id`                | INTEGER                                                                                                        | NOT NULL, FK → users |
| `seller_id`               | INTEGER                                                                                                        | NOT NULL, FK → users |
| `service_id`              | INTEGER                                                                                                        | NOT NULL, FK → services |
| `status`                  | ENUM(`pending`, `awaiting_upload`, `in_progress`, `awaiting_delivery`, `delivered`, `completed`, `cancelled`, `refunded`, `disputed`) | DEFAULT `pending` |
| `amount`                  | DECIMAL(10,2)                                                                                                  | NOT NULL             |
| `platform_fee`            | DECIMAL(10,2)                                                                                                  | NOT NULL             |
| `seller_amount`           | DECIMAL(10,2)                                                                                                  | NOT NULL             |
| `stripe_payment_intent_id`| VARCHAR(255)                                                                                                   | NULLABLE, Indexed    |
| `stripe_transfer_id`      | VARCHAR(255)                                                                                                   | NULLABLE             |
| `escrow_status`           | ENUM(`held`, `released`, `refunded`)                                                                           | NULLABLE             |
| `buyer_files`             | JSON                                                                                                           | NULLABLE             |
| `seller_files`            | JSON                                                                                                           | NULLABLE             |
| `delivery_deadline`       | DATE                                                                                                           | NULLABLE             |
| `completed_at`            | DATE                                                                                                           | NULLABLE             |
| `cancelled_at`            | DATE                                                                                                           | NULLABLE             |
| `created_at`              | DATETIME                                                                                                       | AUTO, Indexed        |
| `updated_at`              | DATETIME                                                                                                       | AUTO                 |

**Indexes:** `buyer_id`, `seller_id`, `service_id`, `status`, `stripe_payment_intent_id`, `created_at`

The `buyer_files` and `seller_files` columns store JSON objects in the shape:
```json
{
  "files": ["r2-key-1", "r2-key-2"],
  "instructions": "Please use 120 BPM",
  "uploaded_at": "2026-02-24T10:00:00.000Z"
}
```

---

### 3.5 Contracts

Table: `contracts`

| Column                | Type          | Constraints              | Notes                                           |
|-----------------------|---------------|--------------------------|-------------------------------------------------|
| `id`                  | INTEGER       | PK                       |                                                 |
| `order_id`            | INTEGER       | NOT NULL, UNIQUE, FK → orders | One contract per order                   |
| `buyer_id`            | INTEGER       | NOT NULL, FK → users     |                                                 |
| `seller_id`           | INTEGER       | NOT NULL, FK → users     |                                                 |
| `collaboration_price` | DECIMAL(10,2) | NOT NULL                 | Mirrors `order.amount`                          |
| `contract_terms`      | TEXT          | NOT NULL                 | Full plain-text legal agreement                 |
| `buyer_agreed_at`     | DATE          | NOT NULL                 | Set to `NOW()` at contract generation           |
| `seller_agreed_at`    | DATE          | NOT NULL                 | Set to `NOW()` at contract generation           |
| `contract_pdf_url`    | VARCHAR(500)  | NULLABLE                 | R2 key of the uploaded PDF                      |
| `created_at`          | DATETIME      | AUTO                     |                                                 |
| `updated_at`          | DATETIME      | AUTO                     |                                                 |

Contracts are auto-generated when `confirmPayment` creates a `collaboration` order.

---

### 3.6 Transactions

Table: `transactions`

| Column              | Type                                                  | Constraints           | Notes                         |
|---------------------|-------------------------------------------------------|-----------------------|-------------------------------|
| `id`                | INTEGER                                               | PK                    |                               |
| `order_id`          | INTEGER                                               | NULLABLE, FK → orders | Null for subscriptions        |
| `subscription_id`   | INTEGER                                               | NULLABLE              |                               |
| `buyer_id`          | INTEGER                                               | NOT NULL, FK → users  | Indexed                       |
| `seller_id`         | INTEGER                                               | NOT NULL, FK → users  | Indexed                       |
| `type`              | ENUM(`purchase`, `subscription_payment`, `refund`, `payout`) | NOT NULL      | Indexed                       |
| `amount`            | DECIMAL(10,2)                                         | NOT NULL              |                               |
| `platform_fee`      | DECIMAL(10,2)                                         | NOT NULL, DEFAULT 0   |                               |
| `stripe_payment_id` | VARCHAR(255)                                          | NULLABLE, Indexed     |                               |
| `stripe_transfer_id`| VARCHAR(255)                                          | NULLABLE              |                               |
| `status`            | ENUM(`pending`, `completed`, `failed`, `refunded`)    | DEFAULT `pending`     | Indexed                       |
| `created_at`        | DATETIME                                              | AUTO, Indexed         |                               |
| `updated_at`        | DATETIME                                              | AUTO                  |                               |

---

### 3.7 Subscriptions

Table: `subscriptions`

| Column                   | Type                                          | Constraints          |
|--------------------------|-----------------------------------------------|----------------------|
| `id`                     | INTEGER                                       | PK                   |
| `buyer_id`               | INTEGER                                       | NOT NULL, FK → users |
| `seller_id`              | INTEGER                                       | NOT NULL, FK → users |
| `service_id`             | INTEGER                                       | NOT NULL, FK → services |
| `stripe_subscription_id` | VARCHAR(255)                                  | NOT NULL, UNIQUE     |
| `status`                 | ENUM(`active`, `cancelled`, `past_due`, `paused`) | DEFAULT `active` |
| `current_period_start`   | DATE                                          | NOT NULL             |
| `current_period_end`     | DATE                                          | NOT NULL             |
| `cancelled_at`           | DATE                                          | NULLABLE             |
| `created_at`             | DATETIME                                      | AUTO                 |
| `updated_at`             | DATETIME                                      | AUTO                 |

---

### 3.8 SubscriptionPacks

Table: `subscription_packs`

| Column          | Type          | Constraints              | Notes                                 |
|-----------------|---------------|--------------------------|---------------------------------------|
| `id`            | INTEGER       | PK                       |                                       |
| `service_id`    | INTEGER       | NOT NULL, FK → services  |                                       |
| `seller_id`     | INTEGER       | NOT NULL, FK → users     |                                       |
| `title`         | VARCHAR(200)  | NOT NULL                 |                                       |
| `description`   | TEXT          | NULLABLE                 |                                       |
| `file_urls`     | JSON          | NOT NULL                 | Array of R2 keys                      |
| `file_size_mb`  | DECIMAL(10,2) | NULLABLE                 |                                       |
| `uploaded_at`   | DATE          | DEFAULT NOW              |                                       |
| `created_at`    | DATETIME      | AUTO                     |                                       |
| `updated_at`    | DATETIME      | AUTO                     |                                       |

---

### 3.9 Downloads

Table: `downloads`

| Column                | Type         | Constraints                   |
|-----------------------|--------------|-------------------------------|
| `id`                  | INTEGER      | PK                            |
| `user_id`             | INTEGER      | NOT NULL, FK → users          |
| `order_id`            | INTEGER      | NULLABLE, FK → orders         |
| `subscription_pack_id`| INTEGER      | NULLABLE, FK → subscription_packs |
| `file_url`            | VARCHAR(500) | NOT NULL                      |
| `ip_address`          | VARCHAR(50)  | NULLABLE                      |
| `downloaded_at`       | DATETIME     | AUTO (createdAt)              |

---

### 3.10 Disputes

Table: `disputes`

| Column                | Type                                                            | Constraints           | Notes                             |
|-----------------------|-----------------------------------------------------------------|-----------------------|-----------------------------------|
| `id`                  | INTEGER                                                         | PK                    |                                   |
| `order_id`            | INTEGER                                                         | NOT NULL, FK → orders |                                   |
| `raised_by_user_id`   | INTEGER                                                         | NOT NULL, FK → users  |                                   |
| `reason`              | ENUM(`not_delivered`, `wrong_files`, `quality_issue`, `communication_issue`, `other`) | NOT NULL |       |
| `description`         | TEXT                                                            | NOT NULL, 10–5000 chars |                                 |
| `evidence_urls`       | JSON                                                            | NULLABLE              | Array of R2 keys                  |
| `status`              | ENUM(`open`, `under_review`, `resolved`, `closed`)             | DEFAULT `open`        |                                   |
| `admin_notes`         | TEXT                                                            | NULLABLE              | Also stores opposing party response |
| `resolution`          | ENUM(`refund_buyer`, `release_to_seller`, `partial_refund`)    | NULLABLE              | Set when resolved                 |
| `resolved_at`         | DATE                                                            | NULLABLE              |                                   |
| `resolved_by_admin_id`| INTEGER                                                         | NULLABLE, FK → users  |                                   |
| `created_at`          | DATETIME                                                        | AUTO                  |                                   |
| `updated_at`          | DATETIME                                                        | AUTO                  |                                   |

---

### 3.11 FileRecords

Table: `file_records`

| Column           | Type                                 | Constraints          | Notes                          |
|------------------|--------------------------------------|----------------------|--------------------------------|
| `id`             | INTEGER                              | PK                   |                                |
| `file_key`       | VARCHAR(500)                         | NOT NULL, UNIQUE     | R2 object key; Indexed         |
| `original_name`  | VARCHAR(255)                         | NULLABLE             |                                |
| `mime_type`      | VARCHAR(100)                         | NULLABLE             |                                |
| `size`           | BIGINT                               | NULLABLE             | Bytes                          |
| `uploaded_by`    | INTEGER                              | NOT NULL, FK → users | Indexed                        |
| `scan_status`    | ENUM(`pending`, `clean`, `flagged`)  | DEFAULT `pending`    | Indexed                        |
| `virustotal_id`  | VARCHAR(255)                         | NULLABLE             | VirusTotal analysis ID         |
| `created_at`     | DATETIME                             | AUTO                 |                                |
| `updated_at`     | DATETIME                             | AUTO                 |                                |

---

### 3.12 TokenBlacklists

Table: `token_blacklists`

| Column       | Type    | Constraints | Notes                                        |
|--------------|---------|-------------|----------------------------------------------|
| `id`         | INTEGER | PK          |                                              |
| `token`      | TEXT    | NOT NULL    | Full JWT access token string                 |
| `expires_at` | DATE    | NOT NULL    | Indexed; cleanup removes rows past this date |

No timestamps. Rows are purged automatically every 15 minutes by `tokenBlacklist.cleanupExpiredTokens()`.

---

## 4. API Reference

All endpoints are prefixed with `/api`. Unless stated otherwise every response body has the shape:

```json
{ "success": true, ... }
// or
{ "success": false, "error": "Human-readable message" }
```

**Auth levels:**
- `public` — No token required
- `protected` — Valid `Authorization: Bearer <token>` required
- `seller` — Protected + `is_seller: true` in JWT
- `admin` — Protected + `is_admin: true` in JWT

---

### 4.1 Auth — `/api/auth`

> All auth routes also sit behind the auth-specific rate limiter (20 req / 15 min per IP).

#### `POST /api/auth/google`
**Auth:** public

Authenticates via a Google ID token. Creates a new account if the email is not already registered. Links Google ID to an existing email-based account if one exists.

**Request body:**
```json
{ "token": "<google_id_token>" }
```

**Response `200`:**
```json
{
  "success": true,
  "token": "<jwt_access_token>",
  "refreshToken": "<jwt_refresh_token>",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "username": "user",
    "display_name": "User Name",
    "avatar_url": "https://...",
    "is_seller": false,
    "is_verified": false,
    "bio": null,
    "instagram_handle": null
  },
  "isNewUser": true
}
```

---

#### `POST /api/auth/register`
**Auth:** public

Registers a new email/password account. Sends a verification email (non-blocking). The account cannot be used to log in until the email is verified.

**Password requirements:** ≥ 12 characters, at least one uppercase letter, one lowercase letter, one number, and one special character.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass1!",
  "username": "myusername",
  "display_name": "My Name"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created. Please check your email to verify your account before logging in.",
  "user": { "id": 2, "email": "...", "username": "...", "display_name": "...", "is_verified": false }
}
```

---

#### `POST /api/auth/login`
**Auth:** public

Validates email/password credentials. **Unverified accounts are blocked** (`403`). Returns JWT access and refresh tokens.

**Request body:**
```json
{ "email": "user@example.com", "password": "StrongPass1!" }
```

**Response `200`:**
```json
{
  "success": true,
  "token": "<jwt_access_token>",
  "refreshToken": "<jwt_refresh_token>",
  "user": { "id": 1, "email": "...", "username": "...", "is_seller": false, "is_verified": true, ... }
}
```

---

#### `GET /api/auth/verify/:token`
**Auth:** public

Confirms a user's email address using the token from the verification link. Marks `is_verified = true` and clears the token fields. Returns new JWT tokens so the user is immediately signed in.

**Response `200`:**
```json
{
  "success": true,
  "message": "Email verified successfully.",
  "token": "<jwt>",
  "refreshToken": "<jwt>",
  "user": { "id": 1, "is_verified": true, ... }
}
```

---

#### `POST /api/auth/resend-verification`
**Auth:** public · **Rate limit:** 5 req / 15 min

Resends the verification email. To prevent email enumeration the response is always `200` regardless of whether the email exists.

**Request body:** `{ "email": "user@example.com" }`

---

#### `POST /api/auth/forgot-password`
**Auth:** public · **Rate limit:** 5 req / 15 min

Sends a password reset link to the registered email. The raw token is included in the email link; a SHA-256 hash of the raw token is stored in the database. Always returns `200` to prevent email enumeration.

**Request body:** `{ "email": "user@example.com" }`

---

#### `POST /api/auth/reset-password`
**Auth:** public

Resets the user's password. The `token` from the reset email link is hashed and compared against the stored hash.

**Request body:**
```json
{ "token": "<raw_token_from_email>", "password": "NewStrongPass1!" }
```

---

#### `POST /api/auth/refresh`
**Auth:** public

Issues a new access token using a valid refresh token (7-day TTL). The refresh token must have `type: "refresh"` in its payload.

**Request body:** `{ "refreshToken": "<jwt_refresh_token>" }`

**Response `200`:** `{ "success": true, "token": "<new_access_token>" }`

---

#### `GET /api/auth/me`
**Auth:** protected

Returns the full user record for the currently authenticated user (excludes `password_hash` and `google_id`).

---

#### `POST /api/auth/logout`
**Auth:** protected

Blacklists the current access token in the database so it cannot be reused, even before its natural expiry.

---

### 4.2 Users — `/api/users`

#### `GET /api/users/:id`
**Auth:** public

Returns a user's public profile by numeric ID.

#### `GET /api/users/username/:username`
**Auth:** public

Returns a user's public profile by username.

#### `GET /api/users/:id/stats`
**Auth:** protected

Returns statistics for a user: number of services, orders as buyer, orders as seller, etc.

#### `POST /api/users/become-seller`
**Auth:** protected

Upgrades the current user's account to seller status (`is_seller = true`). This is a one-way operation.

#### `PUT /api/users/seller-info`
**Auth:** seller

Updates seller-specific profile fields (e.g. bio, instagram_handle, display_name).

---

### 4.3 Services — `/api/services`

#### `GET /api/services`
**Auth:** public

Returns all active services. Supports filtering and pagination via query parameters.

#### `GET /api/services/search`
**Auth:** public

Full-text search across service titles, descriptions, and tags. Must be defined before `/:id` in the router.

#### `GET /api/services/:id`
**Auth:** public

Returns a single service with seller details.

#### `POST /api/services`
**Auth:** seller

Creates a new service listing.

**Request body:**
```json
{
  "title": "Custom Beat Production",
  "description": "I will produce a custom trap beat...",
  "type": "collaboration",
  "price": 150.00,
  "delivery_time_days": 7,
  "tags": ["trap", "hip-hop"],
  "preview_url": "r2-key-of-preview.mp3"
}
```

#### `PUT /api/services/:id`
**Auth:** protected (ownership enforced in controller)

Updates a service. Only the seller who owns the service may update it.

#### `DELETE /api/services/:id`
**Auth:** protected (ownership enforced in controller)

Soft-deletes a service by setting `is_active = false`.

---

### 4.4 Orders — `/api/orders`

All order routes require authentication.

#### `POST /api/orders`
**Auth:** protected

Manually creates an order. In normal flows orders are created automatically via `POST /api/payments/confirm`. This endpoint is for edge cases. The request amount must match the service price exactly. Uses a Sequelize DB transaction for atomicity.

**Request body:**
```json
{ "service_id": 5, "amount": 150.00 }
```

**Response `201`:** Full order object with buyer, seller, and service relations.

#### `GET /api/orders`
**Auth:** protected

Returns the authenticated user's orders.

**Query parameters:**

| Param  | Values                        | Default  |
|--------|-------------------------------|----------|
| `role` | `buyer`, `seller`, `all`      | `buyer`  |
| `status` | Any valid order status      | (all)    |
| `page` | Integer ≥ 1                   | `1`      |
| `limit`| Integer 1–100                 | `20`     |

#### `GET /api/orders/:id`
**Auth:** protected (must be buyer or seller of the order)

Returns a single order with full relations. Returns `403` if the requesting user is neither buyer nor seller.

#### `PUT /api/orders/:id/upload-files`
**Auth:** protected (buyer only)

The buyer uploads reference files (e.g. stems, mood boards) for a `collaboration` order. Transitions status from `awaiting_upload` → `in_progress`.

**Request body:**
```json
{
  "file_urls": ["r2-key-1.wav", "r2-key-2.zip"],
  "instructions": "Please use 120 BPM, C minor"
}
```

#### `PUT /api/orders/:id/deliver`
**Auth:** seller

The seller delivers the completed work. Transitions status from `in_progress` or `awaiting_delivery` → `delivered`.

**Request body:**
```json
{
  "file_urls": ["r2-delivered-beat.wav"],
  "delivery_notes": "Mixed at -6 LUFS, stems included"
}
```

#### `PUT /api/orders/:id/complete`
**Auth:** protected (buyer only)

The buyer confirms they are happy with the delivery. Transitions status to `completed`. If `escrow_status` is `held` it is automatically set to `released`.

---

### 4.5 Payments — `/api/payments`

All payment routes require authentication.

#### `POST /api/payments/create-intent`
**Auth:** protected

Creates a Stripe PaymentIntent for a service purchase. For `collaboration` services, `capture_method: "manual"` is used (escrow). Returns the Stripe `clientSecret` so the frontend can complete the payment using Stripe.js.

**Request body:**
```json
{ "service_id": 5, "idempotency_key": "optional-client-key" }
```

**Response `200`:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": "150.00",
  "platformFee": "12.00",
  "sellerAmount": "138.00",
  "isEscrow": true,
  "idempotency_key": "..."
}
```

#### `POST /api/payments/confirm`
**Auth:** protected

Called after the client confirms payment via Stripe.js. Retrieves the PaymentIntent from Stripe and creates the Order + Transaction records. Idempotent — if an order already exists for this PaymentIntent it is returned without creating a duplicate.

For `collaboration` orders: sets `status = awaiting_upload`, `escrow_status = held`, and auto-generates a PDF contract.
For all other service types (instant digital products): sets `status = completed`.

**Request body:**
```json
{ "payment_intent_id": "pi_xxx", "service_id": 5 }
```

**Response `201`:**
```json
{
  "success": true,
  "order": { "id": 10, "order_number": "ORD-...", "status": "awaiting_upload", "amount": "150.00", "escrow_status": "held" },
  "message": "Order created successfully"
}
```

#### `POST /api/payments/release-escrow`
**Auth:** admin

Captures the held PaymentIntent (releasing funds from Stripe's escrow), sets `escrow_status = released`, `status = completed`, and creates a `payout` transaction record. The order must be in `delivered` status.

**Request body:** `{ "order_id": 10 }`

#### `GET /api/payments/connect-onboard`
**Auth:** seller

Creates a Stripe Connect Express account for the seller if one doesn't exist, then returns an account onboarding link. The seller completes KYC on Stripe's hosted page and is redirected back to the frontend.

**Response `200`:** `{ "success": true, "url": "https://connect.stripe.com/..." }`

#### `GET /api/payments/connect-status`
**Auth:** seller

Returns the current Stripe Connect account status for the seller.

**Response `200`:**
```json
{
  "success": true,
  "connected": true,
  "charges_enabled": true,
  "payouts_enabled": true,
  "details_submitted": true
}
```

---

### 4.6 Subscriptions — `/api/subscriptions`

All subscription routes require authentication.

#### `POST /api/subscriptions`
**Auth:** protected

Creates a Stripe Subscription and a local Subscription record. The service `type` must be `subscription`. Prevents duplicate active subscriptions to the same service.

**Request body:**
```json
{ "service_id": 8, "payment_method_id": "pm_xxx" }
```

#### `GET /api/subscriptions/my`
**Auth:** protected

Returns all subscriptions for the current user as buyer. Filterable by `status`.

#### `GET /api/subscriptions/subscribers`
**Auth:** seller

Returns all subscribers to the seller's services with revenue stats.

**Query params:** `service_id` (filter by service), `status` (default: `active`)

**Response includes `stats`:**
```json
{
  "stats": {
    "total": 50,
    "active": 45,
    "cancelled": 5,
    "monthlyRevenue": "3312.00"
  }
}
```

#### `GET /api/subscriptions/:id`
**Auth:** protected (buyer or seller of the subscription)

Returns a single subscription with buyer, seller, and service details.

#### `DELETE /api/subscriptions/:id`
**Auth:** protected (buyer only)

Cancels the subscription in Stripe and locally. Access continues until `current_period_end`.

#### `POST /api/subscriptions/:serviceId/upload-pack`
**Auth:** seller (must own the service)

Uploads a new subscription pack (batch of files) for subscribers to download.

**Request body:**
```json
{
  "title": "February Loop Pack",
  "description": "20 dark trap loops",
  "file_urls": ["r2-key-1.wav", "r2-key-2.wav"],
  "file_size_mb": 245.5
}
```

#### `GET /api/subscriptions/:serviceId/packs`
**Auth:** protected (active subscriber OR seller)

Returns all packs for a service with pagination. Returns `403` if the user has no active subscription and is not the seller.

#### `GET /api/subscriptions/packs/:packId`
**Auth:** protected (active subscriber OR seller)

Returns a single pack. Same access rules as above.

#### `POST /api/subscriptions/test-create`
**Auth:** protected · **Development only**

Creates a fake subscription record without calling Stripe. Requires `x-test-key` header matching `TEST_KEY` env var.

---

### 4.7 Files — `/api/files`

All file routes require authentication.

#### `POST /api/files/upload`
**Auth:** protected

Uploads a single file to Cloudflare R2. File must be WAV, MP3, MIDI, or ZIP and under 1 GB. Creates a FileRecord with `scan_status: pending` and triggers async VirusTotal scanning.

**Request:** `multipart/form-data` with field name `file`

**Response `201`:**
```json
{
  "success": true,
  "file": {
    "key": "abc123-1708783200000.wav",
    "originalName": "beat.wav",
    "size": 52428800,
    "mimeType": "audio/wav",
    "uploadedBy": 1,
    "scan_status": "pending"
  }
}
```

#### `POST /api/files/upload-multiple`
**Auth:** protected

Uploads up to 10 files in one request. Field name `files`.

#### `GET /api/files/download/:fileKey`
**Auth:** protected · **Rate limit:** 30 req / min

Verifies the user has access to the file (owns it as a seller, or has a completed/delivered order containing it), checks the scan status is not `flagged`, then returns a 1-hour presigned Cloudflare R2 download URL.

**Response `200`:**
```json
{
  "success": true,
  "downloadUrl": "https://...",
  "expiresIn": "1 hour"
}
```

#### `GET /api/files/info/:fileKey`
**Auth:** protected (access verified)

Returns basic existence confirmation for a file key.

#### `DELETE /api/files/:fileKey`
**Auth:** protected (seller/owner only)

Deletes the file from R2. Only the seller who owns the associated service may delete it.

---

### 4.8 Downloads — `/api/downloads`

All download routes require authentication.

#### `POST /api/downloads/order/:orderId`
**Auth:** protected

Records a download event for order files and returns presigned URLs.

#### `POST /api/downloads/pack/:packId`
**Auth:** protected

Records a download event for a subscription pack (access verified: must be active subscriber or seller).

#### `GET /api/downloads/my`
**Auth:** protected

Returns the authenticated user's full download history.

#### `GET /api/downloads/stats`
**Auth:** seller

Returns download statistics for the seller's files.

---

### 4.9 Contracts — `/api/contracts`

All contract routes require authentication.

#### `POST /api/contracts/generate/:orderId`
**Auth:** protected (buyer or seller of the order)

Generates a collaboration contract: creates a Contract record, builds the full plain-text legal agreement, renders it as a PDF using PDFKit, and uploads the PDF to R2. Idempotent — returns the existing contract if one already exists for the order. This is also called automatically by `confirmPayment` for collaboration orders.

#### `GET /api/contracts`
**Auth:** protected

Returns all contracts for the current user. Filter by `role` (`buyer` or `seller`).

#### `GET /api/contracts/order/:orderId`
**Auth:** protected (buyer or seller)

Returns the contract for a specific order.

#### `GET /api/contracts/:id`
**Auth:** protected (buyer or seller)

Returns a contract by its ID.

#### `GET /api/contracts/:id/download`
**Auth:** protected (buyer or seller)

Returns a presigned 1-hour download URL for the contract PDF.

---

### 4.10 Disputes — `/api/disputes`

All dispute routes require authentication.

#### `POST /api/disputes`
**Auth:** protected (buyer or seller of the order)

Creates a dispute for an active order. Validates the reason enum and description length (10–5000 chars). Automatically transitions the order to `disputed` status. Only one active dispute per order is allowed.

**Request body:**
```json
{
  "order_id": 10,
  "reason": "not_delivered",
  "description": "The seller has not delivered after 14 days...",
  "evidence_urls": ["r2-screenshot.png"]
}
```

**Valid reasons:** `not_delivered`, `wrong_files`, `quality_issue`, `communication_issue`, `other`

#### `GET /api/disputes`
**Auth:** protected

Returns all disputes for orders the current user is involved in (as buyer or seller). Supports `status` filter and pagination.

#### `GET /api/disputes/stats`
**Auth:** protected

Returns dispute counts by status (`open`, `underReview`, `resolved`, `closed`, `total`, `raisedByMe`).

#### `GET /api/disputes/:id`
**Auth:** protected (buyer or seller of the disputed order)

Returns full dispute details including order, service, both parties, and resolver admin.

#### `PUT /api/disputes/:id`
**Auth:** protected (dispute raiser only)

Updates the dispute description or appends additional evidence URLs. Only allowed while status is `open` or `under_review`.

**Request body:** `{ "description": "...", "evidence_urls": ["new-key.png"] }`

#### `POST /api/disputes/:id/respond`
**Auth:** protected (the other party — not the raiser)

Adds a response to the dispute (stored in `admin_notes`). Transitions status from `open` → `under_review` automatically.

**Request body:** `{ "response": "I delivered the files on day 10..." }`

---

### 4.11 Admin — `/api/admin`

All admin routes require both `protect` and `isAdmin` middleware.

#### `GET /api/admin/dashboard`

Returns aggregated platform statistics and recent activity.

**Response `stats` object:**
```json
{
  "users":    { "total": 500, "sellers": 80, "verified": 60 },
  "services": { "total": 200, "active": 180 },
  "orders":   { "total": 1200, "completed": 950, "active": 45, "disputed": 5 },
  "disputes": { "open": 3, "underReview": 2 },
  "revenue":  { "total": "142500.00", "platform": "11400.00" }
}
```

Also returns `recentActivity.orders` (last 10) and `recentActivity.users` (last 10 signups).

#### `GET /api/admin/users`

Returns paginated user list with optional filters: `is_seller`, `is_verified`, `search` (matches username, display_name, email). Default `limit: 50`.

#### `GET /api/admin/users/:id`

Returns full user details plus their services, order counts, and dispute count.

#### `PUT /api/admin/users/:id/verify`

Sets `is_verified = true` on a seller account (verified badge). User must have `is_seller = true`.

#### `PUT /api/admin/users/:id/unverify`

Removes the verified badge (`is_verified = false`).

#### `GET /api/admin/disputes`

Returns all disputes across the platform with pagination and optional `status` filter.

#### `PUT /api/admin/disputes/:id/resolve`

Resolves a dispute and updates the associated order status accordingly.

**Request body:**
```json
{
  "resolution": "refund_buyer",
  "admin_notes": "Seller did not deliver within the agreed timeframe."
}
```

**Valid resolutions:** `refund_buyer`, `release_to_seller`, `partial_refund`

| Resolution           | Order effect                                  |
|----------------------|-----------------------------------------------|
| `refund_buyer`       | `order.status = refunded`, escrow → refunded  |
| `release_to_seller`  | `order.status = completed`, escrow → released |
| `partial_refund`     | `order.status = completed`                    |

#### `DELETE /api/admin/services/:id`

Soft-deactivates a service (`is_active = false`). Accepts optional `reason` body field.

#### `GET /api/admin/transactions`

Returns all transactions with pagination. Filterable by `type` and `status`. Also returns page-level totals for `amount` and `platformFee`.

---

### 4.12 Webhooks — `/api/webhooks`

#### `POST /api/webhooks/stripe`
**Auth:** Stripe signature verification (no JWT)

Receives Stripe events. The raw request body (captured before JSON body parsing) is used to verify the `stripe-signature` header against `STRIPE_WEBHOOK_SECRET`. Always returns `{ "received": true }` to acknowledge receipt, even on processing errors, to prevent Stripe retries.

| Event                          | Action                                                                 |
|--------------------------------|------------------------------------------------------------------------|
| `payment_intent.succeeded`     | Logs payment; idempotency check prevents duplicate order creation      |
| `payment_intent.payment_failed`| Marks associated order as `cancelled` if it exists                     |
| `charge.refunded`              | Sets order to `refunded`, creates a `refund` transaction record        |

---

## 5. Authentication & Authorization

### 5.1 JWT Access Token

- **Algorithm:** HS256
- **TTL:** `JWT_EXPIRE` env var (default `15m`)
- **Secret:** `JWT_SECRET`
- **Payload:**
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "is_seller": false,
    "is_admin": false,
    "is_verified": true,
    "iat": 1708780000,
    "exp": 1708780900
  }
  ```
- **Transport:** `Authorization: Bearer <token>` request header

On every protected request the `protect` middleware:
1. Extracts the token from the `Authorization` header
2. Checks the database blacklist (`token_blacklists` table)
3. Verifies the JWT signature and expiry
4. Attaches the decoded payload to `req.user`

### 5.2 Refresh Token

- **TTL:** 7 days
- **Secret:** `JWT_REFRESH_SECRET` (falls back to `JWT_SECRET`)
- **Payload:** `{ id, type: "refresh" }`
- The refresh endpoint issues a new access token; the refresh token itself is not rotated.

### 5.3 Google OAuth Flow

```
Client                  Server                      Google
  │                       │                            │
  │── POST /auth/google ──▶│                            │
  │   { token: id_token } │── verifyIdToken() ────────▶│
  │                       │◀─ { sub, email, name, pic }│
  │                       │                            │
  │                       │  findOrCreate User         │
  │                       │  generateToken + refresh   │
  │◀── { token, user } ───│                            │
```

If the email already exists as a password-based account, the Google ID is linked to that account.

### 5.4 Email Verification Flow

```
1. User registers → verification_token + verification_token_expires (24h) saved to DB
2. Verification email sent (non-blocking, fire-and-forget)
3. User clicks link → GET /api/auth/verify/:token
4. Server finds user by token, checks expiry
5. is_verified = true, token fields cleared
6. Access + refresh tokens returned → user is immediately signed in
```

### 5.5 Password Reset Flow

```
1. POST /auth/forgot-password { email }
   → rawToken = crypto.randomBytes(32)
   → storedHash = sha256(rawToken)
   → user.reset_token = storedHash, expires in 1 hour
   → email sent with rawToken in URL

2. POST /auth/reset-password { token, password }
   → incomingHash = sha256(token)
   → find user WHERE reset_token = incomingHash AND expires > NOW
   → hash new password, clear reset fields
```

Storing only the hash means the raw token in the email link cannot be read even if the database is compromised.

### 5.6 Token Blacklisting (Logout)

On `POST /api/auth/logout`:
1. The current access token is decoded (without verification) to read its `exp` claim
2. If `exp` is in the future, `blacklistToken(token, expiresIn)` is called
3. A row is inserted into `token_blacklists` with `expires_at = now + expiresIn`
4. Every subsequent request through `protect` calls `isTokenBlacklisted(token)` before JWT verification

Expired rows are purged every 15 minutes by a `setInterval` in `utils/tokenBlacklist.js`.

### 5.7 Authorization Levels

| Level       | Middleware chain              | Check                                         |
|-------------|-------------------------------|-----------------------------------------------|
| `public`    | (none)                        | —                                             |
| `protected` | `protect`                     | Valid, non-blacklisted JWT                    |
| `seller`    | `protect`, `isSeller`         | `req.user.is_seller === true`                 |
| `admin`     | `protect`, `isAdmin`          | `req.user.is_admin === true`                  |

`is_seller` and `is_admin` are embedded in the JWT at login time. Changing these flags in the database only takes effect after the user's access token expires and they log in again.

---

## 6. Payment & Escrow Flow

### 6.1 Platform Fee

```
amount        = service.price
platform_fee  = amount × (PLATFORM_FEE_PERCENT / 100)   // default 8%
seller_amount = amount − platform_fee
```

All three values are stored on the Order and Transaction records at creation time.

### 6.2 Instant Digital Products (loop_pack, drum_kit, preset_kit)

```
Client                        Server                        Stripe
  │                             │                              │
  │─ POST /payments/create-intent ──▶│                         │
  │                             │─ paymentIntents.create() ──▶│
  │                             │◀─ { clientSecret }          │
  │◀─ { clientSecret } ─────────│                              │
  │                             │                              │
  │  [Frontend confirms payment with Stripe.js]                │
  │                             │                              │
  │─ POST /payments/confirm ──▶ │                              │
  │                             │─ paymentIntents.retrieve() ▶│
  │                             │◀─ status: "succeeded"       │
  │                             │                              │
  │                             │  Order.create (status: completed)
  │                             │  Transaction.create (type: purchase)
  │                             │  service.total_sales += 1   │
  │◀─ { order } ────────────────│                              │
```

### 6.3 Collaboration (Escrow) Flow

Collaboration orders use Stripe's **manual capture** — funds are authorised but not captured until the admin explicitly releases them.

```
1. create-intent   → capture_method: "manual"
2. confirmPayment  → order.status = awaiting_upload, escrow_status = held
                  → Contract auto-generated
3. Buyer uploads files → order.status = in_progress
4. Seller delivers  → order.status = delivered
5. Buyer completes  → order.status = completed, escrow_status = released (local only)
   OR
5. Admin releases escrow → POST /payments/release-escrow
                        → stripe.paymentIntents.capture(pi_xxx)
                        → order.status = completed, escrow_status = released
                        → Transaction.create (type: payout)
```

### 6.4 Stripe Connect Onboarding

Sellers must complete Stripe Express onboarding before they can receive payouts:

```
1. GET /payments/connect-onboard
   → stripe.accounts.create({ type: "express", ... })   // if no account yet
   → user.stripe_account_id saved
   → stripe.accountLinks.create(...)                     // hosted onboarding URL
   → { url: "https://connect.stripe.com/..." }

2. Seller completes KYC on Stripe → redirect to FRONTEND_URL/seller/connect/complete

3. GET /payments/connect-status
   → stripe.accounts.retrieve(stripe_account_id)
   → { charges_enabled, payouts_enabled, details_submitted }
```

### 6.5 Webhook Event Handling

The Stripe webhook endpoint sits **before** the Express JSON body parser so the raw request body buffer is available for signature verification (`stripe.webhooks.constructEvent`).

| Event                          | Handler                                                              |
|--------------------------------|----------------------------------------------------------------------|
| `payment_intent.succeeded`     | Idempotency check; logs `payment_created` audit event               |
| `payment_intent.payment_failed`| Cancels order if `order_id` in metadata; logs `payment_failed` event |
| `charge.refunded`              | Sets order `refunded`, creates refund Transaction record             |

---

## 7. Order Lifecycle

### 7.1 Status Transition Table

| From               | Allowed transitions                             | Who triggers          |
|--------------------|-------------------------------------------------|-----------------------|
| `pending`          | `awaiting_upload`, `completed`, `cancelled`     | System / buyer        |
| `awaiting_upload`  | `in_progress`, `cancelled`                      | Buyer uploads files   |
| `in_progress`      | `awaiting_delivery`, `cancelled`                | Seller / system       |
| `awaiting_delivery`| `delivered`, `cancelled`                        | Seller delivers       |
| `delivered`        | `completed`, `disputed`                         | Buyer / either party  |
| `completed`        | *(terminal)*                                    | —                     |
| `cancelled`        | *(terminal)*                                    | —                     |
| `refunded`         | *(terminal)*                                    | —                     |
| `disputed`         | `completed`, `refunded`                         | Admin resolves        |

All transitions are validated by `utils/validator.validateStatusTransition()` before any DB write.

### 7.2 Step-by-Step (Collaboration)

```
[Payment confirmed]
    │
    ▼
awaiting_upload  ← escrow: held
    │ Buyer calls PUT /orders/:id/upload-files
    ▼
in_progress      ← buyer_files saved to order
    │ Seller calls PUT /orders/:id/deliver
    ▼
delivered        ← seller_files saved to order
    │ Buyer calls PUT /orders/:id/complete
    ▼
completed        ← escrow: released, completed_at set
```

### 7.3 Step-by-Step (Instant Digital Product)

```
[Payment confirmed]
    │
    ▼
completed        ← immediate (no escrow, no file upload cycle)
```

### 7.4 Dispute Injection

A dispute can be raised from `delivered` status (or earlier, from any active order).
When a dispute is created:
- `order.status` → `disputed`
- `dispute.status` → `open`

When the admin resolves the dispute:
- `refund_buyer` → `order.status = refunded`, escrow → `refunded`
- `release_to_seller` → `order.status = completed`, escrow → `released`
- `partial_refund` → `order.status = completed`

---

## 8. File Handling

### 8.1 Upload Pipeline

```
Browser (multipart/form-data)
    │
    ▼
Multer middleware (memory storage)
    │  ├─ MIME type filter: WAV, MP3, MIDI, ZIP only
    │  └─ Size limit: 1 GB
    ▼
handleMulterError middleware
    │
    ▼
controller.uploadFile
    │  ├─ validator.validateFileUpload()
    │  ├─ storageService.uploadFile(buffer, name, mime)
    │  │       └─ Generates unique key: {16-hex}-{timestamp}.{ext}
    │  │          Uploads to R2 via AWS SDK PutObjectCommand
    │  ├─ FileRecord.create({ scan_status: "pending" })
    │  └─ scanFileAsync(buffer, name, key)  ← fire-and-forget
    ▼
Response: { key, originalName, size, mimeType, scan_status: "pending" }
```

### 8.2 Allowed File Types

| Context            | Multer middleware         | Allowed MIME types                                                              | Max size |
|--------------------|--------------------------|---------------------------------------------------------------------------------|----------|
| Upload endpoint    | `uploadSingle` / `uploadMultiple` | `audio/wav`, `audio/mpeg`, `audio/mp3`, `audio/x-wav`, `audio/midi`, `audio/x-midi`, `application/zip`, `application/x-zip-compressed` | 1 GB     |
| Validator default  | `validateFileUpload`     | audio, PDF, Word, Excel, plain text, images, video, zip, rar, 7z               | 100 MB   |
| Contract files     | `validateContractFile`   | `application/pdf`, `application/msword`, `.docx`                               | 10 MB    |
| Subscription packs | `validateSubscriptionPackFile` | audio (mp3, wav, ogg, flac), zip, rar, 7z                                | `MAX_FILE_SIZE_MB` env (default 1 GB) |

### 8.3 Presigned Download URLs

```
storageService.getDownloadUrl(fileKey)
    └─ AWS SDK GetObjectCommand + getSignedUrl(expiresIn: 3600)
    └─ Returns a time-limited HTTPS URL valid for 1 hour
```

The `getDownloadUrl` controller first verifies access before generating the URL:
- Sellers can download files linked to their own services
- Sellers can download buyer/seller files on orders with status `in_progress` or later
- Buyers can only download files once the order is `delivered` or `completed`
- Files with `scan_status: "flagged"` are blocked entirely

### 8.4 VirusTotal Scanning (Async)

```
scanFileAsync(buffer, filename, fileKey)  ← called immediately after upload, non-blocking

    │
    ├── submitToVirusTotal(buffer, filename)
    │       └─ POST https://www.virustotal.com/api/v3/files (multipart)
    │       └─ Returns analysisId (or null if no API key)
    │
    ├── If analysisId:
    │       FileRecord.update({ virustotal_id: analysisId })
    │       setTimeout(pollScanResult, 15_000)  ← first check after 15s
    │
    ├── If no API key:
    │       FileRecord.update({ scan_status: "clean" })  ← assume safe
    │
    └── On error:
            FileRecord.update({ scan_status: "clean" })  ← fail-open

pollScanResult(analysisId, fileKey)
    │── GET /api/v3/analyses/:analysisId
    │── If status !== "completed": setTimeout(retry, 30_000)
    └── If completed:
            malicious = stats.malicious + stats.suspicious
            scan_status = malicious > 0 ? "flagged" : "clean"
            FileRecord.update({ scan_status })
```

**FileRecord scan lifecycle:**
```
pending → clean    (no detections OR no API key OR scan error)
pending → flagged  (one or more malicious/suspicious detections)
```
A `flagged` file returns `403` on all download attempts.

---

## 9. Middleware

### 9.1 `protect` — `middleware/auth.js`

Validates the JWT access token on every protected route.

**Steps:**
1. Reads `Authorization: Bearer <token>` header
2. Returns `401` if no token
3. Calls `isTokenBlacklisted(token)` — returns `401` if revoked
4. Calls `jwt.verify(token, JWT_SECRET)` — returns `401` on invalid/expired
5. Attaches decoded payload to `req.user`

**Used on:** All `/api/orders`, `/api/payments`, `/api/subscriptions`, `/api/files`, `/api/downloads`, `/api/contracts`, `/api/disputes`, `/api/admin` routes, plus `GET /api/auth/me` and `POST /api/auth/logout`.

---

### 9.2 `isSeller` — `middleware/auth.js`

Checks `req.user.is_seller`. Must follow `protect`.

Returns `403 Access denied. Seller account required.` if the claim is falsy.

**Used on:** `POST /api/services`, `PUT /api/users/seller-info`, `GET /api/payments/connect-onboard`, `GET /api/payments/connect-status`, `GET /api/subscriptions/subscribers`, `POST /api/subscriptions/:serviceId/upload-pack`, `GET /api/downloads/stats`.

---

### 9.3 `isAdmin` — `middleware/isAdmin.js`

Checks `req.user.is_admin`. Must follow `protect`.

Returns `401` if `req.user` is absent, `403 Admin privileges required.` if not admin.

**Used on:** All `/api/admin/*` routes and `POST /api/payments/release-escrow`.

---

### 9.4 `errorHandler` — `middleware/errorHandler.js`

Global Express error handler, registered last in `app.js`. Logs every error with timestamp, method, and path to `console.error`.

- In **production**: generic `"Internal Server Error"` message for `5xx` errors
- In **development**: full `err.message` and `err.stack` included in the response body
- Uses `err.statusCode` if set, otherwise defaults to `500`

---

### 9.5 `uploadSingle` / `uploadMultiple` / `handleMulterError` — `middleware/upload.js`

Configures Multer with **memory storage** (files held in `req.file.buffer` / `req.files[n].buffer` — never written to disk).

| Export           | Multer config                    | Route          |
|------------------|----------------------------------|----------------|
| `uploadSingle`   | `upload.single("file")`          | `POST /api/files/upload` |
| `uploadMultiple` | `upload.array("files", 10)`      | `POST /api/files/upload-multiple` |
| `handleMulterError` | Custom 4-argument error handler | Both upload routes (after multer) |

`handleMulterError` converts Multer's `LIMIT_FILE_SIZE` error to a friendly `400` response and passes other errors through.

---

## 10. Utilities

### 10.1 `utils/storageService.js`

S3-compatible client configured for Cloudflare R2 via the AWS SDK v3.

| Function                    | Description                                                          |
|-----------------------------|----------------------------------------------------------------------|
| `uploadFile(buffer, name, mime)` | Generates a unique key (`{16-hex}-{timestamp}.{ext}`), uploads via `PutObjectCommand`, returns `{ key, url, originalName, size, mimeType }` |
| `getDownloadUrl(fileKey)`   | Creates a presigned `GetObjectCommand` URL expiring in 3600 seconds  |
| `deleteFile(fileKey)`       | Issues `DeleteObjectCommand`; returns `true`                         |
| `uploadMultipleFiles(files)`| `Promise.all` of `uploadFile` for each `{ buffer, originalName, mimeType }` |

---

### 10.2 `utils/tokenBlacklist.js`

Database-backed JWT blacklist that persists across server restarts and multiple instances.

| Function                          | Description                                                      |
|-----------------------------------|------------------------------------------------------------------|
| `blacklistToken(token, expiresIn)`| Inserts a row with `expires_at = now + expiresIn seconds`        |
| `isTokenBlacklisted(token)`       | Queries for a non-expired matching row; returns `boolean`        |
| `cleanupExpiredTokens()`          | Deletes all rows where `expires_at <= now`; runs every 15 min via `setInterval` |

Uses **lazy-loading** (`require("../models").TokenBlacklist` inside function body) to avoid circular dependency issues at startup.

---

### 10.3 `utils/virusScanner.js`

Async VirusTotal integration. No external HTTP library — uses Node's built-in `https` module.

| Function                              | Description                                                                  |
|---------------------------------------|------------------------------------------------------------------------------|
| `scanFileAsync(buffer, filename, key)`| Entry point. Fire-and-forget. Calls `submitToVirusTotal` then starts polling. |
| `submitToVirusTotal(buffer, filename)`| Builds a `multipart/form-data` body manually and POSTs to `/api/v3/files`.  |
| `pollScanResult(analysisId, fileKey)` | GETs `/api/v3/analyses/:id` every 30 seconds until `status === "completed"`. |

If `VIRUSTOTAL_API_KEY` is not set, files are immediately marked `clean`. If any step throws, files are also marked `clean` (fail-open to avoid blocking legitimate uploads).

---

### 10.4 `utils/email.js`

Nodemailer wrapper using SMTP transport.

| Function                                | Email subject                          | Link TTL |
|-----------------------------------------|----------------------------------------|----------|
| `sendVerificationEmail(email, token)`   | "Verify your ProdMarket email"         | 24 hours |
| `sendPasswordResetEmail(email, token)`  | "Reset your ProdMarket password"       | 1 hour   |

Both functions are called with `.catch()` so email failures never block the primary flow.

---

### 10.5 `utils/validator.js`

Centralised input validation. Each function returns `{ valid: boolean, error?: string }`.

| Function                            | Validates                                                      |
|-------------------------------------|----------------------------------------------------------------|
| `validateOrderAmount(amount)`       | Positive number, ≤ $999,999, max 2 decimal places             |
| `validateStatusTransition(from, to)`| Legal order state machine transition                           |
| `validateDeliveryDeadline(date)`    | Future date, max 90 days ahead                                 |
| `validatePagination(page, limit)`   | `page ≥ 1`, `1 ≤ limit ≤ 100`; also returns coerced integers  |
| `validateDisputeReason(reason)`     | Enum: `not_delivered`, `wrong_files`, `quality_issue`, `communication_issue`, `other` |
| `validateServiceType(type)`         | Enum: `collaboration`, `subscription`, `loop_pack`, `drum_kit`, `preset_kit` |
| `validateText(text, options)`       | Length between `minLength` and `maxLength` (defaults 1–5000)  |
| `validateFileUpload(file, options)` | MIME type allowlist, size limit, no path traversal in filename |
| `validateMultipleFileUploads(files)`| 1–50 files, each passing `validateFileUpload`                  |
| `validateContractFile(file)`        | PDF / Word, ≤ 10 MB                                            |
| `validateSubscriptionPackFile(file)`| Audio + archive MIME types, ≤ `MAX_FILE_SIZE_MB` env          |

---

### 10.6 `utils/auditLog.js`

Winston logger with daily log rotation.

**Configuration:**
- Log directory: `../logs/` (relative to `utils/`)
- Filename pattern: `audit-YYYY-MM-DD.log`
- Rotation: daily
- Max file size: 100 MB
- Retention: 30 days
- Compression: gzip (`zippedArchive: true`)
- Format: JSON with timestamp
- In non-production: also logs to console with colour

All log functions call `logAuditEvent(event, req)` which merges `ip_address` (extracted from `x-forwarded-for` header or socket remote address) into the event object before calling `logger.info()`.

| Function                                         | `action` field            | Key fields logged                                         |
|--------------------------------------------------|---------------------------|-----------------------------------------------------------|
| `logPaymentCreated(userId, serviceId, amount, piId, req)` | `payment_created` | `user_id`, `service_id`, `amount`, `payment_intent_id`    |
| `logOrderCreated(orderId, buyerId, sellerId, amount, req)` | `order_created`  | `order_id`, `buyer_id`, `seller_id`, `amount`             |
| `logOrderStatusChange(orderId, old, new, userId, req)` | `order_status_changed` | `order_id`, `old_status`, `new_status`, `changed_by_user_id` |
| `logPayoutReleased(orderId, sellerId, amount, req)` | `payout_released`       | `order_id`, `seller_id`, `amount`                         |
| `logDisputeCreated(disputeId, orderId, userId, reason, req)` | `dispute_created` | `dispute_id`, `order_id`, `raised_by_user_id`, `reason`  |
| `logDisputeResolved(disputeId, resolution, adminId, req)` | `dispute_resolved` | `dispute_id`, `resolution`, `resolved_by_user_id`        |
| `logFileAccessed(fileKey, userId, action, req)`  | `file_{action}`           | `file_key`, `user_id`                                     |
| `logAdminAction(adminId, action, targetId, details, req)` | `admin_{action}` | `admin_id`, `target_id`, `details`                        |
| `logSecurityEvent(event, userId, details, req)`  | `security_{event}`        | `user_id`, `details`                                      |

---

## 11. Security

### 11.1 Rate Limiting

| Limiter              | Window     | Max requests | Applied to                                                 |
|----------------------|------------|--------------|------------------------------------------------------------|
| Global               | 15 minutes | 100          | All routes (`app.use(globalLimiter)`)                      |
| Auth                 | 15 minutes | 20           | `app.use("/api/auth", authLimiter)` (covers all auth routes) |
| Sensitive auth       | 15 minutes | 5            | `POST /auth/resend-verification`, `POST /auth/forgot-password` |
| Download             | 1 minute   | 30           | `GET /api/files/download/:fileKey`                         |

All rate limiters use `standardHeaders: true` (`RateLimit-*` headers) and `legacyHeaders: false`.

### 11.2 Helmet

`app.use(helmet())` applies the full suite of Helmet defaults including:
- `Content-Security-Policy`
- `X-DNS-Prefetch-Control`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection`

### 11.3 CORS

```js
cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "stripe-signature"],
})
```

Only the configured frontend origin is allowed. The `stripe-signature` header is explicitly allowed so the webhook endpoint works.

### 11.4 Request Body Size Limit

```js
express.json({ limit: "10kb" })
express.urlencoded({ extended: true, limit: "10kb" })
```

The Stripe webhook route uses `express.raw({ type: "application/json" })` **before** the body parsers so the raw buffer is available for signature verification.

### 11.5 Morgan Logging Exclusions

The following paths are excluded from Morgan request logging to avoid leaking credentials in log files:

- `/api/auth/**` (tokens, passwords)
- `/api/payments/**` (Stripe keys, amounts)
- `/health`

### 11.6 Stripe Webhook Signature Verification

Every request to `POST /api/webhooks/stripe` is verified:

```js
stripe.webhooks.constructEvent(req.rawBody, req.headers["stripe-signature"], STRIPE_WEBHOOK_SECRET)
```

Failures log a `security_webhook_signature_verification_failed` audit event and return `400`.

### 11.7 Error Sanitisation in Production

The global `errorHandler` replaces the actual error message with `"Internal Server Error"` for any `5xx` response in production mode, preventing internal stack traces or implementation details from leaking to the client. Stack traces are only included in `development` mode.

### 11.8 Password Security

- Minimum 12 characters with uppercase, lowercase, numeric, and special character requirements
- Hashed with `bcryptjs` using `salt rounds: 10`
- Reset tokens stored as SHA-256 hashes; raw token only ever travels via email link and is never stored

### 11.9 File Security

- Filenames are validated to prevent path traversal (`..` and `/` are rejected)
- Files with VirusTotal `flagged` status are blocked at the download endpoint regardless of access rights
- Files are stored in R2 with UUID-based keys — original filenames are never used as storage keys

---

## 12. Audit Logging

All financial, file, and administrative actions are written to a rotating log file at `server/logs/audit-YYYY-MM-DD.log`.

### Log Format

Each entry is a JSON object:

```json
{
  "level": "info",
  "message": "",
  "action": "order_created",
  "order_id": 42,
  "buyer_id": 7,
  "seller_id": 15,
  "amount": "150.00",
  "ip_address": "192.168.1.1",
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

### Retention Policy

| Setting       | Value            |
|---------------|------------------|
| Rotation      | Daily            |
| File naming   | `audit-YYYY-MM-DD.log` |
| Max file size | 100 MB           |
| Retention     | 30 days          |
| Compression   | gzip after rotation |

### Logged Events

| Trigger                                        | `action`                           |
|------------------------------------------------|------------------------------------|
| Payment intent confirmed (`confirmPayment`)    | `payment_created`                  |
| Webhook `payment_intent.succeeded`             | `payment_created`                  |
| Order created manually                         | `order_created`                    |
| Order status changed (any transition)          | `order_status_changed`             |
| Escrow released                                | `payout_released`                  |
| Dispute created                                | `dispute_created`                  |
| Dispute resolved                               | `dispute_resolved`                 |
| File uploaded                                  | `file_upload`                      |
| File download URL generated                    | `file_download`                    |
| File deleted                                   | `file_delete`                      |
| Admin action                                   | `admin_{action}`                   |
| Payment failure (webhook)                      | `security_payment_failed`          |
| Stripe webhook signature failure               | `security_webhook_signature_verification_failed` |
| Webhook processing error                       | `security_webhook_processing_error` |

---

## 13. Subscription System

### 13.1 Overview

The subscription system lets sellers offer **recurring monthly content** to subscribers. Each subscription is backed by a Stripe Subscription object. Sellers periodically upload "packs" (collections of files) that all active subscribers can download.

### 13.2 Creating a Subscription

```
Buyer calls POST /api/subscriptions { service_id, payment_method_id }
    │
    ├── Validate: service.type === "subscription" && service.is_active
    ├── Check: no existing active subscription to this service
    ├── stripe.subscriptions.create({ price_data: { unit_amount, recurring: { interval: "month" } }, ... })
    ├── Subscription.create({ stripe_subscription_id, status: "active", period_start, period_end })
    └── Transaction.create({ type: "subscription", ... })
```

### 13.3 Subscription Pack Uploads

A seller uploads a pack at any time:

```
POST /api/subscriptions/:serviceId/upload-pack
    { title, description, file_urls, file_size_mb }
    │
    ├── Verify: service exists, seller owns it, service.type === "subscription"
    └── SubscriptionPack.create({ service_id, seller_id, title, file_urls, ... })
        └── Response includes subscriberCount of active subscribers
```

### 13.4 Pack Access Control

Accessing packs requires:
- An **active** `Subscription` record for the service (`status: "active"`), **OR**
- Being the seller who owns the service

Expired subscriptions (`cancelled`, `past_due`, `paused`) lose access.

### 13.5 Cancellation

```
DELETE /api/subscriptions/:id  (buyer only)
    │
    ├── stripe.subscriptions.cancel(stripe_subscription_id)
    │   (skipped for TEST_ prefixed IDs in development)
    └── subscription.status = "cancelled", cancelled_at = now
        → Buyer retains access until current_period_end (Stripe handles this)
```

### 13.6 Period Tracking

`current_period_start` and `current_period_end` are populated from Stripe's subscription object at creation. They are not automatically updated by the server — a Stripe webhook for `customer.subscription.updated` would need to be added to keep these in sync.

---

## 14. Dispute System

### 14.1 Raising a Dispute

Either the buyer or the seller of an order can raise a dispute. Only one active dispute (`open` or `under_review`) may exist per order at a time.

```
POST /api/disputes
    { order_id, reason, description, evidence_urls? }
    │
    ├── Validate reason (enum) and description (10–5000 chars)
    ├── Verify: user is buyer or seller of the order
    ├── Check: no existing active dispute
    ├── DB transaction:
    │   ├── Dispute.create({ status: "open", ... })
    │   └── order.status = "disputed"
    └── Audit log: dispute_created + order_status_changed
```

### 14.2 Dispute Workflow

```
open
  │  Other party responds (POST /disputes/:id/respond)
  ▼
under_review
  │  Raiser adds more evidence (PUT /disputes/:id)
  │  Admin reviews
  ▼
resolved      ← admin calls PUT /admin/disputes/:id/resolve
  │
  ▼
(closed — future state, not yet auto-transitioned)
```

### 14.3 Evidence and Responses

- The raiser can update `description` and **append** to `evidence_urls` (existing evidence is preserved).
- The opposing party calls `POST /disputes/:id/respond` with a text response. This is stored in `admin_notes` with a `[Response from User X]:` prefix. The status moves to `under_review`.
- Updates and responses are only allowed while the dispute is `open` or `under_review`.

### 14.4 Admin Resolution

```
PUT /api/admin/disputes/:id/resolve
    { resolution: "refund_buyer" | "release_to_seller" | "partial_refund", admin_notes }
```

| Resolution           | Dispute status | Order status   | Escrow status      | Next step                   |
|----------------------|---------------|----------------|--------------------|-----------------------------|
| `refund_buyer`       | `resolved`    | `refunded`     | `refunded`         | Process Stripe refund (TODO)|
| `release_to_seller`  | `resolved`    | `completed`    | `released`         | Release Stripe capture (TODO)|
| `partial_refund`     | `resolved`    | `completed`    | unchanged          | Process partial refund (TODO)|

> **Note:** Actual Stripe refund/capture calls are marked as `TODO` in the controller — the
> current implementation only updates the database state. Stripe operations should be wired in
> for production.

---

## 15. Admin Panel

### 15.1 Access Control

All admin endpoints require both middleware in sequence:

```
protect   →   isAdmin
```

`is_admin` is a boolean column on the `users` table, added via the `add-user-admin` migration. It must be set manually in the database — there is no API endpoint to grant admin privileges.

### 15.2 Dashboard (`GET /api/admin/dashboard`)

Aggregates the following statistics in a single request:

**User stats:** total users, total sellers, verified sellers

**Service stats:** total services, active services

**Order stats:** total, completed, active (pending/in-progress/delivered), disputed

**Dispute stats:** open, under review

**Revenue stats:** total GMV from completed orders, total platform fees collected

**Recent activity:** last 10 orders and last 10 user signups

### 15.3 User Management

| Endpoint                            | Action                                             |
|-------------------------------------|----------------------------------------------------|
| `GET /api/admin/users`              | Paginated list; filter by `is_seller`, `is_verified`, `search` |
| `GET /api/admin/users/:id`          | Full user detail + services + order/dispute counts |
| `PUT /api/admin/users/:id/verify`   | Grant verified badge (user must be a seller)       |
| `PUT /api/admin/users/:id/unverify` | Remove verified badge                              |

The user list excludes `password_hash` and `google_id`.

### 15.4 Dispute Management

| Endpoint                              | Action                                                        |
|---------------------------------------|---------------------------------------------------------------|
| `GET /api/admin/disputes`             | All disputes across the platform, with nested order/user data |
| `PUT /api/admin/disputes/:id/resolve` | Set resolution, update order status, record `resolved_by_admin_id` |

### 15.5 Service Moderation

| Endpoint                        | Action                                                      |
|---------------------------------|-------------------------------------------------------------|
| `DELETE /api/admin/services/:id`| Soft-deactivates service (`is_active = false`); accepts optional `reason` |

### 15.6 Transaction Ledger

`GET /api/admin/transactions` — paginated; filter by `type` (`purchase`, `subscription_payment`, `refund`, `payout`) and `status`. Returns page-level totals for `amount` and `platformFee`.

---

*Generated by ProdMarket — 2026-02-24*
