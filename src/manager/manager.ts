// import puppeteer from "puppeteer";
// Puppeteer-extra is a drop-in replacement for puppeteer
// It augments the installed puppeteer with plugin functionality
import puppeteer from "puppeteer-extra";

// Add stealth plugin and use defaults (all evasion techniques)
const stealth = require("puppeteer-extra-plugin-stealth")();

// stealth.onBrowser = () => {};
puppeteer.use(stealth);

import { Page, Browser, LaunchOptions } from "puppeteer";

import { IContext, IFollowCriteria, IProxy } from "../types";
import {
  login,
  uploadPost,
  getFreshBlobsFromPath,
  followUsers,
  unfollowUsers,
  testDetection,
} from "./helpers";

export default class Manager {
  context: IContext;
  browser: Browser;
  account: string | undefined;
  product?: "chrome" | "firefox";
  executablePath?: string;
  proxy?: IProxy;
  timeout?: number;
  disableMedia?: boolean;
  private constructor({
    context,
    browser,
    product,
    executablePath,
    proxy,
    timeout = 0,
    disableMedia = false,
  }: {
    context: IContext;
    browser: Browser;
    product?: "chrome" | "firefox";
    executablePath?: string;
    proxy?: IProxy;
    timeout?: number;
    disableMedia?: boolean;
  }) {
    this.context = context;
    this.account = undefined;
    this.browser = browser;
    this.product = product;
    this.executablePath = executablePath;
    this.proxy = proxy;
    this.timeout = timeout;
    this.disableMedia = disableMedia;
  }

  static async init(
    context: IContext,
    {
      executablePath,
      product,
      proxy,
      disableMedia,
    }: {
      executablePath?: string;
      product?: "chrome" | "firefox";
      proxy?: IProxy;
      disableMedia?: boolean;
    } = {}
  ) {
    const args = [
      // "--no-sandbox",
      // "--disable-setuid-sandbox",
      // "--disable-dev-shm-usage",
      // "--disable-accelerated-2d-canvas",
      // "--no-first-run",
      // "--no-zygote",
    ];
    // if (proxy) args.push(`--proxy-server=${proxy.server}`);

    const launchOptions: LaunchOptions = {
      product,
      ignoreHTTPSErrors: true,
      headless: !context.debug,
      // args,
      ignoreDefaultArgs: ["--enable-automation"],
    };
    if (executablePath) launchOptions.executablePath = executablePath;

    const browser = await puppeteer.launch(launchOptions);

    return new Manager({
      context,
      browser,
      product,
      executablePath,
      proxy,
      disableMedia,
    });
  }

  async close() {
    await this.browser.close();
  }

  async test() {
    await testDetection(this);
  }

  async login(
    credentials: { email: string; password: string },
    { useCookies = true }: { useCookies?: boolean } = {}
  ): Promise<Page> {
    const page = await login(this, credentials, { useCookies });
    this.account = credentials.email; // Only update account if successful login
    return page;
  }

  async uploadPost({
    targetDir,
    title,
    page,
  }: {
    targetDir: string;
    title?: string;
    page: Page;
  }) {
    await uploadPost(this, { targetDir, title, page });
  }

  async followUsers(
    page: Page,
    options?: {
      tags?: string[];
      users?: string[];
      followCriteria?: IFollowCriteria;
      numFollows?: number;
    }
  ) {
    await followUsers(this, page, options);
  }

  async unfollowUsers(options?: {
    numUnfollows?: number;
    randomOrder: boolean;
  }) {
    await unfollowUsers(this, options);
  }

  async newPage() {
    const page = await this.browser.newPage();

    // Bypass hairline feature
    await page.evaluateOnNewDocument((args) => {
      /**
       * Hairline feature
       */
      // store the existing descriptor
      const elementDescriptor = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        "offsetHeight"
      );

      // redefine the property with a patched descriptor
      Object.defineProperty(HTMLDivElement.prototype, "offsetHeight", {
        ...elementDescriptor,
        get: function() {
          if (this.id === "modernizr") {
            return 1;
          }
          // @ts-ignore
          return elementDescriptor.get.apply(this);
        },
      });
    });

    // if (this.disableMedia) {
    //   page.setRequestInterception(true);
    //   page.on("request", async (request) => {
    //     if (
    //       request.resourceType() === "fetch" ||
    //       request.resourceType() === "image" ||
    //       request.resourceType() === "media" ||
    //       request.resourceType() === "font"
    //     ) {
    //       request.abort();
    //     } else {
    //       request.continue();
    //     }
    //   });
    // }

    // if (this.proxy)
    //   page.authenticate({
    //     username: this.proxy.username,
    //     password: this.proxy.password,
    //   });
    return page;
  }

  getCountOfRemainingContentItems({ targetDir }: { targetDir: string }) {
    return getFreshBlobsFromPath(targetDir).length;
  }
}
