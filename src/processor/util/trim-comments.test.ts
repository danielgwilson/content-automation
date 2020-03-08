import { trimComments } from "./trim-comments";
const samplePost = require("../../tests/sample-post.json");

describe("Trim Comments", () => {
  it("Does nothing with no options", () => {
    const trimmedPost = trimComments(samplePost);
    expect(trimmedPost).toMatchObject(samplePost);
  });

  it("Trims excess replies", () => {
    const trimmedPost = trimComments(samplePost, {
      maxCommentDepth: 3,
      maxRepliesPerComment: 2
    });
    expect(trimmedPost).toMatchSnapshot();
  });
});
