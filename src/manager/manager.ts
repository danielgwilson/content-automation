// Puppeteer-extra is a drop-in replacement for puppeteer
// It augments the installed puppeteer with plugin functionality
import puppeteer from "puppeteer-extra";

// Add stealth plugin and use defaults (all evasion techniques)
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

import { Page } from "puppeteer";

import { IContext } from "../types";

export default class {
  context: IContext;
  constructor(context: IContext) {
    this.context = context;
  }

  async uploadVideo() {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    await page.goto("https://www.tiktok.com/login");
    await waitForRandom(page);
  }
}

async function waitForRandom(page: Page) {
  await page.waitFor(2000 + Math.random() * 3000);
}
