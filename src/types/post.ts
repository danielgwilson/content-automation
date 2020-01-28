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
