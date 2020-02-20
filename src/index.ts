import fs from "fs";
import path from "path";
import config from "config";
import Crawler from "./crawler/crawler";
import Processor from "./processor/processor";
import Generator from "./generator/generator";

(async () => {
  const outputDir = path.join(__dirname, "/temp/");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const resourceDir = path.join(__dirname, "/resources/");
  if (!fs.existsSync(resourceDir)) {
    fs.mkdirSync(resourceDir);
  }

  const crawler = new Crawler({
    userAgent: config.get("REDDIT_USER_AGENT"),
    clientId: config.get("REDDIT_CLIENT_ID"),
    clientSecret: config.get("REDDIT_CLIENT_SECRET"),
    refreshToken: config.get("REDDIT_REFRESH_TOKEN")
  });
  const minMinutes = 3;
  const post = await crawler.getPost({
    outputDir,
    subredditName: "AskReddit",
    postIndex: 0,
    minWords: 2.6 * 60 * minMinutes,
    maxReplyDepth: 2,
    maxRepliesPerComment: 2,
    sort: { type: "top", time: "week" },
    saveOutputToFile: true
  });

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

  const processor = new Processor({
    outputDir,
    GOOGLE_APPLICATION_CREDENTIALS: config.get("GOOGLE_APPLICATION_CREDENTIALS")
  });
  const processedPost = await processor.process(post, {
    saveOutputToFile: true
  });

  const generator = new Generator({ outputDir, resourceDir });
  await generator.generate(processedPost, {
    saveOutputToFile: true,
    debug: true
  });
})();
