# wallet-app

Monorepo dompet EVM fullstack terintegrasi Telegram Bot

## Struktur Folder

```
wallet-app/
├── apps/
│   ├── frontend/      # React + Tailwind
│   └── backend/       # Express + Prisma
├── packages/
│   ├── ui/            # Komponen shared
│   └── utils/         # web3 helper, formatter
├── .env
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## Teknologi
- Frontend: React.js + Tailwind CSS
- Backend: Express.js + Prisma ORM + ethers.js
- Database: PostgreSQL
- Blockchain: EVM (Ethereum, BNB, Polygon, Base)
- Monorepo: PNPM Workspaces 