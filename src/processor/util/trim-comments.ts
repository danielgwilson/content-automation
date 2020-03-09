import { IPost, IPostComment } from "../../types";

export function trimnComments() {}

export function trimComments(
  post: IPost,
  options: { maxRepliesPerComment?: number; maxReplyDepth?: number } = {}
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
  options: { maxRepliesPerComment?: number; maxReplyDepth?: number } = {}
): IPostComment[] {
  const { maxRepliesPerComment, maxReplyDepth } = options;

  if (maxReplyDepth === undefined || maxReplyDepth > 1) {
    const trimmedReplies = maxRepliesPerComment
      ? replies.slice(0, maxRepliesPerComment)
      : replies;

    return trimmedReplies.map(reply => {
      const { replies, ...replyPart } = reply;

      return {
        ...replyPart,
        replies: trimReplies(replies, {
          maxRepliesPerComment,
          maxReplyDepth: maxReplyDepth ? maxReplyDepth - 1 : undefined
        })
      };
    });
  }

  return [];
}
