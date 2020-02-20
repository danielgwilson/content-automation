import snoowrap from "snoowrap";
import { IPost, IPostComment } from "../types/post";
import { Gildings } from "snoowrap/dist/objects/VoteableContent";
import { saveObjectToJson } from "../util";

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
    outputDir,
    subredditName,
    postIndex = 0,
    minWords = 3 * 600,
    maxReplyDepth = 0,
    maxRepliesPerComment = 0,
    sort = { type: "hot" },
    saveOutputToFile = false
  }: {
    outputDir: string;
    subredditName: string;
    postIndex?: number;
    minWords?: number;
    maxReplyDepth?: number;
    maxRepliesPerComment?: number;
    sort?:
      | { type: "hot" }
      | {
          type: "top";
          time: "hour" | "day" | "week" | "month" | "year" | "all";
        };
    saveOutputToFile?: boolean;
  }): Promise<IPost> {
    const subreddit = this.r.getSubreddit(subredditName);
    const posts =
      sort.type === "hot"
        ? await subreddit.getHot({ limit: postIndex + 1 })
        : await subreddit.getTop({ time: sort.time, limit: postIndex + 1 });
    const topPost = posts[postIndex];

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

    const post = {
      id,

      dateCrawled: new Date(),

      outputDir,
      subredditName,
      postIndex,
      minWords,
      sort,

      subredditIconURI: await subreddit.icon_img,
      title,
      score,
      upvoteRatio: upvote_ratio,
      author: author.name,
      numComments: num_comments,
      comments: await getCleanComments(comments, {
        minWords,
        maxReplyDepth,
        maxRepliesPerComment
      }),
      gildings
    } as IPost;

    if (saveOutputToFile)
      saveObjectToJson(post, {
        fileName: `${id}.${post.dateCrawled.toISOString()}.crawler.json`,
        outputDir
      });

    return post;
  }
}

async function getCleanComments(
  comments: snoowrap.Listing<snoowrap.Comment>,
  {
    minWords,
    maxReplyDepth = 0,
    maxRepliesPerComment = 0
  }: { minWords: number; maxReplyDepth?: number; maxRepliesPerComment?: number }
) {
  const cleanComments: {
    author: string;
    score: number;
    body: string;
    body_html: string;
    gildings: Gildings;
  }[] = [];

  const commentBatchSize = 10;
  let nWords = 0;
  let nextComments = comments;

  while (nWords < minWords) {
    nextComments = await nextComments.fetchMore({
      amount: commentBatchSize
    });

    const commentBatch = nextComments.slice(cleanComments.length);
    for (let comment of commentBatch) {
      const cleanComment = getCleanComment(comment, {
        maxReplyDepth,
        maxRepliesPerComment
      });
      cleanComments.push(cleanComment);

      nWords += getWordCountForCleanComment(cleanComment);
      if (nWords >= minWords) break;
    }
  }
  return cleanComments;
}

function getCleanComment(
  comment: snoowrap.Comment,
  {
    maxReplyDepth = 0,
    maxRepliesPerComment = 0
  }: { maxReplyDepth?: number; maxRepliesPerComment?: number } = {}
): IPostComment {
  return {
    author: comment.author.name,
    score: comment.score,
    body: comment.body,
    body_html: comment.body_html,
    gildings: comment.gildings,
    replies:
      maxReplyDepth > 0
        ? comment.replies
            .slice(0, maxRepliesPerComment)
            .map(reply =>
              getCleanComment(reply, {
                maxReplyDepth: maxReplyDepth - 1,
                maxRepliesPerComment
              })
            )
        : []
  };
}

function getWordCountForCleanComment(comment: IPostComment): number {
  return (
    getWordCountForString(comment.body) +
    comment.replies
      .map(reply => getWordCountForCleanComment(reply))
      .reduce((a, b) => a + b, 0)
  );
}

function getWordCountForString(str: string) {
  return str.trim().split(/\s+/).length;
}

function getWordCountForStrings(arr: string[]) {
  return arr.map(str => getWordCountForString(str)).reduce((a, b) => a + b, 0);
}
