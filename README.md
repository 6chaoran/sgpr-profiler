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
