import { IPost, IPostComment, IProcessedPostOptions } from "../../types";

export function trimnComments() {}

export function trimComments(
  post: IPost,
  options: { maxRepliesPerComment?: number; maxCommentDepth?: number } = {}
): IPost {
  const { comments, ...postPart } = post;
  const trimmedComments = comments.map(comment => {
    const { replies, ...commentPart } = comment;
    const trimmedReplies = trimReplies(replies, options);
    return { ...commentPart, replies: trimmedReplies } as IPostComment;
  });

  return { ...postPart, comments: trimmedComments };
}

export function trimReplies(
  replies: IPostComment[],
  options: { maxRepliesPerComment?: number; maxCommentDepth?: number } = {}
): IPostComment[] {
  const { maxRepliesPerComment, maxCommentDepth } = options;

  if (maxCommentDepth === undefined || maxCommentDepth > 1) {
    const trimmedReplies = maxRepliesPerComment
      ? replies.slice(0, maxRepliesPerComment)
      : replies;

    return trimmedReplies.map(reply => {
      const { replies, ...replyPart } = reply;

      return {
        ...replyPart,
        replies: trimReplies(replies, {
          maxRepliesPerComment,
          maxCommentDepth: maxCommentDepth ? maxCommentDepth - 1 : undefined
        })
      };
    });
  }

  return [];
}
