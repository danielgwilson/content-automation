import { promises as fs } from "fs";
import { existsSync } from "fs";
import path from "path";
// Puppeteer-extra is a drop-in replacement for puppeteer
// It augments the installed puppeteer with plugin functionality
import puppeteer from "puppeteer-extra";

// Add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

import { Page, Browser, LaunchOptions } from "puppeteer";

import { IContext, IGeneratorOutput } from "../types";
import { getPosts, saveObjectToJson } from "../util";
import { head } from "request";

export default class Manager {
  context: IContext;
  browser: Browser;
  host: string;
  proxy?: string | string[];
  timeout: number;
  private constructor({
    context,
    browser,
    proxy,
    timeout = 0,
  }: {
    context: IContext;
    browser: Browser;
    proxy?: string | string[];
    timeout?: number;
  }) {
    this.context = context;
    this.browser = browser;
    this.host = "https://m.tiktok.com/";
    this.proxy = proxy;
    this.timeout = timeout;
  }

  private getCaption(
    postTitle: string,
    tags: string[],
    { maxLength }: { maxLength?: number } = {}
  ) {
    const caption = `${postTitle} ${tags.join(" ")}`;
    if (maxLength !== undefined && caption.length > maxLength)
      throw new Error(
        `Failed to generate caption; length exceeds maximum length of ${maxLength}.`
      );
    return caption;
  }

  private get getProxy(): string | undefined {
    if (Array.isArray(this.proxy)) {
      return this.proxy.length
        ? this.proxy[Math.floor(Math.random() * this.proxy.length)]
        : "";
    }
    return this.proxy; // -> returns undefined if this.proxy is undefined
  }

  static async init(
    context: IContext,
    {
      executablePath,
    }: {
      executablePath?: string;
    } = {}
  ) {
    const launchOptions: LaunchOptions = {
      ignoreHTTPSErrors: true,
      headless: !context.debug,
      // args: [
      //   "--no-sandbox",
      //   "--disable-setuid-sandbox",
      //   "--disable-dev-shm-usage",
      //   "--disable-accelerated-2d-canvas",
      //   "--no-first-run",
      //   "--no-zygote",
      // ],
      ignoreDefaultArgs: ["--enable-automation"],
    };
    if (executablePath) launchOptions.executablePath = executablePath;

    const browser = await puppeteer.launch(launchOptions);

    return new Manager({ context, browser });
  }

  async close() {
    await this.browser.close();
  }

  async test() {
    console.log("Running tests...");

    // Must create a new page; old pages are not correctly stealthed.
    const page = await this.browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    await page.goto("https://bot.sannysoft.com");
    await page.waitFor(5000);
    await page.screenshot({
      path: `${path.join(this.context.outputDir, "testresult.png")}`,
      fullPage: true,
    });

    // Also consider running test from https://arh.antoinevastel.com/bots/areyouheadless

    console.log(`All done, check the screenshot. ✨`);
  }

  async login(
    credentials: { email: string; password: string },
    { useCookies = true }: { useCookies?: boolean } = {}
  ): Promise<Page> {
    const SELECTORS = {
      phoneOrEmail: "[class*=social-container-] > div:nth-child(1)",
      emailOption: "[class*=tiktok-web-body-] > [class*=title-wrapper-] > a",
      emailField: "[class*=input-field-] > input",
      passwordField: "input[type=password]",
      loginButton: "[class*=login-button-]",
      avatar: ".avatar",
    };

    // Must create a new page; old pages are not correctly stealthed.
    const page = await this.browser.newPage();
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
      await page.goto("https://www.tiktok.com/login", { waitUntil: "load" });

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
        page.url() !==
        "https://www.tiktok.com/trending?loginType=accountPassword"
      ) {
        throw new Error("Failed to login.");
      }

      console.log("Successfully logged in without using cookies.");
    }

    const cookiePath = path.join(this.context.outputDir, "cookies.json");
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

  async uploadVideo({
    targetDir,
    title,
    page,
  }: {
    targetDir: string;
    title?: string;
    page: Page;
  }) {
    const SELECTORS = {
      uploadVideo: ".upload-wrapper > a",
      fileInput: "input[type=file]",
      video: "video",
      uploadButton: "[class*=upload-btn--]",
      postButton: "[class*=btn-post--]:not([class*=disabled])",
      captionField: "[class*=editor--]",
    };

    // TODO: handle multiple posts (maybe? Would you ever upload more than one at a time?)
    const post = getPosts(targetDir, {
      type: "generator",
    })[0] as IGeneratorOutput;
    const videoPath = path.join(targetDir, post.outputName);
    const tags = ["#reddit", "#askreddit", "#redditvids", "#redditstories"];
    const caption =
      title || this.getCaption(post.title, tags, { maxLength: 150 });

    // Click "Upload video" icon
    await page.waitForSelector(SELECTORS.uploadVideo);
    await page.click(SELECTORS.uploadVideo);

    // Specify video file in file input
    // await page.waitForSelector(SELECTORS.fileInput);
    // const fileInputHandle = await page.$(SELECTORS.fileInput); // Must exist because of page.waitForSelector(...)
    // if (!fileInputHandle) throw new Error("Failed to find file input element");
    // await fileInputHandle.uploadFile(filePath);

    // Wait for fileChooser and click "Select video to upload"
    await page.waitForSelector(SELECTORS.fileInput);
    console.log(
      "Waiting for fileChooser and clicking 'Select video to upload'"
    );
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click(SELECTORS.uploadButton),
    ]);
    await waitForRandom(page);
    await fileChooser.accept([videoPath]);
    console.log(`File accepted (${videoPath})`);
    // await page.click(SELECTORS.uploadButton);

    await page.click(SELECTORS.captionField);
    await page.keyboard.type(caption, {
      delay: 50 * Math.random() + 20,
    });
    console.log(`Typed caption: ${caption}`);

    // Click "Post"
    await page.waitForSelector(SELECTORS.postButton, { timeout: 60000 });
    if (!this.context.debug) {
      await page.click(SELECTORS.postButton);
      console.log("Post button clicked—successfully uploaded video");
    } else {
      console.log("Execution finished—paused at completion due to debug flag");
    }

    const uploadedPost = {
      id: post.id,
      dateUploaded: new Date(),
      context: this.context,
      targetDir,
      outputName: post.outputName,
      videoPath,
      caption,
      tags,
    };
    if (this.context.saveOutputToFile) {
      const fileName = `${uploadedPost.id}.upload.json`;
      await saveObjectToJson(uploadedPost, {
        fileName,
        outputDir: targetDir,
      });
      console.log(`Saved output to file named ${fileName}`);
    }
  }

  async followUsers(page: Page, tags: string[]) {
    const SELECTORS = {
      videoCard: ".video-card-mask",
      commentUsername: ".username",
      followButton: ".follow-button",
    };
    const targetCount = 15 + Math.random() * 10;

    if (tags.length <= 0)
      throw new Error("Must include specific tags to follow users.");

    const tag = tags[0];
    await page.goto(`https://www.tiktok.com/${tag}?lang=en`, {
      waitUntil: "load",
    });

    // Wait for and click first video card on tag page
    await page.waitForSelector(SELECTORS.videoCard);
    await page.click(SELECTORS.videoCard);
    await waitForRandom(page);

    // Wait for comments to load and click username of first comment
    await page.waitForSelector(SELECTORS.commentUsername);
    await page.click(SELECTORS.commentUsername);
    await waitForRandom(page);

    // Wait for comments to load and click username of first comment
    await page.waitForSelector(SELECTORS.followButton);
    await page.click(SELECTORS.followButton);
  }
}

async function waitForRandom(
  page: Page,
  options: { min: number; range: number } = { min: 500, range: 2000 }
) {
  const { min, range } = options;
  await page.waitFor(min + Math.random() * range);
}
