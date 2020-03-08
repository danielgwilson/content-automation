export interface IPost {
  id: string;
  dateCrawled: Date;
  words: number;

  context: import("./context").IContext;
  options: ICrawlOptions;

  details: IPostDetails;
  comments: IPostComment[];
}

export interface ICrawlOptions {
  postId?: string;

  subredditName?: string;
  postIndex?: number;
  nPosts?: number;

  sort?:
    | { type: "hot" }
    | {
        type: "top";
        time: "hour" | "day" | "week" | "month" | "year" | "all";
      };
}

export interface IPostDetails {
  postId: string;
  subreddit: ISubreddit;
  title: string;
  score: number;
  upvoteRatio: number;
  author: string;
  numComments: number;
  gildings: IGildings;
}

export interface IPostComment {
  author: string;
  score: number;
  body: string;
  gildings: IGildings;
  replies: IPostComment[];
}

export interface ISubreddit {
  name: string;
  iconUri: string;
}

export interface IGildings {
  silver?: number;
  gold?: number;
  platinum?: number;
}
