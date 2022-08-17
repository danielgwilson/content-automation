import playwright, { Browser, Page } from "playwright";

import { IContext, IFollowCriteria, IProxy, ICredentials } from "../types";
import {
  login,
  uploadPost,
  getFreshBlobsFromPath,
  followUsers,
  unfollowUsers,
  testDetection,
} from "./helpers";
import { getProxy } from "../util";

export default class Manager {
  context: IContext;
  account: string | undefined;
  browser: Browser;
  browserType: "chromium" | "firefox" | "webkit";
  executablePath?: string;
  proxy?: IProxy;
  timeout?: number;
  disableMedia?: boolean;
  private constructor({
    context,
    browser,
    browserType,
    executablePath,
    proxy,
    timeout,
    disableMedia = false,
  }: {
    context: IContext;
    browser: Browser;
    browserType: "chromium" | "firefox" | "webkit";
    executablePath?: string;
    proxy?: IProxy;
    timeout?: number;
    disableMedia?: boolean;
  }) {
    this.context = context;
    this.account = undefined;
    this.browser = browser;
    this.browserType = browserType;
    this.executablePath = executablePath;
    this.proxy = proxy;
    this.timeout = timeout;
    this.disableMedia = disableMedia;
  }

  static async init(
    context: IContext,
    {
      browserType = "chromium",
      executablePath,
      disableMedia,
    }: {
      browserType?: "chromium" | "firefox" | "webkit";
      executablePath?: string;
      disableMedia?: boolean;
    } = {}
  ) {
    const { outputDir } = context;
    console.log(`Initializing Manager with browserType: ${browserType}`);

    // hadn't paid for this in a bit due to COGS of video downloads
    // Careful of shadowban risk; suspect data center IP caused shadowban (2020-08-06)
    const proxy = getProxy(outputDir);
    if (proxy) {
      console.log(`Using proxy: ${proxy.username}`);
    } else {
      console.log(
        `No proxy.json definition found; initializing without proxy.`
      );
    }

    const browser = await playwright[browserType].launch({
      headless: !context.debug,
      proxy,
    });

    return new Manager({
      context,
      browser,
      browserType,
      executablePath,
      proxy,
      timeout: context.debug ? 0 : 30000,
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
    credentials: ICredentials,
    { useCookies = true }: { useCookies?: boolean } = {}
  ): Promise<Page> {
    const page = await login(this, credentials, { useCookies });
    this.account = credentials.username; // Only update account if successful login
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

  getRemainingContentItems({ targetDir }: { targetDir: string }) {
    return getFreshBlobsFromPath(targetDir);
  }
}
