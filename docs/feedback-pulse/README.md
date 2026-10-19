# Feedback Pulse 🚀

**Live Demo:** [https://cfchallenge.pages.dev](https://cfchallenge.pages.dev)

**Feedback Pulse** is a real-time, AI-powered analytics dashboard that aggregates customer feedback from multiple
sources (Discord, Twitter, Email, GitHub). It leverages Cloudflare's Edge AI to instantly analyze sentiment, calculate
urgency, identify root causes, and generate code fixes.

---

## 🌟 Key Features

### 🧠 Intelligent Ingestion

* **Multi-Channel Support:** Ingests data from various platforms via a unified API.
* **AI Enrichment (Llama-3):** Automatically extracts:
    * **Sentiment:** Positive, Negative, or Neutral.
    * **Urgency Score:** 1 (Low) to 5 (Critical).
    * **Root Cause Analysis:** Technical explanation of the issue.
    * **Suggested Fix:** Generates Git commands or code snippets to resolve the bug.
* **Vector Search:** Uses **BGE-Base** embeddings to semantically cluster related issues.

### 📊 Real-Time Dashboard

* **Live Metrics:** Updates instantly via custom events without page reloads.
* **Sentiment Trends:** Visualizes positive vs. negative feedback over time.
* **Topic Clustering:** Visualization of issue density and urgency.
* **Ingestion Playground:** A built-in simulator to seed data and test the AI pipeline in real-time.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, TailwindCSS, Shadcn UI, Recharts.
* **Backend:** Cloudflare Workers (TypeScript).
* **Database:** Cloudflare D1 (SQLite).
* **Vector DB:** Cloudflare Vectorize.
* **AI:** Cloudflare Workers AI.
* **CI/CD:** GitHub Actions & Cloudflare Pages.

---

## 🚀 Local Development Setup

### 1. Database Initialization

Ensure you have \`wrangler\` installed and authenticated (\`npx wrangler login\`).

```bash
# 1. Create the D1 Database
npx wrangler d1 create feedback-db

# 2. Create the Vector Index
npx wrangler vectorize create feedback-index --dimensions=768 --metric=cosine

# 3. Apply the Schema
npx wrangler d1 execute feedback-db --file=schema.sql --remote
```

*Note: Update your \`wrangler.toml\` with the IDs returned from the commands above.*

### 2. Backend (API Worker)

```bash
cd api-worker

# Install dependencies
npm install
npm install @cloudflare/ai base64-js mustache

# Deploy to Cloudflare
npx wrangler deploy
```

### 3. Frontend (Dashboard)

```bash
cd frontend

# Install UI and Logic libraries
pnpm add recharts react-router-dom @monaco-editor/react
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add card badge button dialog tabs scroll-area separator skeleton

# Set API Environment Variable
echo "VITE_API_URL=https://feedback-api.your-subdomain.workers.dev" > .env

# Run locally
pnpm dev
```

---

## 🧪 Verification & Seeding

To populate your dashboard with data, use the included seeding script. This generates realistic issues with dynamic
timestamps.

**1. Check API Health:**

```bash
curl -X POST https://feedback-api.your-subdomain.workers.dev/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "Terminal",
    "author": "admin",
    "content": "Verifying AI pipeline latency and database connectivity."
  }'
```

**2. Seed Bulk Data:**

```bash
# Runs the local script to generate 20+ items and upload them one-by-one
node seed.js
```

---

## 📦 Deployment (CI/CD)

This project uses a **GitHub Actions** pipeline to automatically deploy the Backend (Workers) and Frontend (Pages) on
every push to \`main\`.

### Required Repository Secrets

To enable the pipeline, add these secrets in your GitHub Repository settings:

| Secret Name               | Description                                               |
|:--------------------------|:----------------------------------------------------------|
| \`CLOUDFLARE_API_TOKEN\`  | Your Cloudflare API Token with Workers/Pages permissions. |
| \`CLOUDFLARE_ACCOUNT_ID\` | Your Cloudflare Account ID.                               |
| \`FEEDBACK_DB_ID\`        | The ID of your D1 Database (found in \`wrangler.toml\`).  |

### Workflow Overview

1. **Deploy Backend:** Installs dependencies and deploys the Worker to the Edge.
2. **Deploy Frontend:** Builds the Vite app and publishes it to Cloudflare Pages (only runs if the backend deploys
   successfully).
