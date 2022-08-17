import playwright, {
  ChromiumBrowser,
  FirefoxBrowser,
  WebKitBrowser,
} from "playwright";
import { IProxy } from "../../types";

export class HeadlessBrowser {
  private _browser: ChromiumBrowser | FirefoxBrowser | WebKitBrowser;
  library: "playwright" | "puppeteer";
  browserType: "chromium" | "firefox" | "webkit";
  executablePath?: string;
  proxy?: IProxy;
  timeout?: number;
  disableMedia?: boolean;
  constructor({
    _browser,
    library,
    browserType,
    executablePath,
    proxy,
    timeout,
    disableMedia = false,
  }: {
    _browser: ChromiumBrowser | FirefoxBrowser | WebKitBrowser;
    library: "playwright" | "puppeteer";
    browserType: "chromium" | "firefox" | "webkit";
    executablePath?: string;
    proxy?: IProxy;
    timeout?: number;
    disableMedia?: boolean;
  }) {
    this._browser = _browser;
    this.library = library;
    this.browserType = browserType;
    this.executablePath = executablePath;
    this.proxy = proxy;
    this.timeout = timeout;
    this.disableMedia = disableMedia;
  }

  static async init({
    library,
    browserType,
    executablePath,
    proxy,
    timeout,
    disableMedia = false,
  }: {
    library: "playwright" | "puppeteer";
    browserType: "chromium" | "firefox" | "webkit";
    executablePath?: string;
    proxy?: IProxy;
    timeout?: number;
    disableMedia?: boolean;
  }) {
    let _browser: ChromiumBrowser | FirefoxBrowser | WebKitBrowser;
    if (library === "playwright") {
      _browser = await playwright[browserType].launch();
    } else {
      throw new Error(`Invalid library; please select one of { "playwright" }`);
    }

    return new HeadlessBrowser({
      _browser,
      library,
      browserType,
      executablePath,
      proxy,
      timeout,
      disableMedia,
    });
  }

  newPage() {
    return;
  }
}
