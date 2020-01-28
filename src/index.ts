import config from "config";
import snoowrap from "snoowrap";

const r = new snoowrap({
  userAgent: config.get("REDDIT_USER_AGENT"),
  clientId: config.get("REDDIT_CLIENT_ID"),
  clientSecret: config.get("REDDIT_CLIENT_SECRET"),
  refreshToken: config.get("REDDIT_REFRESH_TOKEN")
});

r.getHot().then(posts => posts.map(post => console.log(post.title)));
