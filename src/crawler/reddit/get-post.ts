import url from "url";
import Post from "./post";
import { fetchPostJson, fetchPostJsonsForSubreddit } from "./fetch-post";
import { parsePost } from "./parse-post";
import { ICrawlOptions, IContext } from "../../types";
import { getSubreddit } from "./subreddit";
import { getPostIdAndCommentSuffix } from "./get-post-id-and-comment-suffix";

export async function getPost(options: ICrawlOptions, context: IContext) {
  const { postId, postUri } = options;

  let postJson: any;
  if (postUri) {
    const queryParams = url.parse(postUri, true).query;
    if (options.sort && options.sort.type === "top") queryParams.sort = "top";

    const { postId: id, commentSuffix } = getPostIdAndCommentSuffix(postUri);

    postJson = await fetchPostJson(id, { commentSuffix, queryParams });
  } else if (postId) {
    postJson = await fetchPostJson(postId);
  } else {
    throw new Error(
      "You must call getPost() with either a valid postUri or postId."
    );
  }
  const parsedPost = parsePost(postJson);

  const subreddit = await getSubreddit(parsedPost.link.subredditName);
  return new Post(subreddit, parsedPost, options, context);
}

export async function getPostsFromSubreddit(
  options: ICrawlOptions,
  context: IContext
) {
  const { subredditName = "AskReddit", sort = { type: "hot" } } = options;
  const postJsons = await fetchPostJsonsForSubreddit(subredditName, sort.type, {
    limit: options.nPosts,
    t: sort.type === "top" ? sort.time : "day",
  });
  const parsedPosts = postJsons.map((postJson) => parsePost(postJson));

  const subreddit = await getSubreddit(subredditName);

  const posts = parsedPosts.map(
    (parsedPost) => new Post(subreddit, parsedPost, options, context)
  );
  return posts;
}
