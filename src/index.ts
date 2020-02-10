import fs from "fs";
import path from "path";
import config from "config";
import Scraper from "./scraper/scraper";
import Generator from "./generator/generator";

(async () => {
  const outputDir = path.join(__dirname, "/temp/");

  const scraper = new Scraper({
    userAgent: config.get("REDDIT_USER_AGENT"),
    clientId: config.get("REDDIT_CLIENT_ID"),
    clientSecret: config.get("REDDIT_CLIENT_SECRET"),
    refreshToken: config.get("REDDIT_REFRESH_TOKEN")
  });
  const post = await scraper.getPost({
    outputDir,
    subredditName: "AskReddit",
    postIndex: 2,
    minWords: 2.6 * 60 * 10,
    sort: "top",
    time: "week"
  });

  fs.writeFileSync(path.join(outputDir, "output.json"), post);

  console.log(`\n----------`);
  console.log(`Title: ${post.title}`);
  console.log(`Score: ${post.score}`);
  console.log(`ID: ${post.id}`);
  console.log(
    `\nComments:${post.comments.map((comment, i) => {
      return "\n" + (i + 1) + " - " + comment.body.substr(0, 20) + "...";
    })}\n`
  );
  console.log(`Author: ${post.author}`);
  console.log(`Upvote Ratio: ${post.upvoteRatio}`);
  console.log(`Number of Comments: ${post.numComments}`);

  const generator = new Generator(config.get("GOOGLE_APPLICATION_CREDENTIALS"));
  await generator.generate(post);
})();
