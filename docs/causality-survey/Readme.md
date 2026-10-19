1. Create the (D1) Database

```bash
npx wrangler d1 create cookie-db
```

```bash
npx wrangler d1 execute SURVEY_DB --remote --file=../../database/sqlite/causality_survey.sql
```

2. Create the API (Cloudflare Worker)

```bash
npm install -D typescript @cloudflare/workers-types
```

3.

```bash
 npm dlx shadcn@latest init --preset b0 --template vite 
```

```bash
npx shadcn@latest add button card input select radio-group label slider progress command popover skeleton
```