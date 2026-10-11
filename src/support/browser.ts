/**
 * The current test's browser. Mocha runs a file's tests one after another in one worker process,
 * so "the current driver" is safe per process; a fresh one per test (src/support/hooks.ts).
 */
import type { WebDriver } from "selenium-webdriver";

let current: WebDriver | undefined;

export function setDriver(driver: WebDriver | undefined): void {
  current = driver;
}

export function driver(): WebDriver {
  if (!current) throw new Error("No browser: the test runs outside src/support/hooks.ts");
  return current;
}
