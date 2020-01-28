import config from "config";
import Scraper from "./scraper/scraper";
import Generator from "./generator/generator";

(async () => {
  const scraper = new Scraper({
    userAgent: config.get("REDDIT_USER_AGENT"),
    clientId: config.get("REDDIT_CLIENT_ID"),
    clientSecret: config.get("REDDIT_CLIENT_SECRET"),
    refreshToken: config.get("REDDIT_REFRESH_TOKEN")
  });
  const post = await scraper.getPost();
  console.log(post);

  const generator = new Generator(config.get("GOOGLE_APPLICATION_CREDENTIALS"));
  await generator.generate(post);
})();
