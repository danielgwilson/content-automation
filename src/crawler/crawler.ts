import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getPost, getPostsFromSubreddit } from "./reddit/get-post";
import { IContext, IPost, IPostComment, ICrawlOptions } from "../types";
import { saveObjectToJson } from "../util";

export default class {
  context: IContext;
  constructor(context: IContext) {
    this.context = context;
  }

  async getPost(options: ICrawlOptions = {}): Promise<IPost> {
    if (!options.postId)
      throw new Error("You must call getPost() with a valid postId.");

    const post = await getPost(options.postId, options, this.context);

    const { saveOutputToFile } = this.context;
    if (saveOutputToFile) this.saveToFile(post);

    return post;
  }

  async getPostsFromSubreddit(options: ICrawlOptions = {}): Promise<IPost[]> {
    const posts = await getPostsFromSubreddit(options, this.context);

    const { saveOutputToFile } = this.context;
    if (saveOutputToFile) posts.map(async post => this.saveToFile(post));

    return posts;
  }

  async saveToFile(post: IPost) {
    const subDir = `/${post.id}/`;
    const outputDir = path.join(this.context.outputDir, subDir);
    const fileName = `${post.id}.crawler.json`;
    await saveObjectToJson(post, {
      fileName,
      outputDir
    });
    console.log(`Saved output to file named ${fileName}`);
  }
}

// async function getCleanComments(
//   comments: snoowrap.Listing<snoowrap.Comment>,
//   {
//     minWords,
//     maxReplyDepth = 0,
//     maxRepliesPerComment = 0
//   }: { minWords: number; maxReplyDepth?: number; maxRepliesPerComment?: number }
// ): Promise<IPostComment[]> {
//   const cleanComments: IPostComment[] = [];

//   const commentBatchSize = 20;
//   let nWords = 0;
//   let nextComments = comments;

//   while (nWords < minWords) {
//     nextComments = await nextComments.fetchMore({
//       amount: commentBatchSize
//     });

//     const commentBatch = nextComments.slice(cleanComments.length);
//     for (let comment of commentBatch) {
//       const cleanComment = getCleanComment(comment, {
//         maxReplyDepth,
//         maxRepliesPerComment
//       });
//       cleanComments.push(cleanComment);

//       nWords += getWordCountForCleanComment(cleanComment);
//       if (nWords >= minWords) break;
//     }
//   }
//   return cleanComments;
// }

// function getCleanComment(
//   comment: snoowrap.Comment,
//   {
//     maxReplyDepth = 0,
//     maxRepliesPerComment = 0
//   }: { maxReplyDepth?: number; maxRepliesPerComment?: number } = {}
// ): IPostComment {
//   return {
//     author: comment.author.name,
//     score: comment.score,
//     body: comment.body,
//     gildings: comment.gildings,
//     replies:
//       maxReplyDepth > 0
//         ? comment.replies.slice(0, maxRepliesPerComment).map(reply =>
//             getCleanComment(reply, {
//               maxReplyDepth: maxReplyDepth - 1,
//               maxRepliesPerComment
//             })
//           )
//         : []
//   };
// }

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
