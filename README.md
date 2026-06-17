# Dankhunter

Dankhunter is a compact website for tracking ARPG seasons, expansions, and upcoming PC game releases.

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

The initial dataset lives in `src/data.ts`. Each item stores a source URL and a confidence label:

- `confirmed`: a named date or live event from an official or tracker source.
- `window`: a published release window with no exact date.
- `estimated`: a community or historical-cycle estimate.

Date-sensitive entries should be reviewed before publishing.
