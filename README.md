# NebulaDW

NebulaDW is a modern, cloud-based Data Warehouse application.

## Live Deployment
- **Production Environment:** [danielfreiremendes.com](https://danielfreiremendes.com/)

---

## Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Cloudflare Workers (TypeScript)
- **Database:** Cloudflare D1 (Serverless SQLite)
- **AI Integration:** Cloudflare Workers AI
- **Testing:** Java + Maven (End-to-End Tests)

---

## Setup & Installation

### Cloudflare Initialization

Install Wrangler and authenticate:

```bash
npm install -g wrangler
wrangler login
```

### Database Setup

Create the primary production database:

```bash
npx wrangler d1 create db-prod
```

Execute the database schema migrations:
```bash
npx wrangler d1 execute db-prod --file=drop_tables.sql --remote
cd init_sqlite
npx wrangler d1 execute db-prod --file=V0__Create_Tables.sql --remote
npx wrangler d1 execute db-prod --file=V1__Create_Views.sql --remote
npx wrangler d1 execute db-prod --file=V2__Insert_Models.sql --remote
npx wrangler d1 execute db-prod --file=V3__Insert_Random_Test_Data.sql --remote
npx wrangler d1 execute db-prod --file=V4__Generate_Orders.sql --remote
```

Create the separate D1 database for the AI chat application:
```bash
npx wrangler d1 create chat-db
npx wrangler d1 execute chat-db --file=initial.sql --remote
```

---

### Backend (Cloudflare Workers)

The core backend infrastructure is deployed via Cloudflare Workers for global low-latency execution.

**Local Development:**
```bash
cd api-controller
npm install
npm run dev
```

**Deployment:**
```bash
cd api-controller
npm run deploy
```

*(Note: The legacy Go backend is retained under the `controller/` directory for reference, but the primary deployment now utilizes Cloudflare Workers.)*

---

### Frontend Setup

**Local Development:**
```bash
cd frontend
npm install
npm run dev
```

**Deployment:**
The frontend can be deployed to Cloudflare Pages or Vercel using the Vite preset. Ensure the following environment variable is defined in the hosting provider to point to the Cloudflare Worker URL:

```env
VITE_API_ENV=your_cloudflare_worker_url
```

---

## Testing

End-to-End Front-end Tests are configured using Java and Maven.

```bash
cd frontend-testing
mvn test
```

---

## Component Libraries

- **UI Frameworks:** Vite, Tailwind CSS, Shadcn UI
- **Icons:** Lucide Icons

---

## Project Structure

```text
/
├── api-controller/       # Cloudflare Workers Backend (TypeScript)
├── controller/           # Legacy Backend (Go)
├── frontend/             # Single Page Application (Vite + React)
└── frontend-testing/     # E2E Tests (Java + Maven)
```

---
Daniel Freire Mendes
