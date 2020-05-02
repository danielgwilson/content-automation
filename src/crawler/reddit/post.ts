import { v4 as uuidv4 } from "uuid";
import {
  IPost,
  IContext,
  ICrawlOptions,
  IPostDetails,
  IPostComment,
  ISubreddit
} from "../../types";
import { IParsedPost } from "./parse-post";

export default class Post implements IPost {
  id: string;
  dateCrawled: Date;
  words: number;

  context: IContext;
  options: ICrawlOptions;

  details: IPostDetails;
  comments: IPostComment[];

  constructor(
    subreddit: ISubreddit,
    parsedPost: IParsedPost,
    options: ICrawlOptions,
    context: IContext
  ) {
    const { link, comments } = parsedPost;
    const { subredditName, ...linkPart } = link;

    this.id = uuidv4();
    this.dateCrawled = new Date();
    this.words = getWordCountForComments(comments);

    this.context = context;
    this.options = options;

    this.details = {
      ...linkPart,
      subreddit
    } as IPostDetails;
    this.comments = comments;
  }
}

function getWordCountForComments(comments: IPostComment[]): number {
  return comments
    .map(
      comment =>
        getWordCountForString(comment.body) +
        getWordCountForComments(comment.replies)
    )
    .reduce((a, b) => a + b, 0);
}

function getWordCountForString(str: string) {
  return str.trim().split(/\s+/).length;
}
