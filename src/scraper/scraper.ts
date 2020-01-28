import snoowrap from "snoowrap";

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

  async getPost() {
    const subreddit = this.r.getSubreddit("AskReddit");
    const posts = await subreddit.getHot();
    const topPost = posts[0];

    const { title, score, comments } = topPost;

    const topComments = await comments.fetchMore({ amount: 10 });
    const cleanComments = topComments.map(comment => {
      return {
        score: comment.score,
        body: comment.body,
        body_html: comment.body_html
      };
    });

    return { title, score, comments: cleanComments };
  }
}
