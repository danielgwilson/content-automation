export interface IPost {
  id: string;
  dateCrawled: Date;

  context: import("./context").IContext;
  options: ICrawlOptions;

  details: IPostDetails;
  comments: IPostComment[];
}

export interface ICrawlOptions {
  subredditName?: string;
  postIndex?: number;
  minWords?: number;
  maxReplyDepth?: number;
  maxRepliesPerComment?: number;
  sort?:
    | { type: "hot" }
    | {
        type: "top";
        time: "hour" | "day" | "week" | "month" | "year" | "all";
      };
}

export interface IPostDetails {
  postId: string;
  subredditName: string;
  subredditIconURI: string;
  title: string;
  score: number;
  upvoteRatio: number;
  author: string;
  numComments: number;
  gildings: import("snoowrap/dist/objects/VoteableContent").Gildings;
}

export interface IPostComment {
  author: string;
  score: number;
  body: string;
  body_html: string;
  gildings: import("snoowrap/dist/objects/VoteableContent").Gildings;
  replies: IPostComment[];
}
