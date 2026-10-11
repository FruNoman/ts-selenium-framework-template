/**
 * Mocha root hooks (.mocharc.json → require): a fresh browser per test — no cookies, storage or
 * windows leak between tests — quit after it; a failed test leaves its evidence first.
 * ONBOARD: log the browser in as the test's user here, before the test (login-strategies).
 */
import type { Context } from "mocha";
import { createDriver } from "../driver/factory.js";
import { saveArtifacts } from "./artifacts.js";
import { driver, setDriver } from "./browser.js";

export const mochaHooks = {
  async beforeEach(this: Context) {
    setDriver(await createDriver());
  },
  async afterEach(this: Context) {
    const test = this.currentTest;
    try {
      if (test?.state === "failed") {
        await saveArtifacts(driver(), test.fullTitle(), test.err?.message.split("\n")[0] ?? "?");
      }
    } finally {
      await driver().quit();
      setDriver(undefined);
    }
  },
};
