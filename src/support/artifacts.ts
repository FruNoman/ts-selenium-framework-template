/** Evidence of a failed test: <artifacts.dir>/<test>/screenshot.png, page.html, console.log, info.txt. */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { WebDriver } from "selenium-webdriver";
import { ROOT, settings } from "../config/settings.js";

export async function saveArtifacts(
  driver: WebDriver,
  title: string,
  failure: string,
): Promise<string> {
  const folder = resolve(ROOT, settings.artifacts.dir, title.replace(/[^\w.[\]-]+/g, "_"));
  mkdirSync(folder, { recursive: true });
  const attempt = async (what: string, action: () => Promise<void>) => {
    try {
      await action();
    } catch (error) {
      console.warn(`failure artifact ${what} not saved: ${String(error)}`);
    }
  };
  await attempt("screenshot", async () =>
    writeFileSync(resolve(folder, "screenshot.png"), await driver.takeScreenshot(), "base64"),
  );
  await attempt("page.html", async () =>
    writeFileSync(resolve(folder, "page.html"), await driver.getPageSource()),
  );
  await attempt("console.log", async () => {
    const entries = await driver.manage().logs().get("browser");
    writeFileSync(
      resolve(folder, "console.log"),
      entries.map((e) => `${e.level.name} ${e.message}`).join("\n") || "(empty)",
    );
  });
  const info = [`test:     ${title}`, `failure:  ${failure}`];
  await attempt("url", async () => {
    info.push(`url:      ${await driver.getCurrentUrl()}`);
  });
  writeFileSync(resolve(folder, "info.txt"), info.join("\n") + "\n");
  return folder;
}
