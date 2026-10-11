/** Example tests on Selenium's public test form — pages, data from JSON (zod), a fresh browser each. */
import { strict as assert } from "node:assert";
import { z } from "zod";
import { loadData } from "../../src/data/loader.js";
import { WebFormPage } from "./pages.js";

const WebFormData = z.object({
  text: z.string(),
  option: z.string(),
  optionValue: z.string(),
  message: z.string(),
});

describe("web form", () => {
  it("inputs keep what is typed", async () => {
    const webFormData = loadData(WebFormData.passthrough(), "web-form-data.json");
    const webFormPage = await new WebFormPage().open();

    await webFormPage.typeText(webFormData.text);
    await webFormPage.chooseOption(webFormData.option);

    assert.equal(await webFormPage.typedText(), webFormData.text, "typed text");
    assert.equal(await webFormPage.optionValue(), webFormData.optionValue, "the option's value");
  });

  it("submit", async () => {
    const webFormData = loadData(WebFormData.passthrough(), "web-form-data.json");
    const webFormPage = await new WebFormPage().open();

    await webFormPage.typeText(webFormData.text);
    const submittedPage = await webFormPage.submit();

    assert.equal(await submittedPage.message(), webFormData.message, "the confirmation message");
  });
});
