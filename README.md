# ManuScript Studio 🎨✨

**ManuScript Studio** is a full-featured, production-ready creative platform that rivals Canva Premium. Built with React, TypeScript, tRPC, and Drizzle ORM, it features a comprehensive customer portal, an expansive branding kit, direct social media publishing, and an unrestricted, highly capable AI design assistant.

---

## 🚀 Features

- **Customer Portal & Dashboard**: A complete workspace with persistent storage for projects, uploads, templates, brand kits, and activity tracking.
- **Massive Branding Kit**: 1000+ fonts, color palettes, gradients, logos, and brand voice guidelines.
- **Stripe-Powered Subscriptions**: Free, Pro, and Business tiers with Stripe Checkout, billing portal, webhook handling, and feature gating.
- **Social Media Integration**: Direct publishing to Facebook and Instagram (with architecture ready for TikTok, X, LinkedIn, Pinterest, and YouTube).
- **Unrestricted AI Assistant**: A "Manus-style" creative partner that can critique designs, generate copy, suggest layouts, and directly apply colors/fonts to your canvas.
- **AI Elements Generation**: Dynamically generate backgrounds, layouts, and design elements using AI.
- **Advanced Canvas Editor**: Built on Fabric.js, featuring layers, alignment tools, magic resize, and multiple export formats (PNG, JPG, PDF, WebP, SVG).

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **pnpm** (or npm/yarn)
- **MySQL** compatible database (e.g., TiDB, PlanetScale, or local MySQL 8+)
- A **GitHub** account (for cloning)

---

## 🛠️ Local Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/travis26836-dot/ms-studio.git
cd ms-studio
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure the following variables. 

```env
# Database Configuration
DATABASE_URL="mysql://user:password@host:port/dbname"

# Server Configuration
PORT=3000
NODE_ENV="development"

# AI Integration (OpenAI or compatible API)
OPENAI_API_KEY="your_openai_api_key"
OPENAI_BASE_URL="https://api.openai.com/v1" # Optional: Override for proxy/compatible endpoints

# Image Generation (FLUX/BFL API)
BFL_API_KEY="your_bfl_api_key"

# Storage (S3-compatible storage for uploads/exports)
S3_ACCESS_KEY="your_s3_access_key"
S3_SECRET_KEY="your_s3_secret_key"
S3_BUCKET="your_bucket_name"
S3_ENDPOINT="your_s3_endpoint"
S3_PUBLIC_URL="your_s3_public_url"

# Authentication (JWT Secret for sessions)
JWT_SECRET="your_secure_random_string"

# Stripe Payments (Required for paid subscriptions)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_signing_secret"

# Social Media OAuth (Optional: Required only if using social publishing)
FACEBOOK_APP_ID="your_facebook_app_id"
FACEBOOK_APP_SECRET="your_facebook_app_secret"

# App URL (Used for Stripe redirect URLs)
APP_URL="http://localhost:3000"
```

### 4. Database Setup & Seeding
The project uses Drizzle ORM. You need to push the schema to your database and seed it with the initial templates and assets.

```bash
# Push the schema to the database
npx drizzle-kit push:mysql

# Seed the database with templates, assets, and presets
node seed.mjs
```

*(Note: Ensure your `DATABASE_URL` is correctly set before running these commands).*

### 5. Start the Development Server
```bash
npm run dev
# or
pnpm dev
```
The server will start (typically on `http://localhost:3000`). The backend Express server and the Vite frontend run concurrently.

---

## 🔑 Setting Up API Keys & Integrations

### AI Assistant (OpenAI)
1. Go to the [OpenAI Platform](https://platform.openai.com/).
2. Generate an API key.
3. Add it to `.env` as `OPENAI_API_KEY`.
*(The app uses the `invokeLLM` helper which automatically picks up this key).*

### AI Image Generation (FLUX/BFL)
1. Go to [BFL (Black Forest Labs)](https://bfl.ai/).
2. Generate an API key.
3. Add it to `.env` as `BFL_API_KEY`.

### Stripe Payments & Subscriptions
To enable paid plans (Pro, Business) with Stripe Checkout:
1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/).
2. Get your **Secret Key** from Developers > API Keys. Add it to `.env` as `STRIPE_SECRET_KEY`.
3. Create Products and Prices in Stripe for your plans:
   - **Pro Monthly**: e.g., `$12/month` — copy the Price ID (starts with `price_`)
   - **Pro Yearly**: e.g., `$99/year`
   - **Business Monthly**: e.g., `$29/month`
   - **Business Yearly**: e.g., `$249/year`
4. Update the `monthlyPriceId` and `yearlyPriceId` fields in `subscriptionTypes.ts` with your actual Stripe Price IDs.
5. Set up a Webhook in Stripe Dashboard > Developers > Webhooks:
   - Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
   - Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
6. Copy the Webhook Signing Secret and add it to `.env` as `STRIPE_WEBHOOK_SECRET`.

### Social Media Publishing (Facebook & Instagram)
To enable the Social Media Panel's direct publishing features:
1. Go to the [Meta for Developers](https://developers.facebook.com/) portal.
2. Create an App (Type: Business).
3. Add the **Facebook Login** and **Instagram Graph API** products.
4. Configure your OAuth redirect URIs to point to your domain (e.g., `https://yourdomain.com/api/oauth/callback`).
5. Add the App ID and Secret to your `.env` file.
6. Note: The app requests the `pages_manage_posts`, `pages_read_engagement`, and `instagram_basic` permissions.

---

## 🚀 Production Deployment

### Building the Project
To build the project for production, run:
```bash
npm run build
# or
pnpm build
```
This command compiles the TypeScript code, builds the Vite frontend into static files, and prepares the Express server.

### Running in Production
In production, set `NODE_ENV="production"`. The Express server will automatically serve the static frontend files built by Vite.

```bash
export NODE_ENV=production
npm start
# or
node dist/index.js
```

### Deployment Platforms

#### Vercel / Render / Railway
1. Connect your GitHub repository.
2. Set the Build Command to `npm run build`.
3. Set the Start Command to `npm start`.
4. Add all the environment variables from your `.env` file into the platform's environment settings.

#### Docker
If you prefer Docker, you can create a standard Node.js Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🗄️ Project Architecture

- **`/src/components`**: React UI components (Dashboard, Editor panels, Dialogs).
- **`/src/pages`**: Main route components (`Home.tsx`, `EditorPage.tsx`).
- **`/server/routers.ts`**: The massive tRPC router handling all API endpoints (Auth, Projects, AI, Social, Brand Kits).
- **`/server/schema.ts`**: Drizzle ORM database schema defining all tables.
- **`/server/db.ts`**: Database helper functions.
- **`/shared/designTypes.ts`**: Shared TypeScript interfaces, canvas presets, and brand kit constants used by both frontend and backend.
- **`/shared/subscriptionTypes.ts`**: Pricing plans, feature gates, and subscription type definitions.
- **`/server/stripe.ts`**: Stripe SDK integration for checkout, billing portal, and subscription management.

---

## 📝 License
This project is proprietary and built specifically for the ManuScript Studio platform.
