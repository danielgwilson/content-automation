import path from 'path';
import Manager from '../manager';
import { newStealthContext } from './stealth';

export async function testDetection(manager: Manager) {
  console.log('Running tests...');

  // Must create a new context; create stealthed context instance
  const context = await newStealthContext(manager.browser);

  const urls = [
    'https://bot.sannysoft.com',
    'https://amiunique.org/fp',
    'http://lumtest.com/myip.json',
  ];

  for (let url of urls) {
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'load' });
    await page.screenshot({
      path: `${path.join(
        manager.context.outputDir,
        `${url.split('://')[1].split('/')[0]}.png`
      )}`,
      fullPage: true,
    });
  }

  console.log(`All done, check screenshots. ✨`);
}
