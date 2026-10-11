/** A WebDriver for one test: local Chrome/Firefox (Selenium Manager fetches the driver) or the Grid. */
import { Builder, type WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import firefox from "selenium-webdriver/firefox.js";
import { settings } from "../config/settings.js";

export async function createDriver(): Promise<WebDriver> {
  const [width, height] = settings.browser.window;
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments(`--window-size=${width},${height}`);
  const firefoxOptions = new firefox.Options();
  firefoxOptions.addArguments(`--width=${width}`, `--height=${height}`);
  if (settings.browser.headless) {
    chromeOptions.addArguments("--headless=new");
    firefoxOptions.addArguments("-headless");
  }
  chromeOptions.setLoggingPrefs({ browser: "ALL" });
  const builder = new Builder()
    .forBrowser(settings.browser.name)
    .setChromeOptions(chromeOptions)
    .setFirefoxOptions(firefoxOptions);
  if (settings.runner === "grid") builder.usingServer(settings.grid.url);
  const driver = await builder.build();
  // explicit waits only: the implicit wait stays 0, so an absence check is instant
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: settings.timeouts.pageLoad * 1000 });
  return driver;
}
