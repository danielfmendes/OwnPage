# 🌌 NebulaDW

**NebulaDW** ist ein modernes, cloud-basiertes Data-Warehouse-System.

### 🚀 Durchführung

- **🔗 Deployte Live-Version:**  
  👉 [NebulaDW – Live ansehen](https://danielfreiremendes.com/)


- **🖥️ Lokale Ausführung:**  
  Details zur lokalen Einrichtung und Ausführung findest du in den Abschnitten:  
  → **„Setup & Installation“**  
  → **„Deployment“**

---

## 🔧 Setup & Installation

## Cloudflare - Implementation

```bash
npm install -g wrangler
wrangler login
```

Datenbank erstellen:

```bash
wrangler d1 create db-prod
```

Datenbank-Schema ausführen:
```bash
cd init_sqlite
wrangler d1 execute db-prod --file=V0__Create_Tables.sql --remote
wrangler d1 execute db-prod --file=V1__Create_Views.sql --remote
wrangler d1 execute db-prod --file=V2__Insert_Models.sql --remote
wrangler d1 execute db-prod --file=V3__Insert_Random_Test_Data.sql --remote
wrangler d1 execute db-prod --file=V4__Generate_Orders.sql --remote
```

```bash
cd wasp
npx wrangler dev --remote
```

### 📦 Backend (Go)

#### 🔁 Lokal starten:

```bash
go run main.go --local
```

#### 🌐 Mit Render-Postgres starten:

```bash
go run main.go
```

> 💡 **Hinweis:** In Render eine neue Postgres-Datenbank erstellen und die Verbindungszeichenfolge als Umgebungsvariable
> einfügen.

#### 🚀 Deployment auf Render:

- **Environment:** `Go`
- **Build Command:**
  ```bash
  cd controller && go build -o out
  ```
- **Start Command:**
  ```bash
  cd controller && ./out
  ```

##### Benötigte Umgebungsvariablen (Render):

```env
BACKEND_BASE_URL=
DATABASE_PUBLIC_URL=
EMAIL_FROM=
EMAIL_PASS=
JWT_SECRET=
```

---

#### 🌍 Deployment auf Vercel:

- **Framework Preset:** Vite (Standard-Einstellungen verwenden)
- **Root Directory:** `frontend`
- **Node Version:** `22.x`
- **Domain hinzufügen:** Eigene Domain hinzufügen und CNAME-Eintrag im Hosting-Provider (z. B. IONOS) setzen
- **Umgebungsvariablen:** In Vercel diese Umgebungsvariable hinzufügen:

```env
VITE_API_ENV=link_from_controller_endpoint
```

---

### 🎨 Frontend (Vite + React + Tailwind CSS + shadcn/ui)

#### Lokale Einrichtung:

```bash
cd frontend
npm install
```

#### ✅ Frontend-Test:

```bash
cd frontend-testing
mvn test
```

---

## 🧱 Komponenten

- **📚 Vite + Tailwind CSS + Shadcn Ui**  
  → [Guide ansehen](https://ui.shadcn.com/docs/installation/vite)

- **🃏 UI-Komponenten mit shadcn/ui**
    - [📦 Card-Komponente](https://ui.shadcn.com/docs/components/card)
    - [📂 Sidebar-Komponente](https://ui.shadcn.com/docs/components/sidebar)

---

## 🧩 Icon Library
- 

- Verwendete Icons: [Box (Lucide Icons)](https://lucide.dev/icons/box)

---

## 📁 Projektstruktur

```bash
/
├── controller/           # Backend (Go)
│   └── main.go
├── frontend/             # Next.js Frontend mit Tailwind & shadcn/ui
│   └── .env.local
├── frontend-testing/     # End-to-End Tests (Java + Maven)
```

---
Daniel Freire Mendes
