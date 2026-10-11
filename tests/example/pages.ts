/**
 * Example pages — Selenium's public test form (base.url in resources/env/dev.json). Template repo
 * only: onboarding deletes tests/example/ and resources/data/web-form-data.json.
 */
import { By, type Locator } from "selenium-webdriver";
import { Select } from "selenium-webdriver/lib/select.js";
import { BasePage } from "../../src/pages/BasePage.js";

export class SubmittedPage extends BasePage {
  protected readonly path = "submitted-form.html";
  private readonly messageText = By.id("message");

  protected override ready(): Locator {
    return this.messageText;
  }

  async message(): Promise<string> {
    return this.text(this.messageText);
  }
}

export class WebFormPage extends BasePage {
  protected readonly path = "web-form.html";
  private readonly textInput = By.name("my-text");
  private readonly options = By.name("my-select");
  private readonly submitButton = By.css("button[type=submit]");

  protected override ready(): Locator {
    return this.submitButton;
  }

  async typeText(value: string): Promise<this> {
    await this.type(this.textInput, value);
    return this;
  }

  async chooseOption(label: string): Promise<this> {
    await new Select(await this.visible(this.options)).selectByVisibleText(label);
    return this;
  }

  async typedText(): Promise<string> {
    return this.value(this.textInput);
  }

  async optionValue(): Promise<string> {
    return this.value(this.options);
  }

  async submit(): Promise<SubmittedPage> {
    await this.click(this.submitButton);
    return new SubmittedPage(this.driver).waitLoaded();
  }
}
