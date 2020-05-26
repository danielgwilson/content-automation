import { Page } from "puppeteer";

export async function waitForRandom(
  page: Page,
  options: { min: number; range: number } = { min: 500, range: 2000 }
) {
  const { min, range } = options;
  await page.waitFor(min + Math.random() * range);
}
