import fs from "fs";
import request from "request";
import path from "path";
import snoowrap from "snoowrap";
import { IPost } from "../types/post";
import { Gildings } from "snoowrap/dist/objects/VoteableContent";

export default class {
  private r: snoowrap;
  constructor({
    userAgent,
    clientId,
    clientSecret,
    refreshToken
  }: {
    userAgent: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  }) {
    this.r = new snoowrap({
      userAgent,
      clientId,
      clientSecret,
      refreshToken
    });
  }

  async getPost({
    subredditName = "AskReddit",
    postIndex = 0,
    minWords = 3 * 600,
    sort = "hot",
    time = undefined
  }: {
    subredditName?: string;
    postIndex?: number;
    minWords?: number;
    sort?: "hot" | "top";
    time?: "hour" | "day" | "week" | "month" | "year" | "all";
  } = {}): Promise<IPost> {
    const subreddit = this.r.getSubreddit(subredditName);
    const posts =
      sort === "hot"
        ? await subreddit.getHot({ limit: postIndex + 1 })
        : await subreddit.getTop({ time, limit: postIndex + 1 });
    const topPost = posts[postIndex];

    const targetDir = path.join(__dirname, "/../", "./temp/");
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }
    await fetchAndSaveFile(
      await subreddit.icon_img,
      path.join(targetDir, "subreddit-icon.png")
    );

    const {
      id,
      title,
      score,
      author,
      num_comments,
      comments,
      upvote_ratio,
      gildings
    } = topPost;

    const cleanComments: {
      author: string;
      score: number;
      body: string;
      body_html: string;
      gildings: Gildings;
    }[] = [];
    const commentBatchSize = 10;
    let nWords = 0;
    let nextComments = await comments.fetchMore({
      amount: commentBatchSize,
      skipReplies: true,
      append: false
    });
    while (nWords < minWords) {
      nextComments = await nextComments.fetchMore({
        amount: commentBatchSize,
        skipReplies: true,
        append: false
      });
      for (let comment of nextComments) {
        cleanComments.push({
          author: comment.author.name,
          score: comment.score,
          body: comment.body,
          body_html: comment.body_html,
          gildings: comment.gildings
        });

        nWords += getWordCountForString(comment.body);

        if (nWords >= minWords) break;
      }
    }
    console.log(
      getWordCountForStrings(cleanComments.map(comment => comment.body))
    );

    return {
      id,
      title,
      subredditName,
      score,
      upvoteRatio: upvote_ratio,
      author: author.name,
      numComments: num_comments,
      comments: cleanComments,
      gildings
    };
  }
}

function getWordCountForString(str: string) {
  return str.trim().split(/\s+/).length;
}

function getWordCountForStrings(arr: string[]) {
  return arr.map(str => getWordCountForString(str)).reduce((a, b) => a + b);
}

async function fetchAndSaveFile(uri: string, filename: string) {
  return new Promise(resolve => {
    request.head(uri, function(err, res, body) {
      request(uri)
        .pipe(fs.createWriteStream(filename))
        .on("close", () => {
          return resolve();
        });
    });
  });
}
