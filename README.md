# CitiTour (web app)

Angular app for CitiTour: day-by-day trip plans built from real places, shareable trip pages, a business listing portal and an admin page. The API lives in [Cititour-BEFNL](https://github.com/riiken/Cititour-BEFNL).

## Run locally

Needs Node 24.15+ (or 22.22.3+), as Angular 22 requires. With nvm: `nvm use` (reads `.nvmrc`).

```bash
npm install
npm start            # http://localhost:4200 (expects the API on http://localhost:5000)
```

Start the API first (see the backend README / `npm run dev`).

## Test & build

```bash
npx ng test --watch=false --browsers=ChromeHeadless
npx ng build --configuration production   # output: dist/citi-tour
```

`src/app/environment.ts` is used in development and replaced by `src/app/environment.prod.ts` in production builds (API URL, AdSense IDs).

## Deploy

Render static site via `render.yaml`. Full steps (database, API, web app, revenue settings): [DEPLOY.md in the backend repo](https://github.com/riiken/Cititour-BEFNL/blob/master/DEPLOY.md).

## Main routes

| Route | What |
|---|---|
| `/plan-trip` | Trip form → creates a plan |
| `/trip/:id` | Shareable trip page (save, edit, share, book) |
| `/my-trips` | Saved trips |
| `/list-your-business`, `/partner` | Business owner portal |
| `/place/:id` | Public business page |
| `/admin` | Listing moderation and overview (admins only) |
