import snoowrap from "snoowrap";
import { IPost } from "../types/post";

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
  ): Promise<IPost> {
    const subreddit = this.r.getSubreddit(subredditName);
    const posts = await subreddit.getHot();
    const topPost = posts[postIndex];

    const {
      id,
      title,
      score,
      author,
      num_comments,
      comments,
      upvote_ratio
    } = topPost;

    const topComments = await comments.fetchMore({ amount: nComments });
    const cleanComments = topComments.map(comment => {
      return {
        author: comment.author.name,
        score: comment.score,
        body: comment.body,
        body_html: comment.body_html,
        gildings: comment.gildings
      };
    });

    return {
      id,
      title,
      subredditName,
      score,
      upvoteRatio: upvote_ratio,
      author: author.name,
      numComments: num_comments,
      comments: cleanComments
    };
  }
}
