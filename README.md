https://tailwindcss.com/docs/installation/framework-guides/react-router
https://ui.shadcn.com/docs/components/card

https://ui.shadcn.com/docs/components/sidebar

🔷 Name: "NebulaDW"
Bedeutung:

Nebula steht für eine Wolke aus Daten, Wissen und Möglichkeiten (wie bei einer Sternennebel-Analogie), was gut zur Cloud- oder Big-Data-Welt passt.
DW steht für „Data Warehouse“, was es sofort als technisches System kenntlich macht.
Der Name klingt modern, tech-orientiert und ist leicht zu merken.

https://lucide.dev/icons/box

go run main.go --local => mit localhost
go run main.go => mit railway db

Railway Postgres: just add a new database and copy the connection string

Vercel:
- Framework Preset: Next.js => use all default settings
- Root Directory: frontend
- Node Version: 22.x
- Under Domain add your domain name => add cname in webhosting provider, f.ex. in ionos

Railway Go Deployment:
- Environment: Go
- Custom Build Command: cd controller && go build -o out
- Custom Start Command: cd controller && ./out

Need to export these variables in Railway:
- BACKEND_BASE_URL
- DATABASE_PUBLIC_URL
- EMAIL_FROM
- EMAIL_PASS
- JWT_SECRET