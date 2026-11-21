# SAVENEER AI — Village Water Intelligence for Sustainable Farming

SAVENEER AI is a village-scale water and farm decision-support prototype. It helps farmers, FPO coordinators and watershed teams compare indicative crop-water demand, supply assumptions and adaptation scenarios before seasonal decisions. It is a planning aid—not a water-allocation authority, validated agronomic model or substitute for local expert review.

**Live application:** https://saveneer-ai-mpr4cy.v2.appdeploy.ai/  
**Release described in source documentation:** 2.0 Resilience Engine

## Features

- Farm profiles and village crop-water budgeting from recorded scenarios.
- Supply-stress scenarios and a bounded crop-mix intervention comparison.
- Farm vulnerability screening and a sensitivity envelope for modelled demand/supply changes.
- Pump-minute planning based on user-entered pump flow and time constraints.
- WaterProof evidence records with server-side SHA-256 fingerprint and previous-entry checks. Hash integrity does not prove that a physical observation is true or independently verified.
- Optional AI explanations through OpenRouter, called from the backend using a server-side secret.
- Live weather context from Open-Meteo, labelled as forecast/model output rather than a local rain-gauge measurement.

The detailed methodology, limitations, provenance notes, release checklist and validation plan are in [`docs/SAVENEER_AI_2_0_PUBLISHING_GUIDE.md`](docs/SAVENEER_AI_2_0_PUBLISHING_GUIDE.md).

## Architecture

The frontend is a React/TypeScript single-page application built with Vite and styled with Tailwind CSS. The API backend uses AppDeploy's server SDK (`@appdeploy/sdk`) for routing and persistence. Its route handlers provide health, saved farm/scenario/pump/evidence records, forecast context, AI key status and AI advice. Realtime subscription cleanup is split across `backend/realtime.ts` and `backend/realtime-subscribers.ts`.

At a high level:

```text
React UI → AppDeploy API routes → AppDeploy database
                     ├── Open-Meteo forecast API
                     └── OpenRouter chat API (optional; backend secret)
```

The app's deterministic planning logic is distinct from AI-generated explanations. The included `tests/tests.json` contains the original project test specification; it is not wired to an npm test script in this source snapshot.

## Technology stack

- React 19, TypeScript, Vite, and `lucide-react`
- Tailwind CSS, PostCSS, and Autoprefixer
- AppDeploy backend SDK and managed database/realtime integration
- Open-Meteo forecast API
- OpenRouter chat completions for optional AI assistance

## Source layout

```text
backend/       API handlers and realtime subscription cleanup
src/           React application, styles, and resilience optimizer
 docs/         Publishing, methodology, limitations, and validation guide
 tests/        Original test specification JSON
index.html     Vite HTML entry point
package.json   npm scripts and frontend dependencies
vite.config.ts Vite build configuration
```

Other root configuration files include `tsconfig.json`, `tailwind.config.js`, and `postcss.config.js`.

## Requirements

- Node.js 20.19+ (or a compatible newer release) and npm. Vite 8 requires a modern Node runtime.
- An AppDeploy project/runtime to deploy and execute backend routes. The backend imports `@appdeploy/sdk`; it is supplied by the AppDeploy runtime and is not declared as a standalone local dependency in the original `package.json`.

## Install and run the frontend

```bash
npm install
npm run dev
```

Vite prints a local development URL. Frontend API calls that need persistence, realtime behavior, or backend-only features require the corresponding AppDeploy backend/runtime; a frontend dev server alone does not provide those services.

Create a production frontend build with:

```bash
npm run build
npm run preview
```

The build output is `dist/` unless `APPDEPLOY_VITE_OUT_DIR` overrides it. AppDeploy-specific deployment and release notes are maintained in the publishing guide.

## Configuration and secrets

The AI routes use `OPENROUTER_API_KEY` as a **backend-only** environment secret. For AppDeploy, configure it in the project's secure app settings; do not put it in frontend code, commit an actual `.env`, or expose it to the browser. `.env.example` contains only a placeholder for local reference and is not a usable credential. Weather retrieval uses the public Open-Meteo forecast endpoint and does not require an API key.

Do not commit credentials, private keys, passwords, tokens, or real environment files. If a secret has ever been committed or exposed, revoke/rotate it.

## Data and responsible-use limitations

The publishing guide documents that demo records are synthetic, user-provided values are not independently verified, crop demand is an uncalibrated prototype estimate, the village supply value is an assumption, forecasts are not measurements, pump-flow values require calibration, and AI output may be wrong or unavailable. No live groundwater/sensor feed or independently validated water savings are claimed. Validate inputs and decisions with farmers and local agricultural/watershed experts before acting.

## Verification

The project has these scripts in its original `package.json`:

- `npm run dev` — start the Vite development server
- `npm run build` — build the frontend
- `npm run preview` — serve the built frontend locally

There is no `npm test` script in the supplied source snapshot. The included test specification is preserved at `tests/tests.json`.

## License

See [`LICENSE`](LICENSE).
