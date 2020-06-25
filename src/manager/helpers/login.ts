import { Page } from "puppeteer";
import path from "path";
import { promises as fs } from "fs";
import { existsSync } from "fs";

import Manager from "../manager";
import { waitForRandom } from "./wait";

export async function login(
  manager: Manager,
  credentials: { email: string; password: string },
  { useCookies = true }: { useCookies?: boolean } = {}
): Promise<Page> {
  const SELECTORS = {
    menuRightLogin: ".menu-right > a",
    phoneOrEmail: "[class*=social-container-] > div:nth-child(1)",
    emailOption: "[class*=tiktok-web-body-] > [class*=title-wrapper-] > a",
    emailField: "[class*=input-field-] > input",
    passwordField: "input[type=password]",
    loginButton: "[class*=login-button-]",
    avatar: ".avatar",
  };

  // Must create a new page; old pages are not correctly stealthed.
  const page = await manager.newPage();
  await page.setDefaultNavigationTimeout(0);

  async function loginWithCookies() {
    if (!existsSync(cookiePath))
      throw new Error(`${cookiePath} does not exist.`);
    const cookiesBuffer = await fs.readFile(cookiePath);
    const cookies = JSON.parse(cookiesBuffer.toString());
    await page.setCookie(...cookies);
    await page.goto("https://www.tiktok.com/trending", {
      waitUntil: "load",
    });
    if ((await page.$(SELECTORS.avatar)) === null)
      throw new Error("Avatar not present on Trending page.");
    console.log("Successfully logged in using cookies.");
  }

  async function loginWithoutCookies() {
    // Go to login page
    await page.goto("https://www.tiktok.com/trending", { waitUntil: "load" });

    // Click on menu right login button to display modal
    await page.waitForSelector(SELECTORS.menuRightLogin);
    await waitForRandom(page);
    await page.click(SELECTORS.menuRightLogin);

    // Click on "Phone or Email" login option
    await page.waitForSelector(SELECTORS.phoneOrEmail);
    await waitForRandom(page);
    await page.click(SELECTORS.phoneOrEmail);

    // Click on "Email" login option
    await page.waitForSelector(SELECTORS.emailOption);
    await waitForRandom(page);
    await page.click(SELECTORS.emailOption);

    // Type email into field
    await waitForRandom(page);
    await page.type(SELECTORS.emailField, credentials.email, {
      delay: 50 * Math.random() + 20,
    });

    // Type password into field
    await waitForRandom(page);
    await page.type(SELECTORS.passwordField, credentials.password, {
      delay: 50 * Math.random() + 20,
    });

    // Click login button
    await waitForRandom(page);
    await page.click(SELECTORS.loginButton);
    await page.waitForNavigation();

    if (
      page.url() !== "https://www.tiktok.com/trending?loginType=accountPassword"
    ) {
      throw new Error("Failed to login.");
    }

    console.log("Successfully logged in without using cookies.");
  }

  const cookiePath = path.join(manager.context.outputDir, "cookies.json");
  if (useCookies) {
    try {
      await loginWithCookies();
    } catch (e) {
      console.log(`Failed to reuse cookies from ${cookiePath}; ${e}`);

      await loginWithoutCookies();
    }
  } else {
    await loginWithoutCookies();
  }

  const cookies = await page.cookies();
  await fs.writeFile(cookiePath, JSON.stringify(cookies));
  console.log(`Saved cookies to ${cookiePath}`);

  return page;
}
