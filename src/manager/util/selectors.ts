import { Page, ElementHandle } from "playwright";

export async function getSelectorText(
  parent: Page | ElementHandle<Element>,
  selector: string
) {
  const element = await parent.$(selector);
  if (!element)
    throw new Error(
      `Failed to query selector ${selector} for element when trying to get element textContent.`
    );
  const text = await element.evaluate(
    (element) => element.textContent,
    element
  );
  if (!text)
    throw new Error("Failed to get textContent for element and selector.");
  return text;
}
