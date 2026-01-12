# StockApp

⚠️ **IMPORTANT LEGAL NOTICE**

**This application is for EDUCATIONAL and PERSONAL USE ONLY.**

- ❌ NOT licensed to provide financial advice
- ❌ NOT for commercial use or resale
- ❌ NOT intended for managing others' investments
- ✅ FOR learning, research, and personal portfolio tracking only

**See [LEGAL-DISCLAIMER.md](LEGAL-DISCLAIMER.md) for complete legal terms.**

By using this app, you acknowledge that we are not financial advisors and this is not financial advice. Always consult with licensed professionals before making investment decisions.

---

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.4.

## Development server

1. In the sibling `stockappserver/` project (kept outside this repo), copy `.env.example` to `.env` and run `npm run dev` to start the Express API at `http://localhost:4000`.
2. In this Angular repo run `npm start` to serve the client at `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Environment variables

1. The simulator/API knobs now live in the separate `stockappserver/.env` file:
   - `MOCK_STOCK_COUNT` (default 500) controls how many tickers are generated.
   - `MOCK_HISTORY_LENGTH` (default 240) and `MOCK_INTRADAY_POINTS` (default 78) affect the historical depth and “intraday” slice used for ranges.
   - `MOCK_TOP_PICKS_COUNT` (default 4) sets how many curated ideas `/api/top-picks` returns.
   - `API_PORT` / `CORS_ALLOW_ORIGIN` configure the server bootstrap + CORS.
2. The Angular app reads its API base URL from `src/environments/environment*.ts` (dev defaults to `http://localhost:4000`). No secret syncing is necessary because the client only talks to the Node proxy.

## Node stock-detail API

The Express server now lives in the standalone `stockappserver/` repository (keep it alongside this `stock-app` folder). Refer to that repo’s README for commands, endpoints, and deployment notes.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
