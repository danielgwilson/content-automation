import path from "path";
import playwright, { Page } from "playwright";
import { IContext } from "../../../types";

export async function renderThumbnail(title: string, context: IContext) {
  const { outputDir, debug } = context;
  const { page, browser } = await getTemplatePage(context);

  await updatePage(page, { title });

  const outputName = "thumbnail.png";
  const outputPath = path.join(outputDir, outputName);
  await page.screenshot({ path: outputPath, omitBackground: true });

  // Cleanup
  if (!debug) await browser.close();

  return { filePath: outputPath };
}

async function getTemplatePage({ resourceDir, debug }: IContext) {
  const templateName = "thumbnail.html";
  const templatePath = path.resolve(
    path.join(resourceDir, "/thumbnail/", templateName)
  );
  const browser = await playwright.chromium.launch({ headless: !debug });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({
    width: 1280,
    height: 720,
  });
  await page.goto(`file:///${templatePath}`, {
    waitUntil: "networkidle",
  });

  return { page, browser };
}

async function updatePage(page: Page, options: { title: string }) {
  const { title } = options;

  // Update page contents to match new title
  await page.evaluate((title) => {
    // @ts-ignore as thumbnail is an object added by the template page's JS
    thumbnail.setTitle(title);
    // @ts-ignore
    thumbnail.setSubreddit("r/AskReddit");
  }, title);
}
