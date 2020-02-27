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
  }

  async getPost(options: ICrawlOptions): Promise<IPost> {
    const { saveOutputToFile } = this.context;
    const {
      subredditName = "AskReddit",
      postIndex = 0,
      minWords = 2.6 * 60 * 20,
      maxReplyDepth = 0,
      maxRepliesPerComment = 0,
      sort = { type: "hot" } as { type: "hot" }
    } = options;

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
      subredditIconURI: await subreddit.icon_img,
      title,
      score,
      upvoteRatio: upvote_ratio,
      author: author.name,
      numComments: num_comments,
      gildings
    } as IPostDetails;

    const post = {
      id: uuidv4(),
      dateCrawled: new Date(),
      words,

      context: this.context,
      options,

      details,
      comments: cleanComments
    } as IPost;

    if (saveOutputToFile) {
      const subDir = `/${post.id}/`;
      const outputDir = path.join(this.context.outputDir, subDir);
      const fileName = `${post.id}.crawler.json`;
      await saveObjectToJson(post, {
        fileName,
        outputDir
      });
      console.log(`Saved output to file named ${fileName}`);
    }

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
