# General Travels

Charter bus & tempo-traveller marketplace: customers post trip requirements, verified operators send quotes, and General Travels admins verify everything in between.

- **Stack:** Next.js 16 (App Router) · JavaScript · React 19 + React Compiler · CSS Modules (no Tailwind)
- **Plan & architecture:** [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)

```bash
npm install
npm run dev
```

| Area | URL |
|---|---|
| Customer site | `/`, `/buses`, `/enquiry/new` |
| Vendor portal | `/vendor` |
| Admin | `/admin` |

Demo data lives in `.data/db.json` (created on first run; delete it to reset).
