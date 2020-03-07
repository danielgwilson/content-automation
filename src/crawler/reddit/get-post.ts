import Post from "./post";
import { fetchPostJson, fetchPostJsonsForSubreddit } from "./fetch-post";
import { parsePost } from "./parse-post";
import { ICrawlOptions, IContext } from "../../types";
import { getSubreddit } from "./subreddit";

export async function getPost(
  postId: string,
  options: ICrawlOptions,
  context: IContext
) {
  const postJson = await fetchPostJson(postId);
  const parsedPost = parsePost(postJson);

  const subreddit = await getSubreddit(parsedPost.link.subredditName);
  return new Post(subreddit, parsedPost, options, context);
}

export async function getPostsFromSubreddit(
  options: ICrawlOptions,
  context: IContext
) {
  const {
    subredditName = "AskReddit",
    postIndex = 0,
    sort = { type: "hot" }
  } = options;
  const postJsons = await fetchPostJsonsForSubreddit(subredditName, sort.type, {
    limit: options.nPosts,
    t: sort.type === "top" ? sort.time : "day"
  });
  const parsedPosts = postJsons.map(postJson => parsePost(postJson));

  const subreddit = await getSubreddit(subredditName);

  const posts = parsedPosts.map(
    parsedPost => new Post(subreddit, parsedPost, options, context)
  );
  return posts;
}
