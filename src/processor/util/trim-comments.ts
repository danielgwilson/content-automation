import { IPost, IPostComment } from "../../types";

export function trimnComments() {}

export function trimComments(
  post: IPost,
  options: {
    maxRepliesPerComment?: number;
    maxReplyDepth?: number;
    maxComments?: number;
  } = {}
): IPost {
  const { maxComments } = options;
  const { comments, ...postPart } = post;
  let trimmedComments = [...comments];

  // Remove excess comments beyond maxComments
  if (maxComments !== undefined && maxComments >= 0) {
    trimmedComments = trimmedComments.slice(0, maxComments);
  }

  // Remove comments by AutoModerator
  trimmedComments = trimmedComments.filter(
    (comment) => comment.author !== "AutoModerator"
  );

  trimmedComments = trimmedComments.map((comment) => {
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

  if (maxReplyDepth === undefined || maxReplyDepth >= 1) {
    const trimmedReplies =
      maxRepliesPerComment !== undefined
        ? replies.slice(0, maxRepliesPerComment)
        : replies;

    return trimmedReplies.map((reply) => {
      const { replies, ...replyPart } = reply;

      return {
        ...replyPart,
        replies: trimReplies(replies, {
          maxRepliesPerComment,
          maxReplyDepth: maxReplyDepth ? maxReplyDepth - 1 : undefined,
        }),
      };
    });
  }

  return [];
}
