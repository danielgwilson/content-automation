import { Page } from "playwright";
import path from "path";
import { promises as fs } from "fs";
import { existsSync } from "fs";

import Manager from "../manager";
import { waitForRandom } from "./wait";

import stealth from "../stealth";

export async function login(
  manager: Manager,
  credentials: { email: string; password: string },
  { useCookies = true }: { useCookies?: boolean } = {}
): Promise<Page> {
  const SELECTORS = {
    menuRightLogin: ".menu-right > a",
    phoneOrEmail: "[class*=social-container-] > div:nth-child(1)",
    emailOption: "[class*=title-wrapper-] > a",
    emailField: "[class*=input-field-] > input",
    passwordField: "input[type=password]",
    loginButton: "[class*=login-button-]",
    avatar: ".menu-right > .profile > .avatar",
  };
  const startingUrl = "https://www.tiktok.com/foryou?lang=en";

  // Must create a new page; old pages are not correctly stealthed.
  const context = await manager.browser.newContext();

  // Create new Page object
  const page = await context.newPage();
  await page.setDefaultNavigationTimeout(0);

  // Stealth browser instance
  stealth(manager.browser);

  // Go to starting page (For You)
  await page.goto(startingUrl, { waitUntil: "load" });

  async function loginWithCookies() {
    if (!existsSync(cookiePath))
      throw new Error(`${cookiePath} does not exist.`);
    const cookiesBuffer = await fs.readFile(cookiePath);
    const cookies = JSON.parse(cookiesBuffer.toString());
    await context.addCookies(cookies);

    // console.log(await context.cookies());

    await page.reload({ waitUntil: "load" });
    await waitForRandom(page);

    if ((await page.$(SELECTORS.avatar)) === null)
      throw new Error("Avatar not present on For You page.");
    console.log("Successfully logged in using cookies.");
  }

  async function loginWithoutCookies() {
    await page.setDefaultNavigationTimeout(0);

    // Click on menu right login button to display modal
    // await page.waitForSelector(SELECTORS.menuRightLogin);
    // await waitForRandom(page);
    await page.click(SELECTORS.menuRightLogin);

    const loginFrame = page
      .frames()
      .find((frame) => frame.url().includes("redirect_url"));

    if (!loginFrame) throw new Error("Failed to find login modal iframe");

    // Click on "Phone or Email" login option
    // await page.waitForSelector(SELECTORS.phoneOrEmail);
    // await waitForRandom(page);
    await loginFrame.click(SELECTORS.phoneOrEmail);

    // Click on "Email" login option
    // await page.waitForSelector(SELECTORS.emailOption);
    // await waitForRandom(page);
    await loginFrame.click(SELECTORS.emailOption);

    // Type email into field
    // await waitForRandom(page);
    await loginFrame.type(SELECTORS.emailField, credentials.email, {
      delay: 50 * Math.random() + 20,
    });

    // Type password into field
    // await waitForRandom(page);
    await loginFrame.type(SELECTORS.passwordField, credentials.password, {
      delay: 50 * Math.random() + 20,
    });

    // Click login button
    // await waitForRandom(page);
    await loginFrame.click(SELECTORS.loginButton);
    await waitForRandom(page);
    await page.waitForLoadState("load");

    if (page.url() !== startingUrl) {
      throw new Error("Failed to login; destination URL incorrect.");
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

  const cookies = await context.cookies();
  await fs.writeFile(cookiePath, JSON.stringify(cookies));
  console.log(`Saved cookies to ${cookiePath}`);

  return page;
}
