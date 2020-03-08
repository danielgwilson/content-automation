import { IPostComment, IGildings } from "../../types";

export interface IParsedPost {
  link: IParsedLink;
  comments: IPostComment[];
}
export function parsePost(postJson: any) {
  const listings = postJson;
  const link = listings[0].data.children[0];
  const comments = listings[1].data.children;

  return {
    link: parseLink(link),
    comments: parseComments(comments)
  } as IParsedPost;
}

interface IParsedLink {
  postId: string;
  title: string;
  subredditName: string;
  score: number;
  upvoteRatio: number;
  author: string;
  numComments: number;
  gildings: IGildings;
}
function parseLink(link: any) {
  const { data } = link;

  return {
    postId: data.id,
    title: data.title,
    subredditName: data.subreddit,
    score: data.score,
    upvoteRatio: data.upvote_ratio,
    author: data.author,
    numComments: data.num_comments,
    gildings: parseGildings(data.gildings)
  } as IParsedLink;
}

function parseComments(comments: any[]): IPostComment[] {
  return comments
    .filter(comment => comment.kind === "t1")
    .map(comment => {
      const { data } = comment;
      const { author, score, body, gildings, replies } = data;

      return {
        author,
        score,
        body,
        gildings: parseGildings(gildings),
        replies: replies.data ? parseComments(replies.data.children) : []
      } as IPostComment;
    });
}

function parseGildings(gildings: any) {
  return {
    silver: gildings.gid_1 as number,
    gold: gildings.gid_2 as number,
    platinum: gildings.gid_3 as number
  } as IGildings;
}
