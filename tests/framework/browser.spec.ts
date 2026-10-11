/** The framework's own wiring — no app needed. A project drops tests/framework once its cases cover it. */
import { strict as assert } from "node:assert";
import { loadSettings } from "../../src/config/settings.js";
import { resolvePlaceholders } from "../../src/data/placeholders.js";
import { driver } from "../../src/support/browser.js";

describe("framework", () => {
  it("a test starts with a fresh browser", async () => {
    await driver().get("about:blank");
    assert.equal((await driver().getAllWindowHandles()).length, 1, "only this test's window");
    await driver().executeScript("window.open('about:blank')"); // left open: the next must not see it
  });

  it("another test starts with a fresh browser too", async () => {
    await driver().get("about:blank");
    assert.equal((await driver().getAllWindowHandles()).length, 1, "no window of another test");
  });

  it("settings layers and placeholders", () => {
    const fromEnv = loadSettings({ BASE_URL: "https://stage.example/", HEADLESS: "false" });

    assert.equal(fromEnv.base.url, "https://stage.example/");
    assert.equal(fromEnv.browser.headless, false);
    assert.equal(loadSettings({ CI: "true" }).timeouts.wait, 20, "the CI layer");
    assert.match(resolvePlaceholders("{{text:6}}"), /^[a-z]{6}$/);
  });
});
