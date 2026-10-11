/**
 * Pages: the test talks to a page, never to its elements. Locators are `By` fields; elements are
 * found again on every use (never a WebElement kept); one async method per user action — `return
 * this` or the next page (loaded); explicit waits for what the action produces.
 */
import { By, until, type Locator, type WebDriver, type WebElement } from "selenium-webdriver";
import { settings } from "../config/settings.js";
import { driver as currentDriver } from "../support/browser.js";
import { waitUntil } from "../support/waits.js";

export abstract class BasePage {
  protected abstract readonly path: string;

  constructor(protected readonly driver: WebDriver = currentDriver()) {}

  url(): string {
    return settings.base.url + this.path;
  }

  /** what shows once the page is usable — override when the URL isn't enough */
  protected ready(): Locator | undefined {
    return undefined;
  }

  async open(): Promise<this> {
    await this.driver.get(this.url());
    return this.waitLoaded();
  }

  async waitLoaded(): Promise<this> {
    await this.driver.wait(until.urlContains(this.url()), settings.timeouts.wait * 1000);
    const ready = this.ready();
    if (ready) await this.visible(ready);
    return this;
  }

  /** the element, once it is visible (`what` names it in a timeout) */
  protected async visible(locator: Locator, what = "the element"): Promise<WebElement> {
    return waitUntil(
      this.driver,
      async () => {
        const element = await this.driver.findElement(locator);
        return (await element.isDisplayed()) ? element : undefined;
      },
      `${what} visible`,
    );
  }

  protected async click(locator: Locator): Promise<void> {
    await (await this.visible(locator)).click();
  }

  protected async type(locator: Locator, text: string): Promise<void> {
    const element = await this.visible(locator);
    await element.clear();
    await element.sendKeys(text);
  }

  protected async value(locator: Locator): Promise<string> {
    return (await (await this.visible(locator)).getAttribute("value")) ?? "";
  }

  protected async text(locator: Locator): Promise<string> {
    return (await (await this.visible(locator)).getText()).trim();
  }
}

export { By };
