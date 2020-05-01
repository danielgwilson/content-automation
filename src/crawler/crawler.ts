import path from "path";
import { getPost, getPostsFromSubreddit } from "./reddit/get-post";
import { IContext, IPost, ICrawlOptions } from "../types";
import { saveObjectToJson } from "../util";

export default class {
  context: IContext;
  constructor(context: IContext) {
    this.context = context;
  }

  async getPost(options: ICrawlOptions = {}): Promise<IPost> {
    const post = await getPost(options, this.context);

    const { saveOutputToFile } = this.context;
    if (saveOutputToFile) this.saveToFile(post);

    return post;
  }

  async getPostsFromSubreddit(options: ICrawlOptions = {}): Promise<IPost[]> {
    const posts = await getPostsFromSubreddit(options, this.context);

    const { saveOutputToFile } = this.context;
    if (saveOutputToFile) posts.map(async (post) => this.saveToFile(post));

    return posts;
  }

  async saveToFile(post: IPost) {
    const subDir = `/${post.id}/`;
    const outputDir = path.join(this.context.outputDir, subDir);
    const fileName = `${post.id}.crawler.json`;
    await saveObjectToJson(post, {
      fileName,
      outputDir,
    });
    console.log(`Saved output to file named ${fileName}`);
  }
}
