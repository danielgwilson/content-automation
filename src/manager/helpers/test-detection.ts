import path from "path";
import Manager from "../manager";
import stealth from "../stealth";

export async function testDetection(manager: Manager) {
  console.log("Running tests...");

  // Must create a new page; old pages are not correctly stealthed.
  // Must create a new page; old pages are not correctly stealthed.
  const context = await manager.browser.newContext();

  // Add stealth scripts
  // await addStealth(manager.browser);

  const page = await context.newPage();
  await page.setDefaultNavigationTimeout(0);

  // Stealth browser instance
  stealth(manager.browser);

  await page.goto("https://bot.sannysoft.com", { waitUntil: "load" });
  await page.screenshot({
    path: `${path.join(manager.context.outputDir, "testresult.png")}`,
    fullPage: true,
  });

  // await page.goto("http://lumtest.com/myip.json", { waitUntil: "load" });
  // await page.screenshot({
  //   path: `${path.join(manager.context.outputDir, "ipresult.png")}`,
  //   fullPage: true,
  // });

  // Also consider running test from https://arh.antoinevastel.com/bots/areyouheadless

  console.log(`All done, check the screenshot. ✨`);
}
