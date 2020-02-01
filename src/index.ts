import config from "config";
import Scraper from "./scraper/scraper";
import Generator from "./generator/generator";

import mockPost from "./tests/mock-post";

(async () => {
  // const scraper = new Scraper({
  //   userAgent: config.get("REDDIT_USER_AGENT"),
  //   clientId: config.get("REDDIT_CLIENT_ID"),
  //   clientSecret: config.get("REDDIT_CLIENT_SECRET"),
  //   refreshToken: config.get("REDDIT_REFRESH_TOKEN")
  // });
  // const post = await scraper.getPost({
  //   subredditName: "AskReddit",
  //   postIndex: 1,
  //   nComments: 10
  // });
  const post = mockPost;
  console.log(`\n----------`);
  console.log(`Title: ${post.title}`);
  console.log(`Score: ${post.score}`);
  console.log(`ID: ${post.id}`);
  console.log(
    `\nComments:${post.comments.map((comment, i) => {
      return "\n" + (i + 1) + " - " + comment.body.substr(0, 20) + "...";
    })}\n`
  );

  const generator = new Generator(config.get("GOOGLE_APPLICATION_CREDENTIALS"));
  await generator.generate(post);
})();
