# Kyzen • Team — ClashFlex sync starter

This repository scaffold is intentionally a **diagnostic first step**, not a finished synchronizer.

## Fixed requirements

- Clan: `Kyzen • Team` (`#2CG8JCYCP`).
- Primary source: ClashFlex public war pages.
- Do not request, create, or depend on a new Supercell API token.
- Do not rewrite historical CSV files.
- Do not modify the existing clan dashboard/site preview.
- ClashKing may only be used later as a secondary cross-check, never as a replacement for ClashFlex.
- Do not claim attack-level collection works until a real ClashFlex probe artifact has been inspected.

## What is included

- `src/probe-clashflex.js`: opens the ClashFlex war page with Playwright, records HTML and eligible network responses, and saves a screenshot.
- `.github/workflows/clashflex-probe.yml`: manually-triggered GitHub Actions workflow. It uploads the probe as an artifact.
- `test/smoke.test.js`: basic project integrity checks.

The probe does not log in, call Supercell, send data to Google Sheets, or alter any clan data.

## Run locally

Requires Node.js 20+.

```bash
npm install
npx playwright install chromium
npm test
npm run probe
```

Output is written to `artifacts/clashflex-probe.json` and `artifacts/clashflex-page.png`.

## Run in GitHub Actions

Open the repository's **Actions** tab, select **ClashFlex diagnostic probe**, and choose **Run workflow**. Download the resulting `clashflex-probe` artifact.

## Next implementation gate

Before building a parser or enabling a schedule, inspect the artifact and establish:

1. Which page or war identifier represents Kyzen Team's active war.
2. Whether attack records expose attacker, defender/base, stars, destruction, and attack order.
3. Whether CWL round pages expose equivalent records.
4. Whether the records remain available during the active war and after it ends.
5. Whether requests are public and stable without authentication or bypassing access controls.

Only after those checks should Codex implement a parser with fixtures based on the captured response format, tests for normal wars and CWL, and deduplication keys. The parser must preserve raw source evidence and must not silently invent missing fields.

## Codex task brief

Ask Codex to work in this repository and:

- Read this README and inspect the complete probe artifact before implementing.
- Keep ClashFlex as the primary source.
- Do not introduce a Supercell token, unofficial authentication, CAPTCHA bypass, or paid infrastructure.
- Build fixture-based tests for every parsed field.
- Implement idempotent storage for new wars only; leave historical CSV files untouched.
- Add a Google Sheets adapter only if a real Web App URL is supplied as a GitHub Actions secret. Never invent a URL.
- Keep the workflow manual until parsing and data validation pass.
- Report precisely what was tested and what remains unverified.

If the probe artifact does not contain complete attack-level data, stop and explain the limitation rather than fabricating a working integration.
