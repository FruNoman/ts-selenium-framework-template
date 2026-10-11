/** Explicit waits — the only kind (implicit 0). Wait for what *your* action produces, never for time. */
import type { WebDriver } from "selenium-webdriver";
import { settings } from "../config/settings.js";

export async function waitUntil<T>(
  driver: WebDriver,
  condition: () => Promise<T | undefined | null | false>,
  what: string,
  seconds = settings.timeouts.wait,
): Promise<T> {
  const value = await driver.wait(
    async () => {
      try {
        return (await condition()) || undefined;
      } catch {
        return undefined; // stale / not yet there: look again
      }
    },
    seconds * 1000,
    `Timed out after ${seconds}s waiting for ${what}`,
  );
  return value as T;
}
