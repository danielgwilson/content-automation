import playwright, { Browser } from 'playwright';

/**
 * Adds stealth scripts to playwright Browser contexts
 * @param browser Playwright Browser object
 */
export async function newStealthContext(browser: Browser) {
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    geolocation: { latitude: 40.0583, longitude: 74.4057 },
    viewport: playwright.devices['Pixel 2'].viewport,
  });
  await context.addInitScript(() => {
    // Delete webdriver
    delete Object.getPrototypeOf(navigator).webdriver;

    // Fake webGL vendor + renderer
    try {
      // Remove traces of our Proxy ;-)
      // @ts-ignore
      var stripErrorStack = (stack) =>
        stack
          .split('\n')
          // @ts-ignore
          .filter((line) => !line.includes(`at Object.apply`))
          // @ts-ignore
          .filter((line) => !line.includes(`at Object.get`))
          .join('\n');

      const getParameterProxyHandler = {
        // @ts-ignore
        get(target, key) {
          try {
            // Mitigate Chromium bug (#130)
            if (typeof target[key] === 'function') {
              return target[key].bind(target);
            }
            return Reflect.get(target, key);
          } catch (err) {
            // err.stack = stripErrorStack(err.stack);
            throw err;
          }
        },
        // @ts-ignore
        apply: function(target, thisArg, args) {
          const param = (args || [])[0];
          // UNMASKED_VENDOR_WEBGL
          if (param === 37445) {
            return 'Intel Inc.';
          }
          // UNMASKED_RENDERER_WEBGL
          if (param === 37446) {
            return 'Intel Iris OpenGL Engine';
          }
          try {
            return Reflect.apply(target, thisArg, args);
          } catch (err) {
            // err.stack = stripErrorStack(err.stack);
            throw err;
          }
        },
      };

      const proxy = new Proxy(
        WebGLRenderingContext.prototype.getParameter,
        getParameterProxyHandler
      );
      // To find out the original values here: Object.getOwnPropertyDescriptors(WebGLRenderingContext.prototype.getParameter)
      Object.defineProperty(WebGLRenderingContext.prototype, 'getParameter', {
        configurable: true,
        enumerable: false,
        writable: false,
        value: proxy,
      });
    } catch (err) {
      console.warn(err);
    }
  });

  return context;
}
