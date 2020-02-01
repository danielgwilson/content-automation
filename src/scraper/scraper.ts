import snoowrap from "snoowrap";
import { Post } from "../types/post";

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

  async getPost(
    {
      subredditName,
      postIndex,
      nComments
    }: {
      subredditName: string;
      postIndex: number;
      nComments: number;
    } = { subredditName: "AskReddit", postIndex: 0, nComments: 10 }
  ): Promise<Post> {
    const subreddit = this.r.getSubreddit(subredditName);
    const posts = await subreddit.getHot();
    const topPost = posts[postIndex];

    const { id, title, score, comments } = topPost;

    const topComments = await comments.fetchMore({ amount: nComments });
    const cleanComments = topComments.map(comment => {
      return {
        score: comment.score,
        body: comment.body,
        body_html: comment.body_html
      };
    });

    return { id, title, score, comments: cleanComments };
  }
}
