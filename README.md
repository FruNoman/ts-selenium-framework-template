# ts-selenium-framework-template (draft)

**TypeScript + selenium-webdriver + Mocha** — a fresh browser per test, page objects with `By`
locators and explicit waits, failure evidence, data from JSON validated by zod, settings in layers,
local browsers or a Selenium Grid, parallel Mocha. Claude Code: the `qa-core` and `qa-ts` plugins of
[qa-automation-toolkit](https://github.com/FruNoman/qa-automation-toolkit) (`docs/ARCHITECTURE.md`).
⚠ A basic skeleton — lab11 makes it real.

```bash
npm ci
npx mocha                                         # everything, parallel (local Chrome)
docker compose -f docker-compose.grid.yml up -d --wait && RUNNER=grid npx mocha
npm run check                                     # tsc + eslint + prettier
```
