export interface IPost {
  id: string;
  title: string;
  score: number;
  comments: {
    score: number;
    body: string;
    body_html: string;
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
}
