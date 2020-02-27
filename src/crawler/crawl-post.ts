import config from "config";
import Crawler from "./crawler";
import { IContext, ICrawlOptions } from "../types";

export async function crawlPost(
  context: IContext,
  {
    subredditName,
    postIndex,
    minWords,
    maxReplyDepth,
    maxRepliesPerComment,
    sort
  }: ICrawlOptions = {}
) {
  const crawler = new Crawler(context, {
    userAgent: config.get("REDDIT_USER_AGENT"),
    clientId: config.get("REDDIT_CLIENT_ID"),
    clientSecret: config.get("REDDIT_CLIENT_SECRET"),
    refreshToken: config.get("REDDIT_REFRESH_TOKEN")
  });

  const post = await crawler.getPost({
    subredditName,
    postIndex,
    minWords,
    maxReplyDepth,
    maxRepliesPerComment,
    sort
  });

  console.log(`\n----------`);
  console.log(`Title: ${post.details.title}`);
  console.log(`Score: ${post.details.score}`);
  console.log(`ID: ${post.id}`);
  console.log(`\nTop-level comments:`);
  console.log(
    ...post.comments.map((comment, i) => {
      // Get start of comment text without new lines
      const text = comment.body.substr(0, 20).replace(/\r?\n|\r/g, " ");
      return `
      ${i + 1} - ${text}...`;
    })
  );
  console.log();
  console.log(`Author: ${post.details.author}`);
  console.log(`Upvote ratio: ${post.details.upvoteRatio}`);
  console.log(`Number of comments: ${post.details.numComments}`);

  return post;
}
