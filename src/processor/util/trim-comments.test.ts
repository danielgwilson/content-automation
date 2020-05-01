import { trimComments } from "./trim-comments";
const samplePost = require("../../tests/sample-post.json");

describe("Trim Comments", () => {
  it("Does nothing with no options", () => {
    const trimmedPost = trimComments(samplePost);
    expect(trimmedPost).toMatchObject(samplePost);
  });

  it("Trims excess replies", () => {
    const trimmedPost = trimComments(samplePost, {
      maxReplyDepth: 3,
      maxRepliesPerComment: 2,
    });
    expect(trimmedPost).toMatchSnapshot();
  });

  it("Trims excess comments", () => {
    const trimmedPost = trimComments(samplePost, {
      maxReplyDepth: 0,
      maxRepliesPerComment: 0,
      maxComments: 1,
    });
    expect(trimmedPost).toMatchSnapshot();
  });
});
