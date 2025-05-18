# 🌌 NebulaDW

**NebulaDW** ist ein modernes, cloud-basiertes Data-Warehouse-System.

### 🔷 Bedeutung des Namens:
- **Nebula**: Eine Wolke aus Daten, Wissen und Möglichkeiten – inspiriert von Sternennebeln.
- **DW**: Steht für „Data Warehouse“ – der technische Fokus des Projekts.

---

## 🔧 Setup & Installation

### 📦 Backend (Go)

#### 🔁 Lokal starten:
```bash
go run main.go --local
```

#### 🌐 Mit Railway-Postgres starten:
```bash
go run main.go
```

> 💡 **Hinweis:** In Railway eine neue Postgres-Datenbank erstellen und die Verbindungszeichenfolge als Umgebungsvariable einfügen.

#### 🚀 Deployment auf Railway:
- **Environment:** `Go`
- **Build Command:**
  ```bash
  cd controller && go build -o out
  ```
- **Start Command:**
  ```bash
  cd controller && ./out
  ```

##### Benötigte Umgebungsvariablen (Railway):
```env
BACKEND_BASE_URL=
DATABASE_PUBLIC_URL=
EMAIL_FROM=
EMAIL_PASS=
JWT_SECRET=
```

---

### 🎨 Frontend (Next.js + Tailwind CSS + shadcn/ui)

#### Lokale Einrichtung:
```bash
cd frontend
npm install
```

In `/frontend/.env.local` einfügen:
```env
NEXT_PUBLIC_API_ENV=local
```

#### ✅ Frontend-Test:
```bash
cd frontend-testing
mvn test
```

#### 🌍 Deployment auf Vercel:
- **Framework Preset:** Next.js (Standard-Einstellungen verwenden)
- **Root Directory:** `frontend`
- **Node Version:** `22.x`
- **Domain hinzufügen:** Eigene Domain hinzufügen und CNAME-Eintrag im Hosting-Provider (z. B. IONOS) setzen
- **Umgebungsvariablen:** In Vercel diese Umgebungsvariable hinzufügen:
```env
NEXT_PUBLIC_API_ENV=vercel
```

---

## 🧱 Komponenten

- **📚 Tailwind CSS + React Router Integration**  
  → [Guide ansehen](https://tailwindcss.com/docs/installation/framework-guides/react-router)

- **🃏 UI-Komponenten mit shadcn/ui**
    - [📦 Card-Komponente](https://ui.shadcn.com/docs/components/card)
    - [📂 Sidebar-Komponente](https://ui.shadcn.com/docs/components/sidebar)

---

## 🧩 Icon Library

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
