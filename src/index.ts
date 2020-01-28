import config from "config";
import Scraper from "./scraper/scraper";

(async () => {
  const scraper = new Scraper({
    userAgent: config.get("REDDIT_USER_AGENT"),
    clientId: config.get("REDDIT_CLIENT_ID"),
    clientSecret: config.get("REDDIT_CLIENT_SECRET"),
    refreshToken: config.get("REDDIT_REFRESH_TOKEN")
  });
  const post = await scraper.getPost();
  console.log(post);
})();
