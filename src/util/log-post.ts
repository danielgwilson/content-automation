import { IPost } from "../types";

export function logPost(post: IPost) {
  console.log(`\n----------`);
  console.log(`Title: ${post.details.title}`);
  console.log(`Score: ${post.details.score}`);
  console.log(`ID: ${post.id}`);
  console.log(`\nTop-level comments:`);
  console.log(
    ...post.comments.map((comment, i) => {
      // Get start of comment text without new lines
      const text = comment.body.substr(0, 20).replace(/\r?\n|\r/g, " ");
      return `
      ${i + 1} - ${text}...`;
    })
  );
  console.log();
  console.log(`Author: ${post.details.author}`);
  console.log(`Upvote ratio: ${post.details.upvoteRatio}`);
  console.log(`Number of comments: ${post.details.numComments}`);
}
