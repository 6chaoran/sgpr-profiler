# Repository Guidelines

## Project Structure & Module Organization

This repository contains a Nuxt 4 and Vue 3 application. Application code lives under `app/`: route-level views are in `app/pages/`, shared UI in `app/components/`, layouts in `app/layouts/`, and client integrations in `app/plugins/`. Global styles are defined in `app/assets/css/main.css`; files that must be served unchanged belong in `public/`. Root configuration includes `nuxt.config.ts`, `tsconfig.json`, `eslint.config.mjs`, and Firebase deployment files. GitHub Actions workflows in `.github/workflows/` build and deploy production and pull-request previews.

## Build, Test, and Development Commands

Use Node.js 20, matching CI, and npm because `package-lock.json` is committed.

- `npm ci` installs the exact locked dependencies.
- `npm run dev` starts the local development server at `http://localhost:3000`.
- `npm run build` creates a production server build.
- `npm run generate` generates the static site in `.output/public` for Firebase Hosting.
- `npm run preview` previews a production build locally.
- `npm run verify:release` confirms that the generated entry page exists.
- `npx eslint .` runs the Nuxt ESLint configuration across the repository.

## Coding Style & Naming Conventions

Write new application code in TypeScript and use Vue Single-File Components with `<script setup>`. Follow the existing two-space indentation and omit semicolons. Name components in PascalCase (`SearchModal.vue`), routes in lowercase (`index.vue`), and composables or variables in camelCase. Keep shared styling in `main.css`; use clear, component-scoped class names when extending existing UI. Prefer Nuxt auto-imports for framework helpers such as `ref`, `computed`, and `useRuntimeConfig`.

## Testing Guidelines

No unit-test framework or coverage threshold is currently configured. Before submitting changes, run `npx eslint .`, `npm run generate`, and `npm run verify:release`. Manually check affected responsive UI and Firebase fallback behavior. If adding tests, place them beside the feature as `*.spec.ts` and add the corresponding npm script and framework configuration.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries such as `Improve profiler functionality and coverage`. Keep each commit focused and explain the user-visible outcome. Pull requests should include a concise description, validation commands, linked issue when applicable, and before/after screenshots for visual changes. Ensure the Firebase preview workflow passes before requesting review.

## GitHub CLI Authentication

The GitHub CLI token is stored in macOS Keychain and may be unavailable inside the default Codex sandbox. If `gh auth status` fails in the sandbox, rerun it with elevated permissions before concluding that authentication is invalid. Do not ask the user to run `gh auth login` unless the elevated check also fails.

## Configuration & Security

Override the database node with `NUXT_PUBLIC_FIREBASE_DATABASE_PATH=your/path npm run dev`. Never commit Firebase service-account credentials or other secrets; deployment credentials belong in GitHub Actions secrets.
