import path from "path";
import snoowrap from "snoowrap";
import { v4 as uuidv4 } from "uuid";
import { IContext, IPost, IPostComment, ICrawlOptions } from "../types";
import { saveObjectToJson } from "../util";
import { IPostDetails } from "../types/post";

export default class {
  context: IContext;
  private r: snoowrap;
  constructor(
    context: IContext,
    {
      userAgent,
      clientId,
      clientSecret,
      refreshToken
    }: {
      userAgent: string;
      clientId: string;
      clientSecret: string;
      refreshToken: string;
    }
  ) {
    this.context = context;
    this.r = new snoowrap({
      userAgent,
      clientId,
      clientSecret,
      refreshToken
    });
    this.r.config({
      requestDelay: 25, // 40/sec
      continueAfterRatelimitError: true
    });
  }

  async getPost(options: ICrawlOptions = {}): Promise<IPost> {
    let targetPost: snoowrap.Submission;
    if (options.postId) {
      // @ts-ignore - necessary due to snoowrap await / then bug
      const submission = await this.r.getSubmission(options.postId).fetch();
      targetPost = submission;
    } else {
      const {
        subredditName = "AskReddit",
        postIndex = 0,
        sort = { type: "hot" } as { type: "hot" }
      } = options;

      const subreddit = this.r.getSubreddit(subredditName);
      const posts =
        sort.type === "hot"
          ? await subreddit.getHot({ limit: postIndex + 1 })
          : await subreddit.getTop({ time: sort.time, limit: postIndex + 1 });

      // @ts-ignore - necessary due to snoowrap await / then bug
      targetPost = await posts[postIndex].fetch();
    }

    return await this.parsePost(targetPost, options);
  }

  private async parsePost(post: snoowrap.Submission, options: ICrawlOptions) {
    const {
      id,
      title,
      score,
      author,
      num_comments,
      comments,
      upvote_ratio,
      gildings
    } = post;
    const {
      subredditName = "AskReddit",
      minWords = 2.6 * 60 * 20,
      maxReplyDepth = 0,
      maxRepliesPerComment = 0
    } = options;

    const cleanComments = await getCleanComments(comments, {
      minWords,
      maxReplyDepth,
      maxRepliesPerComment
    });
    const words = cleanComments
      .map(cleanComment => getWordCountForCleanComment(cleanComment))
      .reduce((a, b) => a + b);
    const details = {
      postId: id,
      subredditName,
      subredditIconURI: await post.subreddit.icon_img, // need to await this - snoowrap has REALLY BAD promise consistency :/
      title,
      score,
      upvoteRatio: upvote_ratio,
      author: author.name,
      numComments: num_comments,
      gildings
    } as IPostDetails;

    const result = {
      id: uuidv4(),
      dateCrawled: new Date(),
      words,

      context: this.context,
      options,

      details,
      comments: cleanComments
    } as IPost;

    const { saveOutputToFile } = this.context;
    if (saveOutputToFile) {
      const subDir = `/${result.id}/`;
      const outputDir = path.join(this.context.outputDir, subDir);
      const fileName = `${result.id}.crawler.json`;
      await saveObjectToJson(result, {
        fileName,
        outputDir
      });
      console.log(`Saved output to file named ${fileName}`);
    }

    return result;
  }
}

async function getCleanComments(
  comments: snoowrap.Listing<snoowrap.Comment>,
  {
    minWords,
    maxReplyDepth = 0,
    maxRepliesPerComment = 0
  }: { minWords: number; maxReplyDepth?: number; maxRepliesPerComment?: number }
): Promise<IPostComment[]> {
  const cleanComments: IPostComment[] = [];

  const commentBatchSize = 20;
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
        ? comment.replies.slice(0, maxRepliesPerComment).map(reply =>
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
