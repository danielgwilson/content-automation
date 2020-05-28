import path from "path";
// Puppeteer-extra is a drop-in replacement for puppeteer
// It augments the installed puppeteer with plugin functionality
import puppeteer from "puppeteer-extra";

// Add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

import { Page, Browser, LaunchOptions } from "puppeteer";

import { IContext, IFollowCriteria } from "../types";
import { login, uploadPost, followUsers, unfollowUsers, test } from "./helpers";

export default class Manager {
  context: IContext;
  browser: Browser;
  account: string | undefined;
  executablePath?: string;
  proxy?: string | string[];
  timeout?: number;
  private constructor({
    context,
    browser,
    executablePath,
    proxy,
    timeout = 0,
  }: {
    context: IContext;
    browser: Browser;
    executablePath?: string;
    proxy?: string | string[];
    timeout?: number;
  }) {
    this.context = context;
    this.account = undefined;
    this.browser = browser;
    this.executablePath = executablePath;
    this.proxy = proxy;
    this.timeout = timeout;
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

    return new Manager({ context, browser, executablePath });
  }

  async close() {
    await this.browser.close();
  }

  async test() {
    await test(this);
  }

  private get getProxy(): string | undefined {
    if (Array.isArray(this.proxy)) {
      return this.proxy.length
        ? this.proxy[Math.floor(Math.random() * this.proxy.length)]
        : "";
    }
    return this.proxy; // -> returns undefined if this.proxy is undefined
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
    tags: string[],
    options?: { followCriteria?: IFollowCriteria; numFollows?: number }
  ) {
    await followUsers(this, page, tags, options);
  }

  async unfollowUsers(options?: { numUnfollows?: number }) {
    await unfollowUsers(this, options);
  }
}
