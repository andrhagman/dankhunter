# Dankhunter

Dankhunter is a compact website for tracking game seasons, wipes, expansions, and upcoming PC game releases.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

This repo is configured for GitHub Pages as a project site at `/dankhunter/`.

1. Push the repo to GitHub with the repository name `dankhunter`.
2. In GitHub, open `Settings -> Pages`.
3. Set `Source` to `GitHub Actions`.
4. Push to `main`; `.github/workflows/deploy.yml` will build and publish `dist`.

## Data

Shared TypeScript data types live in `src/data.ts`. Season calendar data lives in `src/data/season-calendar.json`. PC release data lives in `src/data/pc-releases.json` and is generated from IGDB's structured `release_dates` API.

- `confirmed`: a named date or live event from an official or tracker source.
- `window`: a published release window with no exact date.
- `estimated`: a community or historical-cycle estimate.

Date-sensitive entries should be reviewed before publishing.

## Scheduled data updates

`.github/workflows/update-releases.yml` runs every night at `03:23 UTC` and can also be started manually from GitHub Actions.

The workflow requires these repository secrets:

- `IGDB_CLIENT_ID`
- `IGDB_CLIENT_SECRET`

Create them from a Twitch Developer application, since IGDB authentication uses Twitch app access tokens.

The workflow:

1. Runs `npm run update:releases`.
2. Runs `npm run update:seasons`.
3. Writes `src/data/pc-releases.json` and checks `src/data/season-calendar.json` sources.
4. Builds the site.
5. Commits the JSON only when tracked data changed.
6. Publishes the updated `dist` folder to GitHub Pages.

The schedule is intentionally once per day and offset from the top of the hour to stay well within normal GitHub Actions free-tier usage.
