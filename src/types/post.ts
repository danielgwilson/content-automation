export interface Post {
  id: string;
  title: string;
  score: number;
  comments: {
    score: number;
    body: string;
    body_html: string;
  }[];
}

export interface ProcessedPost {
  post: Post;
  sections: PostSection[];
}

export interface PostSection {
  type: "title" | "comment";
  fragments: {
    text: string;
    audio: {
      fileName: string;
      length: number;
    };
  }[];
}
