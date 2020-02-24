import config from "config";
import Crawler from "../crawler/crawler";
import { IContext } from "../types";

export async function crawlPost(
  context: IContext,
  {
    subredditName = "AskReddit",
    postIndex = 0,
    minWords = 2.6 * 60 * 20,
    maxReplyDepth = 2,
    maxRepliesPerComment = 2,
    sort = { type: "top", time: "week" }
  }: {
    subredditName?: string;
    postIndex?: number;
    minWords?: number;
    maxReplyDepth?: number;
    maxRepliesPerComment?: number;
    sort?:
      | { type: "hot" }
      | {
          type: "top";
          time: "week" | "hour" | "day" | "month" | "year" | "all";
        };
  } = {}
) {
  const { outputDir, saveOutputToFile } = context;

  const crawler = new Crawler({
    userAgent: config.get("REDDIT_USER_AGENT"),
    clientId: config.get("REDDIT_CLIENT_ID"),
    clientSecret: config.get("REDDIT_CLIENT_SECRET"),
    refreshToken: config.get("REDDIT_REFRESH_TOKEN")
  });

  const post = await crawler.getPost({
    outputDir,
    subredditName,
    postIndex,
    minWords,
    maxReplyDepth,
    maxRepliesPerComment,
    sort,
    saveOutputToFile
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

  return post;
}
