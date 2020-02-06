import { Gildings } from "snoowrap/dist/objects/VoteableContent";

export interface IPost {
  id: string;
  title: string;
  subredditName: string;
  score: number;
  upvoteRatio: number;
  author: string;
  numComments: number;
  comments: {
    author: string;
    score: number;
    body: string;
    body_html: string;
    gildings: Gildings;
  }[];
}

export interface IProcessedPost {
  post: IPost;
  sections: IPostSection[];
}

export interface IPostSection {
  type: "title" | "comment";

  fragments: {
    text: string;
    textWithPriors: string;
    audio: {
      filePath: string;
      fileName: string;
      length: number;
    };
  }[];
  length: number;

  subredditName: string;
  author: string;
  numComments: number;
  score: number;
  upvoteRatio?: number;
}
