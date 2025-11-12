# StockApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.4.

## Development server

1. Copy `.env.example` to `.env` (optional) if you want to customize the mock market simulator.
2. Run `npm run server:start` to boot the API at `http://localhost:4000`.
3. In a separate terminal run `npm start` to serve the Angular client at `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Environment variables

1. Copy `.env.example` to `.env` and override any of the optional knobs:
   - `MOCK_STOCK_COUNT` (default 500) controls how many tickers are generated.
   - `MOCK_HISTORY_LENGTH` (default 240) and `MOCK_INTRADAY_POINTS` (default 78) affect the historical depth and “intraday” slice used for ranges.
   - `MOCK_TOP_PICKS_COUNT` (default 4) sets how many curated ideas `/api/top-picks` returns.
2. The Angular app reads its API base URL from `src/environments/environment*.ts` (dev defaults to `http://localhost:4000`). No secret syncing is necessary because the client only talks to the Node proxy.

## Node stock-detail API

- Run `npm run server:start` to boot the Express API at `http://localhost:4000`. It now simulates hundreds of US-listed equities (and synthetic tickers) entirely in-memory so you can hammer the endpoints without rate limits.
- `GET /api/stocks` returns a paginated list of symbols (use `?q=cloud&limit=100&offset=0` for quick search).
- `GET /api/stocks/:symbol/detail` emits the full `StockDetail` DTO for any symbol in the mock universe, with prices, ranges, history, and insights derived from a random-walk simulator. Pass `?interval=5m` (or `15m`, `1h`, etc.) to downsample the history so your charts can mimic lower-frequency feeds.
- `GET /api/top-picks` surfaces the strongest movers (count configurable via `MOCK_TOP_PICKS_COUNT`) so the Angular client can fetch curated ideas instead of bundling mock data.
- The compiled output lives in `dist-server`; build it with `npm run server:build` and serve with `npm run server:serve`.
- Shared DTOs live in `server/src/models`, so other tools (or codegen scripts) can import `StockDetailDto` without touching Angular internals.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
