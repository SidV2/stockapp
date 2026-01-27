# StockApp

**IMPORTANT: This application is for EDUCATIONAL and PERSONAL USE ONLY.**

See [LEGAL-DISCLAIMER.md](LEGAL-DISCLAIMER.md) for complete legal terms.

---

## Quick Start

You need **3 terminals** running:

### Terminal 1: Backend Server
```bash
cd ../stockappserver
npm run dev
```
Runs at http://localhost:4000

### Terminal 2: Angular App
```bash
npm start
```
Runs at http://localhost:4200

### Terminal 3: AI Proxy Server (optional, for OpenAI analysis)
```bash
npm run proxy
```
Runs at http://localhost:3001

## Build

```bash
npm run build
```

Build artifacts stored in `dist/`.

## Environment

- Backend config: `stockappserver/.env`
- Frontend API URL: `src/environments/environment.ts`
- OpenAI key: `.env` (gitignored)
