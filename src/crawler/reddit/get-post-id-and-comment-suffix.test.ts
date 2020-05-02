import { getPostIdAndCommentSuffix } from "./get-post-id-and-comment-suffix";

describe("postId and commentSuffix", () => {
  it("Gets postId and commentSuffix from URI with trailing slash", () => {
    const postUri =
      "https://www.reddit.com/r/AskReddit/comments/g7p1lt/theres_a_population_of_75_billion_humans_and_19/foj4hmb/?utm_source=share&utm_medium=web2x";
    const { postId, commentSuffix } = getPostIdAndCommentSuffix(postUri);
    expect(postId).toEqual("g7p1lt");
    expect(commentSuffix).toEqual(
      "/theres_a_population_of_75_billion_humans_and_19/foj4hmb"
    );
  });

  it("Gets postId and commentSuffix from URI with trailing question mark", () => {
    const postUri =
      "https://www.reddit.com/r/AskReddit/comments/g7p1lt/theres_a_population_of_75_billion_humans_and_19/foj4hmb?utm_source=share&utm_medium=web2x";
    const { postId, commentSuffix } = getPostIdAndCommentSuffix(postUri);
    expect(postId).toEqual("g7p1lt");
    expect(commentSuffix).toEqual(
      "/theres_a_population_of_75_billion_humans_and_19/foj4hmb"
    );
  });
});
