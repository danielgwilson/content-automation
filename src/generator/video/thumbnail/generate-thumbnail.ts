import path from "path";
import puppeteer from "puppeteer";
import { IContext } from "../../../types";

export async function generateThumbnail(
  title: string,
  { outputDir, resourceDir }: IContext
) {
  const templateName = "thumbnail.html";
  const templatePath = path.resolve(
    path.join(resourceDir, "/thumbnail/", templateName)
  );
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1280,
    height: 720
  });
  console.log(templatePath);
  await page.goto(`file:///${templatePath}`, {
    waitUntil: "networkidle0"
  });

  // Update page contents to match new title
  await page.evaluate(title => {
    const el = document.querySelector(".title");
    el!.innerHTML = title;
    ($ as any)(".container").textfill({ maxFontPixels: 200 });
  }, title);

  const outputName = "thumbnail.png";
  const outputPath = path.join(outputDir, outputName);
  await page.screenshot({ path: outputPath });

  // Cleanup
  await browser.close();

  return { filePath: outputPath };
}
