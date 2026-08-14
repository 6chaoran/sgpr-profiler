# SGPR Profiler

A Nuxt application for browsing Singapore permanent-residency application records.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Firebase Realtime Database

The recent-records list listens to the `pr_records` node in the SGPR Firebase
Realtime Database. Override the node when needed:

```bash
NUXT_PUBLIC_FIREBASE_DATABASE_PATH=your/path npm run dev
```

The listener displays the 50 most recently updated records and updates the page
whenever that data changes.

## Production

Generate the static Firebase Hosting release and verify its entry page:

```bash
npm run generate
npm run verify:release
```

The GitHub Actions workflows deploy `.output/public` to Firebase Hosting. After
Firebase reports a deployment, the workflows request the deployed URL and verify
that the response contains the application title.

Locally preview the generated site:

```bash
npx serve .output/public
```
