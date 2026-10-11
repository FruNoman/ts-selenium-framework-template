---
name: framework-core
description: The rules of this TypeScript + selenium-webdriver + Mocha framework core (DRAFT — made real on lab11) — a fresh browser per test from Mocha root hooks, page objects with By locators found again on every use and actions returning the next page, explicit waits only (implicit 0), failure evidence, data from JSON validated by zod, settings in layers, local or Grid, parallel Mocha. Use whenever writing or changing pages, tests, test data or config.
---

# Framework core — the rules (ts-selenium, draft)

The invariants come from `qa-core` (`qa-core:test-rules`), the workflow from `qa-core` + `qa-ts`
(its skills' Selenium reference), both enabled in `.claude/settings.json`. ⚠ A basic skeleton:
lab11 fills in what a real app needs (login, API, cleanup, texts, the widget family, soft checks)
and records it here — and decides Mocha vs WebdriverIO (`docs/ARCHITECTURE.md` §10).

## Browser

- `src/support/hooks.ts` (Mocha root hooks): **a fresh browser per test**, quit after it; a failed
  test leaves `build/reports/failures/<test>/` (screenshot, page.html, console, info) first.
- `driver()` is the current test's driver (one test at a time per worker process).
- `src/driver/factory.ts`: local Chrome/Firefox (Selenium Manager fetches the driver) or the Grid
  (`RUNNER=grid`, `GRID_URL`); implicit wait 0 always.

## Pages and waits

`BasePage`: `path`, `ready()`, `open()`, `waitLoaded()`, and `visible(locator)`, `click`, `type`,
`value`, `text` — each finds the element again and waits for it to be visible. Locators are `By`
fields (`By.css("[data-testid=save]")`), never a kept `WebElement`; one async method per user
action — `return this` or the next page, `waitLoaded()`. Waits: `waitUntil(driver, condition,
"what")` — the message is the failure's first line; no sleeps. **Every WebDriver call is
awaited** (eslint `no-floating-promises`).

## Data, settings, runs

- `loadData(Schema, "<file>", "<variant>")` — zod validates; placeholders `{{uniqueTimestamp}}`
  (with `MOCHA_WORKER_ID`), `{{inDays:N}}` (ISO), `{{text:N}}`…
- Settings: `config/application.json` → `application-ci.json` → `resources/env/<env>.json` → env vars
  (`TEST_ENV`, `BASE_URL`, `RUNNER`, `BROWSER`, `HEADLESS`, `GRID_URL`, `TIMEOUT`).
- `npx mocha` (parallel, `.mocharc.json` jobs), one file: `npx mocha tests/x.spec.ts`; Grid:
  `docker compose -f docker-compose.grid.yml up -d --wait && RUNNER=grid npx mocha`; JUnit:
  `build/test-results/junit.xml`. Style and types: `npm run check`.
- Checks: `node:assert/strict` with a message per assertion. ⚠ Soft checks (several per test,
  reported together) — lab11 picks the mechanism.
